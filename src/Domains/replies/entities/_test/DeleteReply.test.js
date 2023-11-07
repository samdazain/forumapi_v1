const DeleteReply = require('../DeleteReply');

describe('a DeleteReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const existingReply = {};
    const userId = 'user-123';
    const payload = {
      commentId: 'comment-123',
      // replyId prop not provided
    };

    // Action and assert
    expect(() => new DeleteReply(existingReply, payload, userId)).toThrowError(
      'DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const existingReply = {};
    const userId = 'user-123';
    const payload = {
      commentId: 'comment-123',
      replyId: 123, // invalid type, shouldd be string
    };

    // Action and assert
    expect(() => new DeleteReply(existingReply, payload, userId)).toThrowError(
      'DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create DeleteReply object with expected props', () => {
    // Arrange
    const userId = 'user-123';
    const existingReply = {
      owner: userId,
    };
    const payload = {
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    // Action
    const { commentId, replyId } = new DeleteReply(existingReply, payload, userId);

    // Assert
    expect(commentId).toEqual(payload.commentId);
    expect(replyId).toEqual(payload.replyId);
  });

  it('should throw not found error if existing reply is not provided', () => {
    // Arrange
    const userId = 'user-123';
    const payload = {
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    // Action and assert
    expect(() => new DeleteReply(undefined, payload, userId)).toThrowError(
      `Balasan dengan id '${payload.replyId}' pada id komentar '${payload.commentId}' tidak ditemukan!`,
    );
  });

  it('should throw authorization error if user id and existing reply owner id is not match', () => {
    // Arrange
    const userId = 'user-456';
    const existingReply = {
      owner: 'user-123',
    };
    const payload = {
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    // Action and assert
    expect(() => new DeleteReply(existingReply, payload, userId)).toThrowError(
      'Gagal menghapus balasan, akses ditolak!',
    );
  });
});
