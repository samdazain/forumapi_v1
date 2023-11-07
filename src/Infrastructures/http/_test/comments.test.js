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

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 401 and error message if not authenticated', async () => {
      // Arrange
      const requestPayload = {
        content: 'comment content',
      };
      const threadId = 'thread-123';
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      // Assert
      const { error, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(message).toEqual('Missing authentication');
      expect(error).toEqual('Unauthorized');
    });

    it('should response 201 and persisted comment if authenticated', async () => {
      // Arrange
      // Create thread for testing with id of thread-123
      await ThreadsTableTestHelper.addThread({});

      const requestPayload = {
        content: 'comment content',
      };
      const server = await createServer(container);
      const threadId = 'thread-123';
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const { status, data } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(status).toEqual('success');
      expect(data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      // Create thread for testing with id of thread-123
      await ThreadsTableTestHelper.addThread({});

      const requestPayload = {
        // content prop not provided
      };
      const server = await createServer(container);
      const threadId = 'thread-123';
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const { status, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(status).toEqual('fail');
      expect(message).toBeDefined();
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      // Create thread for testing with id of thread-123
      await ThreadsTableTestHelper.addThread({});

      const requestPayload = {
        content: 123, // invalid type, should be string
      };
      const server = await createServer(container);
      const threadId = 'thread-123';
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const { status, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(status).toEqual('fail');
      expect(message).toBeDefined();
    });

    it('should response 404 when thread is not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'comment content',
      };
      const server = await createServer(container);
      const threadId = 'thread-456';
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const { status, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(status).toEqual('fail');
      expect(message).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 401 and error message if not authenticated', async () => {
      // Arrange
      // Insert thread and comment
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});

      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
      });

      // Assert
      const { error, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(message).toEqual('Missing authentication');
      expect(error).toEqual('Unauthorized');
    });

    it('should response 200 and persisted delete comment if authenticated', async () => {
      // Arrange
      // Insert thread and comment
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});

      const server = await createServer(container);
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const { status } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(status).toEqual('success');

      const comments = await CommentsTableTestHelper.findCommentsById(commentId);
      expect(comments[0].is_delete).toBe(true);
    });

    it('should response 403 if user is not owner of the comment', async () => {
      // Arrange
      // Insert thread and comment
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});

      const server = await createServer(container);
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const accessToken = await AuthTestHelper.getAccessToken({
        username: 'invalid',
        id: 'user-456',
      }); // not owner id

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const { status, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(status).toEqual('fail');
      expect(message).toBeDefined();
    });

    it('should response 404 when thread is not found', async () => {
      // Arrange
      // Insert thread and comment
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});

      const server = await createServer(container);
      const threadId = 'thread-456'; // not existing thread id
      const commentId = 'comment-123';
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const { status, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(status).toEqual('fail');
      expect(message).toBeDefined();
    });

    it('should response 404 when comment is not found', async () => {
      // Arrange
      // Insert thread and comment
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});

      const server = await createServer(container);
      const threadId = 'thread-123';
      const commentId = 'comment-456'; // not existing comment id
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const { status, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(status).toEqual('fail');
      expect(message).toBeDefined();
    });
  });
});
