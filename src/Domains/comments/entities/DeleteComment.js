const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

class DeleteComment {
  constructor(existingComment, payload, userId) {
    this._verifyPayload(existingComment, payload, userId);

    const { threadId, commentId } = payload;

    this.threadId = threadId;
    this.commentId = commentId;
  }

  _verifyPayload(existingComment, payload, userId) {
    const { commentId, threadId } = payload;

    if (!commentId || !threadId) {
      throw new Error('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof commentId !== 'string' || typeof threadId !== 'string') {
      throw new Error('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    // Check if comment exist
    if (!existingComment) {
      throw new NotFoundError(
        `Komentar dengan id '${commentId}' pada id thread '${threadId}' tidak ditemukan!`,
      );
    }

    // Validate comment owner
    if (existingComment.owner !== userId) {
      throw new AuthorizationError('Gagal menghapus komentar, akses ditolak!');
    }
  }
}

module.exports = DeleteComment;
