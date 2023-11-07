const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CreateReply = require('../../../Domains/replies/entities/CreateReply');
const DeleteReply = require('../../../Domains/replies/entities/DeleteReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    // Insert new user to users table (Owner of new thread)
    await UsersTableTestHelper.addUser({}); // id of user-123

    // Insert new thread with id of thread-123
    await ThreadsTableTestHelper.addThread({});

    // Insert new comment with id of comment-123
    await CommentsTableTestHelper.addComment({});
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist create reply and return created reply correctly', async () => {
      // Arrange
      const createReply = new CreateReply({
        commentId: 'comment-123',
        content: 'reply content',
      });
      const userId = 'user-123';
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(userId, createReply);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
    });
  });

  describe('deleteReply function', () => {
    it('should persist delete reply and ran successfully', async () => {
      // Arrange
      // Insert reply to comment-123
      await RepliesTableTestHelper.addReply({});

      const userId = 'user-123';
      const mockReply = {
        id: 'reply-123',
        owner: userId,
      };
      const deleteReply = new DeleteReply(
        mockReply,
        {
          replyId: 'reply-123',
          commentId: 'comment-123',
        },
        userId,
      );
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action
      await replyRepositoryPostgres.deleteReply(userId, deleteReply);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies[0].is_delete).toBe(true);
    });
  });
});
