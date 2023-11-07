const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const userId = 'user-123';
    const mockThread = {
      id: useCasePayload.threadId,
      owner: userId,
    };
    const mockComment = {
      id: useCasePayload.commentId,
      owner: userId,
    };

    // Create dependency of use case
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mock needed function
    mockThreadRepository.findThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    mockCommentRepository.findCommentById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComment));

    mockCommentRepository.deleteComment = jest.fn().mockImplementation(() => Promise.resolve());

    // Create use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute(userId, useCasePayload);

    // Assert
    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.threadId);

    expect(mockCommentRepository.findCommentById).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.threadId,
    );

    expect(mockCommentRepository.deleteComment).toBeCalledWith(
      userId,
      new DeleteComment(
        mockThread,
        {
          threadId: useCasePayload.threadId,
          commentId: useCasePayload.commentId,
        },
        userId,
      ),
    );
  });

  it('should throw not found error if thread is not found on delete comment', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-456', // not existing thread
      commentId: 'comment-123',
    };
    const userId = 'user-123';

    // Create dependency of use case
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mock needed function
    mockThreadRepository.findThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(undefined));

    // Create use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action and assert
    await expect(deleteCommentUseCase.execute(userId, useCasePayload)).rejects.toThrowError(
      `Thread dengan id '${useCasePayload.threadId}' tidak ditemukan!`,
    );

    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.threadId);
  });

  it('should throw not found error if comment is not found on delete comment', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-456', // not existing comment
    };
    const userId = 'user-123';
    const mockThread = {
      id: useCasePayload.threadId,
      owner: userId,
    };

    // Create dependency of use case
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mock needed function
    mockThreadRepository.findThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.findCommentById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(undefined));

    // Create use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action and assert
    await expect(deleteCommentUseCase.execute(userId, useCasePayload)).rejects.toThrowError(
      `Komentar dengan id '${useCasePayload.commentId}' pada id thread '${useCasePayload.threadId}' tidak ditemukan!`,
    );

    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.threadId);

    expect(mockCommentRepository.findCommentById).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.threadId,
    );
  });

  it('should throw authorization error if user is not owner of the comment', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const userId = 'user-456'; // not comment owner
    const mockThread = {
      id: useCasePayload.threadId,
      owner: userId,
    };
    const mockComment = {
      id: useCasePayload.commentId,
      owner: 'user-123',
    };

    // Create dependency of use case
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mock needed function
    mockThreadRepository.findThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    mockCommentRepository.findCommentById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComment));

    // Create use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action and assert
    await expect(deleteCommentUseCase.execute(userId, useCasePayload)).rejects.toThrowError(
      'Gagal menghapus komentar, akses ditolak!',
    );

    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.threadId);

    expect(mockCommentRepository.findCommentById).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.threadId,
    );
  });
});
