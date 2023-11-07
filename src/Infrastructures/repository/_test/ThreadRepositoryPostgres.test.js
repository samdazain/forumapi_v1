const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('ThreadRepositoryPostgres', () => {
  beforeAll(async () => {
    // Insert new user to users table (Owner of new thread)
    await UsersTableTestHelper.addUser({}); // id of user-123
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist create thread and return created thread correctly', async () => {
      // Arrange
      const createThread = new CreateThread({
        title: 'thread title',
        body: 'thread body',
      });
      const userId = 'user-123';
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(userId, createThread);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(thread).toHaveLength(1);
    });
  });

  describe('findThreadById function', () => {
    it('should return thread if thread with given id is found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});
      const threadId = 'thread-123';

      // Insert thread to table with id of "thread-123"
      await ThreadsTableTestHelper.addThread({});

      // Action
      const thread = await threadRepositoryPostgres.findThreadById(threadId);
      expect(thread).toBeDefined();
      expect(thread.id).toBe(threadId);
    });

    it('should return undefined if thread with given id not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});
      const threadId = 'thread-123';

      // Action
      const thread = await threadRepositoryPostgres.findThreadById(threadId);
      expect(thread).not.toBeDefined();
    });
  });

  describe('getThreadDetails function', () => {
    it('should return thread details if thread with given id is found', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({});

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});
      const threadId = 'thread-123';

      // Action
      const thread = await threadRepositoryPostgres.getThreadDetails(threadId);

      // Assert
      expect(thread).toStrictEqual({
        id: 'thread-123',
        title: 'thread title',
        body: 'thread body',
        date: '2023-01-01 00:00:00',
        username: 'dicoding',
      });
    });
  });
});
