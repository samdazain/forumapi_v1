const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const DeleteReply = require('../../Domains/replies/entities/DeleteReply');

class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePayload) {
    const { replyId, commentId, threadId } = useCasePayload;

    // Validate thread is exist
    const thread = await this._threadRepository.findThreadById(threadId);

    if (!thread) {
      throw new NotFoundError(`Thread dengan id '${threadId}' tidak ditemukan!`);
    }

    // Validate comment exist
    const comment = await this._commentRepository.findCommentById(commentId, threadId);

    if (!comment) {
      throw new NotFoundError(
        `Komentar dengan id '${commentId}' pada id thread '${threadId}' tidak ditemukan!`,
      );
    }

    // Validate reply exist
    const existingReply = await this._replyRepository.findReplyById(replyId, commentId);
    const deleteReply = new DeleteReply(existingReply, useCasePayload, userId);

    await this._replyRepository.deleteReply(userId, deleteReply);
  }
}

module.exports = DeleteReplyUseCase;
