const CommentDetails = require('../CommentDetails');

describe('a CommentDetails entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'user-123',
      date: '2023-01-01T12:00:00.000Z',
      is_delete: false,
      // content prop not provided
    };

    // Action and assert
    expect(() => new CommentDetails(payload)).toThrowError(
      'COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'user-123',
      date: '2023-01-01T12:00:00.000Z',
      is_delete: 'abc', // invalid prop type, should be boolean
      content: 123, // invalid prop type, should be string
    };

    // Action and assert
    expect(() => new CommentDetails(payload)).toThrowError(
      'COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create CommentDetails object with expected props', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'username 1',
      date: '2023-01-01T12:00:00.000Z',
      is_delete: false,
      content: 'comment content',
    };
    const mockReplies = [{ id: 'reply-123', content: 'reply content', owner: 'user-123' }];

    // Action
    const {
      id, username, date, content, replies,
    } = new CommentDetails(
      payload,
      mockReplies,
    );

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
    expect(replies).toEqual(mockReplies);
  });

  it('should create CommentDetails object with expected props if replies is not provided', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'username 1',
      date: '2023-01-01T12:00:00.000Z',
      is_delete: false,
      content: 'comment content',
    };

    // Action
    const {
      id, username, date, content, replies,
    } = new CommentDetails(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
    expect(replies).toHaveLength(0);
  });

  it('should create CommentDetails object with expected props if is delete is true', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'user-123',
      date: '2023-01-01T12:00:00.000Z',
      is_delete: true,
      content: 'comment content',
    };
    const mockReplies = [{ id: 'reply-123', content: 'reply content', owner: 'user-123' }];

    // Action
    const {
      id, username, date, content, replies,
    } = new CommentDetails(
      payload,
      mockReplies,
    );

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual('**komentar telah dihapus**');
    expect(replies).toEqual(mockReplies);
  });
});
