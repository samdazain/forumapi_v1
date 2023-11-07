const DeleteComment = require('../DeleteComment');

describe('a DeleteComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const existingComment = {};
    const userId = 'user-123';
    const payload = {
      threadId: 'thread-123',
      // commentId prop not provided
    };

    // Action and assert
    expect(() => new DeleteComment(existingComment, payload, userId)).toThrowError(
      'DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const existingComment = {};
    const userId = 'user-123';
    const payload = {
      threadId: 'thread-123',
      commentId: 123, // invalid type, shouldd be string
    };

    // Action and assert
    expect(() => new DeleteComment(existingComment, payload, userId)).toThrowError(
      'DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create DeleteComment object with expected props', () => {
    // Arrange
    const userId = 'user-123';
    const existingComment = {
      owner: userId,
    };
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    // Action
    const { commentId, threadId } = new DeleteComment(existingComment, payload, userId);

    // Assert
    expect(commentId).toEqual(payload.commentId);
    expect(threadId).toEqual(payload.threadId);
  });

  it('should throw not found error if existing comment is not provided', () => {
    // Arrange
    const userId = 'user-123';
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    // Action and assert
    expect(() => new DeleteComment(undefined, payload, userId)).toThrowError(
      `Komentar dengan id '${payload.commentId}' pada id thread '${payload.threadId}' tidak ditemukan!`,
    );
  });

  it('should throw authorization error if user id and existing comment owner id is not match', () => {
    // Arrange
    const userId = 'user-456';
    const existingComment = {
      owner: 'user-123',
    };
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    // Action and assert
    expect(() => new DeleteComment(existingComment, payload, userId)).toThrowError(
      'Gagal menghapus komentar, akses ditolak!',
    );
  });
});
