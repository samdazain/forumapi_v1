const ReplyDetails = require('../ReplyDetails');

describe('a ReplyDetails entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'user-123',
      date: '2023-01-01T12:00:00.000Z',
      is_delete: false,
      // content prop not provided
    };

    // Action and assert
    expect(() => new ReplyDetails(payload)).toThrowError(
      'REPLY_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'user-123',
      date: '2023-01-01T12:00:00.000Z',
      is_delete: 'abc', // invalid prop type, should be boolean
      content: 123, // invalid prop type, should be string
    };

    // Action and assert
    expect(() => new ReplyDetails(payload)).toThrowError(
      'REPLY_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create ReplyDetails object with expected props', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'user-123',
      date: '2023-01-01T12:00:00.000Z',
      is_delete: false,
      content: 'reply content',
    };

    // Action
    const {
      id, username, date, content,
    } = new ReplyDetails(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
  });

  it('should create ReplyDetails object with expected props if is delete is true', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'user-123',
      date: '2023-01-01T12:00:00.000Z',
      is_delete: true,
      content: 'reply content',
    };

    // Action
    const {
      id, username, date, content,
    } = new ReplyDetails(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual('**balasan telah dihapus**');
  });
});
