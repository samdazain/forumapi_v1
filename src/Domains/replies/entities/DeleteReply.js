const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

class DeleteReply {
  constructor(existingReply, payload, userId) {
    this._verifyPayload(existingReply, payload, userId);

    const { commentId, replyId } = payload;

    this.commentId = commentId;
    this.replyId = replyId;
  }

  _verifyPayload(existingReply, payload, userId) {
    const { commentId, replyId } = payload;

    if (!commentId || !replyId) {
      throw new Error('DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof commentId !== 'string' || typeof replyId !== 'string') {
      throw new Error('DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    // Check if comment exist
    if (!existingReply) {
      throw new NotFoundError(
        `Balasan dengan id '${replyId}' pada id komentar '${commentId}' tidak ditemukan!`,
      );
    }

    // Validate comment owner
    if (existingReply.owner !== userId) {
      throw new AuthorizationError('Gagal menghapus balasan, akses ditolak!');
    }
  }
}

module.exports = DeleteReply;
