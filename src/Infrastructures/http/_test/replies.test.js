const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const AuthTestHelper = require('../../../../tests/AuthTestHelper');

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
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 and error message if not authenticated', async () => {
      // Arrange
      const requestPayload = {
        content: 'reply content',
      };
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
      });

      // Assert
      const { error, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(message).toEqual('Missing authentication');
      expect(error).toEqual('Unauthorized');
    });

    it('should response 201 and persisted reply if authenticated', async () => {
      // Arrange
      // Create thread and comment
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});

      const requestPayload = {
        content: 'reply content',
      };
      const server = await createServer(container);
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const { status, data } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(status).toEqual('success');
      expect(data.addedReply).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      // Create thread and comment
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});

      const requestPayload = {
        // content prop not provided
      };
      const server = await createServer(container);
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
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
      // Create thread and comment
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});

      const requestPayload = {
        content: 123, // invalid type, should be string
      };
      const server = await createServer(container);
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
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
        content: 'reply content',
      };
      const server = await createServer(container);
      const threadId = 'thread-456';
      const commentId = 'comment-456';
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
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

    it('should response 404 when comment is not found', async () => {
      // Arrange
      // Create thread
      await ThreadsTableTestHelper.addThread({});
      // * not creating any comment to trigger not found error

      const requestPayload = {
        content: 'reply content',
      };
      const server = await createServer(container);
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
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

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 401 and error message if not authenticated', async () => {
      // Arrange
      // Insert thread, comment, and reply
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});

      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      });

      // Assert
      const { error, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(message).toEqual('Missing authentication');
      expect(error).toEqual('Unauthorized');
    });

    it('should response 200 and persisted delete reply if authenticated', async () => {
      // Arrange
      // Insert thread, comment, and reply
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});

      const server = await createServer(container);
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const { status } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(status).toEqual('success');

      const replies = await RepliesTableTestHelper.findRepliesById(replyId);
      expect(replies[0].is_delete).toBe(true);
    });

    it('should response 403 if user is not owner of the reply', async () => {
      // Arrange
      // Insert thread, comment, and reply
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});

      const server = await createServer(container);
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const accessToken = await AuthTestHelper.getAccessToken({
        username: 'invalid',
        id: 'user-456',
      }); // not owner id

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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
      // Insert thread, comment, and reply
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});

      const server = await createServer(container);
      const threadId = 'thread-456'; // not existing thread id
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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
      // Insert thread, comment, and reply
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});

      const server = await createServer(container);
      const threadId = 'thread-123';
      const commentId = 'comment-456'; // not existing comment id
      const replyId = 'reply-123';
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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

    it('should response 404 when reply is not found', async () => {
      // Arrange
      // Insert thread, comment, and reply
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});

      const server = await createServer(container);
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-456'; // not existing reply id
      const accessToken = await AuthTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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
