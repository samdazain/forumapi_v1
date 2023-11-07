const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthTestHelper = require('../../../../tests/AuthTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('/threads endpoint', () => {
  beforeAll(async () => {
    // Insert new user to users table (Owner of new thread)
    await UsersTableTestHelper.addUser({}); // id of user-123
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 401 and error message if not authenticated', async () => {
      // Arrange
      const requestPayload = {
        title: 'thread title',
        body: 'thread body',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const { error, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(message).toEqual('Missing authentication');
      expect(error).toEqual('Unauthorized');
    });

    it('should response 201 and persisted thread if authenticated', async () => {
      // Arrange
      const requestPayload = {
        title: 'thread title',
        body: 'thread body',
      };
      const server = await createServer(container);
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const { status, data } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(status).toEqual('success');
      expect(data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'thread title',
        // body prop not provided
      };
      const server = await createServer(container);
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const { status, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(status).toEqual('fail');
      expect(message).toEqual('title dan body harus diisi');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'thread title',
        body: true, // invalid body type, should be string
      };
      const server = await createServer(container);
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('title dan body harus string');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread details if thread is found', async () => {
      // Arrange
      // Insert thread and comment
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await CommentsTableTestHelper.addComment({
        id: 'comment-234',
        userId: 'user-123',
        isDelete: true,
        date: '2023-01-02T00:00:00',
      });

      const server = await createServer(container);
      const threadId = 'thread-123';

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const { status, data: { thread } } = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(status).toBe('success');
      expect(thread).toStrictEqual({
        id: 'thread-123',
        title: 'thread title',
        body: 'thread body',
        date: '2023-01-01 00:00:00',
        username: 'dicoding',
        comments: [
          {
            id: 'comment-123',
            username: 'dicoding',
            date: '2023-01-01 00:00:00',
            content: 'comment content',
            replies: [],
          },
          {
            id: 'comment-234',
            username: 'dicoding',
            date: '2023-01-02 00:00:00',
            content: '**komentar telah dihapus**',
            replies: [],
          },
        ],
      });
    });

    it('should response 404 when thread is not found', async () => {
      // Arrange
      // Insert thread and comment
      await ThreadsTableTestHelper.addThread({});

      const server = await createServer(container);
      const threadId = 'thread-456'; // not existing thread id

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const { status, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(status).toEqual('fail');
      expect(message).toBeDefined();
    });
  });
});
