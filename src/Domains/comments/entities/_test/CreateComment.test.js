const CreateComment = require('../CreateComment');

describe('a CreateComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      // content prop not provided
      threadId: 'thread-123',
    };

    // Action and assert
    expect(() => new CreateComment(payload)).toThrowError(
      'CREATE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
      threadId: true,
    };

    // Action and assert
    expect(() => new CreateComment(payload)).toThrowError(
      'CREATE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create CreateComment object with expected props', () => {
    // Arrange
    const payload = {
      content: 'thread comment',
      threadId: 'thread-123',
    };

    // Action
    const { content, threadId } = new CreateComment(payload);

    // Assert
    expect(content).toEqual(payload.content);
    expect(threadId).toEqual(payload.threadId);
  });
});
