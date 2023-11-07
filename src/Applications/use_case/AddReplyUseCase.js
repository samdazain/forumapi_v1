const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CreateReply = require('../../Domains/replies/entities/CreateReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePayload) {
    const { threadId, commentId, content } = useCasePayload;

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

    const createReply = new CreateReply({ commentId, content });
    const reply = await this._replyRepository.addReply(userId, createReply);

    return reply;
  }
}

module.exports = AddReplyUseCase;
