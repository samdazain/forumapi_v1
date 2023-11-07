const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const DeleteReply = require('../../../Domains/replies/entities/DeleteReply');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 'reply-123',
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
    const mockReply = {
      id: useCasePayload.replyId,
      owner: userId,
    };

    // Create dependency of use case
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mock needed function
    mockThreadRepository.findThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    mockCommentRepository.findCommentById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComment));

    mockReplyRepository.findReplyById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReply));

    mockReplyRepository.deleteReply = jest.fn().mockImplementation(() => Promise.resolve());

    // Create use case instance
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteReplyUseCase.execute(userId, useCasePayload);

    // Assert
    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.threadId);

    expect(mockCommentRepository.findCommentById).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.threadId,
    );
    expect(mockReplyRepository.findReplyById).toBeCalledWith(
      useCasePayload.replyId,
      useCasePayload.commentId,
    );
    expect(mockReplyRepository.deleteReply).toBeCalledWith(
      userId,
      new DeleteReply(
        mockReply,
        {
          replyId: useCasePayload.replyId,
          commentId: useCasePayload.commentId,
        },
        userId,
      ),
    );
  });

  it('should throw not found error if thread is not found on delete reply', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 'reply-123',
      threadId: 'thread-456', // not existing thread id
      commentId: 'comment-123',
    };
    const userId = 'user-123';

    // Create dependency of use case
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Create use case instance
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Mock needed function
    mockThreadRepository.findThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(undefined));

    // Action and assert
    await expect(deleteReplyUseCase.execute(userId, useCasePayload)).rejects.toThrowError(
      `Thread dengan id '${useCasePayload.threadId}' tidak ditemukan!`,
    );

    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.threadId);
  });

  it('should throw not found error if comment is not found on delete reply', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 'reply-123',
      threadId: 'thread-123',
      commentId: 'comment-456', // not existing comment id
    };
    const userId = 'user-123';
    const mockThread = {
      id: useCasePayload.threadId,
      owner: userId,
    };

    // Create dependency of use case
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Create use case instance
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Mock needed function
    mockThreadRepository.findThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    mockCommentRepository.findCommentById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(undefined));

    // Action and assert
    await expect(deleteReplyUseCase.execute(userId, useCasePayload)).rejects.toThrowError(
      `Komentar dengan id '${useCasePayload.commentId}' pada id thread '${useCasePayload.threadId}' tidak ditemukan!`,
    );

    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.threadId);

    expect(mockCommentRepository.findCommentById).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.threadId,
    );
  });

  it('should throw not found error if reply is not found on delete reply', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 'reply-456', // not existing reply id
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
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Create use case instance
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Mock needed function
    mockThreadRepository.findThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    mockCommentRepository.findCommentById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComment));

    mockReplyRepository.findReplyById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(undefined));

    // Action and assert
    await expect(deleteReplyUseCase.execute(userId, useCasePayload)).rejects.toThrowError(
      `Balasan dengan id '${useCasePayload.replyId}' pada id komentar '${useCasePayload.commentId}' tidak ditemukan!`,
    );

    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.threadId);

    expect(mockCommentRepository.findCommentById).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.threadId,
    );

    expect(mockReplyRepository.findReplyById).toBeCalledWith(
      useCasePayload.replyId,
      useCasePayload.commentId,
    );
  });

  it('should throw authorization error if user is not owner of the reply', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 'reply-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const userId = 'user-456'; // not reply owner id
    const mockThread = {
      id: useCasePayload.threadId,
      owner: userId,
    };
    const mockComment = {
      id: useCasePayload.commentId,
      owner: userId,
    };
    const mockReply = {
      id: useCasePayload.replyId,
      owner: 'user-123',
    };

    // Create dependency of use case
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Create use case instance
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Mock needed function
    mockThreadRepository.findThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    mockCommentRepository.findCommentById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComment));

    mockReplyRepository.findReplyById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReply));

    // Action and assert
    await expect(deleteReplyUseCase.execute(userId, useCasePayload)).rejects.toThrowError(
      'Gagal menghapus balasan, akses ditolak!',
    );

    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.threadId);

    expect(mockCommentRepository.findCommentById).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.threadId,
    );

    expect(mockReplyRepository.findReplyById).toBeCalledWith(
      useCasePayload.replyId,
      useCasePayload.commentId,
    );
  });
});
