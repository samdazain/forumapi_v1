const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('ThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'thread title',
      body: 'thread body',
    };
    const userId = 'user-123';

    const mockCreatedThread = new CreatedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: userId,
    });

    // Create dependency of use case
    const mockThreadRepository = new ThreadRepository();

    // Mock needed function
    mockThreadRepository.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockCreatedThread));

    // Create use case instance
    const addThreadUseCase = new AddThreadUseCase({ threadRepository: mockThreadRepository });

    // Action
    const createdThread = await addThreadUseCase.execute(userId, useCasePayload);

    // Assert
    expect(createdThread).toStrictEqual(
      new CreatedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        owner: userId,
      }),
    );

    expect(mockThreadRepository.addThread).toBeCalledWith(
      userId,
      new CreateThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
      }),
    );
  });
});
