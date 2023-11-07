const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const DeleteComment = require('../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePayload) {
    const { threadId, commentId } = useCasePayload;

    // Validate thread is exist
    const thread = await this._threadRepository.findThreadById(threadId);

    if (!thread) {
      throw new NotFoundError(`Thread dengan id '${threadId}' tidak ditemukan!`);
    }

    // Get existing comment
    const existingComment = await this._commentRepository.findCommentById(commentId, threadId);
    const deleteComment = new DeleteComment(existingComment, useCasePayload, userId);

    await this._commentRepository.deleteComment(userId, deleteComment);
  }
}

module.exports = DeleteCommentUseCase;
