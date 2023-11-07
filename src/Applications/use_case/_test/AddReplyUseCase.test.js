const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CreatedReply = require('../../../Domains/replies/entities/CreatedReply');
const CreateReply = require('../../../Domains/replies/entities/CreateReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'reply content',
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

    const mockCreatedReply = new CreatedReply({
      id: 'reply-123',
      content: 'reply content',
      owner: 'user-123',
    });

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

    mockReplyRepository.addReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockCreatedReply));

    // Create use case instance
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdReply = await addReplyUseCase.execute(userId, useCasePayload);

    // Assert
    expect(createdReply).toStrictEqual(
      new CreatedReply({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: userId,
      }),
    );

    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.threadId);

    expect(mockCommentRepository.findCommentById).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.threadId,
    );

    expect(mockReplyRepository.addReply).toBeCalledWith(
      userId,
      new CreateReply({
        content: useCasePayload.content,
        commentId: useCasePayload.commentId,
      }),
    );
  });

  it('should throw not found error if thread is not found on add reply', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-456', // not existing thread id
      commentId: 'comment-123',
      content: 'reply content',
    };
    const userId = 'user-123';

    // Create dependency of use case
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Create use case instance
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Mock needed function
    mockThreadRepository.findThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(undefined));

    // Action and assert
    await expect(addReplyUseCase.execute(userId, useCasePayload)).rejects.toThrowError(
      `Thread dengan id '${useCasePayload.threadId}' tidak ditemukan!`,
    );

    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.threadId);
  });

  it('should throw not found error if comment is not found on add reply', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-456', // not existing comment id
      content: 'reply content',
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
    const addReplyUseCase = new AddReplyUseCase({
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
    await expect(addReplyUseCase.execute(userId, useCasePayload)).rejects.toThrowError(
      `Komentar dengan id '${useCasePayload.commentId}' pada id thread '${useCasePayload.threadId}' tidak ditemukan!`,
    );

    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.threadId);

    expect(mockCommentRepository.findCommentById).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.threadId,
    );
  });
});
