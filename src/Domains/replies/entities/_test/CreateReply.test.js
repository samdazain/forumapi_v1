const CreateReply = require('../CreateReply');

describe('a CreateReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      // content prop is not provided
    };

    // Action and assert
    expect(() => new CreateReply(payload)).toThrowError('CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      content: 123, // invalid type, should be string
    };

    // Action and assert
    expect(() => new CreateReply(payload)).toThrowError(
      'CREATE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create CreateReply object with expected props', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      content: 'reply content',
    };

    // Action
    const { content, commentId } = new CreateReply(payload);

    // Assert
    expect(content).toEqual(payload.content);
    expect(commentId).toEqual(payload.commentId);
  });
});
