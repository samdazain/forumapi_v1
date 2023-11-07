const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');
const CreateComment = require('../../../Domains/comments/entities/CreateComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'comment content',
      threadId: 'thread-123',
    };
    const userId = 'user-123';

    const mockCreatedComment = new CreatedComment({
      id: 'comment-123',
      content: 'comment content',
      owner: 'user-123',
    });

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

    mockCommentRepository.addComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockCreatedComment));

    // Create use case instance
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdComment = await addCommentUseCase.execute(userId, useCasePayload);

    // Assert
    expect(createdComment).toStrictEqual(
      new CreatedComment({
        id: 'comment-123',
        content: useCasePayload.content,
        owner: userId,
      }),
    );

    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.threadId);

    expect(mockCommentRepository.addComment).toBeCalledWith(
      userId,
      new CreateComment({
        content: useCasePayload.content,
        threadId: useCasePayload.threadId,
      }),
    );
  });

  it('should throw not found error if thread is not found on add comment', async () => {
    // Arrange
    const useCasePayload = {
      content: 'comment content',
      threadId: 'thread-456', // not existing thread
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
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action and assert
    await expect(addCommentUseCase.execute(userId, useCasePayload)).rejects.toThrowError(
      `Thread dengan id '${useCasePayload.threadId}' tidak ditemukan!`,
    );

    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.threadId);
  });
});
