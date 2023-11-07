const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CreateComment = require('../../../Domains/comments/entities/CreateComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    // Insert new user to users table (Owner of new thread)
    await UsersTableTestHelper.addUser({}); // id of user-123

    // Insert new thread with id of thread-123
    await ThreadsTableTestHelper.addThread({});
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist create comment and return created comment correctly', async () => {
      // Arrange
      const createComment = new CreateComment({
        content: 'comment content',
        threadId: 'thread-123',
      });
      const userId = 'user-123';
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(userId, createComment);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comment).toHaveLength(1);
    });
  });

  describe('findCommentById function', () => {
    it('should return true if comment exist', async () => {
      // Arrange
      // Insert comment with id of "comment-123" to thread "thread-123"
      await CommentsTableTestHelper.addComment({});

      const commentId = 'comment-123';
      const threadId = 'thread-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action
      const comment = await commentRepositoryPostgres.findCommentById(commentId, threadId);

      // Assert
      expect(comment).toBeDefined();
      expect(comment.id).toBe(commentId);
      expect(comment.thread_id).toBe(threadId);
    });

    it('should return false if comment not exist', async () => {
      // Arrange
      const commentId = 'comment-123';
      const threadId = 'thread-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action
      const comment = await commentRepositoryPostgres.findCommentById(commentId, threadId);

      // Assert
      expect(comment).not.toBeDefined();
    });
  });

  describe('deleteComment function', () => {
    it('should persist delete comment ran successfully', async () => {
      // Arrange
      // Insert comment with id of "comment-123" and owner of "user-123"
      await CommentsTableTestHelper.addComment({});

      const userId = 'user-123';
      const mockComment = { id: 'comment-123', owner: userId };
      const deleteComment = new DeleteComment(
        mockComment,
        {
          threadId: 'thread-123',
          commentId: 'comment-123',
        },
        userId,
      );
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action
      await commentRepositoryPostgres.deleteComment(userId, deleteComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments[0].is_delete).toBe(true);
    });
  });

  describe('getThreadComments function', () => {
    it('should return array of thread comments', async () => {
      // Arrange
      // Insert new users
      await UsersTableTestHelper.addUser({ id: 'user-234', username: 'dicoding 2' });

      // Insert multiple comments
      await CommentsTableTestHelper.addComment({});
      await CommentsTableTestHelper.addComment({
        id: 'comment-234',
        userId: 'user-234',
        isDelete: true,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action
      const threadId = 'thread-123';
      const comments = await commentRepositoryPostgres.getThreadComments(threadId);

      // Assert
      expect(comments).toStrictEqual([
        {
          id: 'comment-123',
          username: 'dicoding',
          content: 'comment content',
          is_delete: false,
          replies: [],
          date: '2023-01-01 00:00:00',
        },
        {
          id: 'comment-234',
          username: 'dicoding 2',
          content: 'comment content',
          is_delete: true,
          replies: [],
          date: '2023-01-01 00:00:00',
        },
      ]);
    });
  });

  it('should include replies of each comment', async () => {
    // Arrange
    // Insert new users
    await UsersTableTestHelper.addUser({ id: 'user-234', username: 'dicoding 2' });

    // Insert multiple comments
    await CommentsTableTestHelper.addComment({});
    await CommentsTableTestHelper.addComment({
      id: 'comment-234',
      userId: 'user-234',
      isDelete: true,
    });

    // Insert multiple replies
    await RepliesTableTestHelper.addReply({});
    await RepliesTableTestHelper.addReply({
      id: 'reply-234',
      userId: 'user-234',
      isDelete: true,
    });

    const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

    // Action
    const threadId = 'thread-123';
    const comments = await commentRepositoryPostgres.getThreadComments(threadId);

    // Assert
    expect(comments).toStrictEqual([
      {
        id: 'comment-123',
        username: 'dicoding',
        content: 'comment content',
        is_delete: false,
        replies: [
          {
            id: 'reply-123',
            content: 'reply content',
            username: 'dicoding',
            is_delete: false,
            date: '2023-01-01 00:00:00',
          },
          {
            id: 'reply-234',
            content: 'reply content',
            username: 'dicoding 2',
            is_delete: true,
            date: '2023-01-01 00:00:00',
          },
        ],
        date: '2023-01-01 00:00:00',
      },
      {
        id: 'comment-234',
        username: 'dicoding 2',
        content: 'comment content',
        is_delete: true,
        replies: [],
        date: '2023-01-01 00:00:00',
      },
    ]);
  });
});
