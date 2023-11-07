const CreateComment = require('../../Domains/comments/entities/CreateComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePayload) {
    // Validate thread is exist
    const { threadId } = useCasePayload;

    const thread = await this._threadRepository.findThreadById(threadId);

    if (!thread) {
      throw new NotFoundError(`Thread dengan id '${threadId}' tidak ditemukan!`);
    }

    const createComment = new CreateComment(useCasePayload);

    return this._commentRepository.addComment(userId, createComment);
  }
}

module.exports = AddCommentUseCase;
