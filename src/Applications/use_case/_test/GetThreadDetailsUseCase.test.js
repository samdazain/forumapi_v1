const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadDetailsUseCase = require('../GetThreadDetailsUseCase');

describe('GetThreadDetailsUseCase', () => {
  it('should orchestrating the get thread details action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockThread = {
      id: 'thread-123',
      title: 'thread title',
      body: 'thread body',
      date: '2023-01-01T12:00:00.000Z',
    };

    const mockThreadDetails = {
      ...mockThread,
      username: 'dicoding',
    };

    const mockCommentReplies = [
      {
        id: 'reply-123',
        username: 'dicoding',
        date: '2023-01-01T12:00:00.000Z',
        content: 'sebuah reply',
        is_delete: false,
      },
      {
        id: 'reply-234',
        username: 'dicoding 2',
        date: '2023-01-01T12:00:00.000Z',
        content: 'sebuah reply',
        is_delete: true,
      },
    ];

    const mockThreadComments = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2023-01-01T12:00:00.000Z',
        content: 'sebuah comment',
        replies: mockCommentReplies,
        is_delete: false,
      },
      {
        id: 'comment-234',
        username: 'dicoding 2',
        date: '2023-01-01T12:00:00.000Z',
        content: 'sebuah comment',
        replies: [],
        is_delete: true,
      },
    ];

    // Create dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // Mock needed function
    mockThreadRepository.findThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    mockThreadRepository.getThreadDetails = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThreadDetails));

    mockCommentRepository.getThreadComments = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThreadComments));

    // Create use case instance
    const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const threadDetails = await getThreadDetailsUseCase.execute(useCasePayload);

    // Assert
    expect(threadDetails).toEqual({
      id: 'thread-123',
      username: 'dicoding',
      body: 'thread body',
      date: '2023-01-01T12:00:00.000Z',
      title: 'thread title',
      comments: [
        {
          id: 'comment-123',
          content: 'sebuah comment',
          date: '2023-01-01T12:00:00.000Z',
          username: 'dicoding',
          replies: [
            {
              content: 'sebuah reply',
              date: '2023-01-01T12:00:00.000Z',
              id: 'reply-123',
              username: 'dicoding',
            },
            {
              content: '**balasan telah dihapus**',
              date: '2023-01-01T12:00:00.000Z',
              id: 'reply-234',
              username: 'dicoding 2',
            },
          ],
        },
        {
          id: 'comment-234',
          username: 'dicoding 2',
          content: '**komentar telah dihapus**',
          date: '2023-01-01T12:00:00.000Z',
          replies: [],
        },
      ],
    });

    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.threadId);

    expect(mockThreadRepository.getThreadDetails).toBeCalledWith(useCasePayload.threadId);

    expect(mockCommentRepository.getThreadComments).toBeCalledWith(useCasePayload.threadId);
  });

  it('should throw not found error if thread is not found on get thread details', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    // Create dependency of use case
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mock needed function
    mockThreadRepository.findThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(undefined));

    // Create use case instance
    const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action and assert
    await expect(getThreadDetailsUseCase.execute(useCasePayload)).rejects.toThrowError(
      `Thread dengan id '${useCasePayload.threadId}' tidak ditemukan!`,
    );

    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.threadId);
  });
});
