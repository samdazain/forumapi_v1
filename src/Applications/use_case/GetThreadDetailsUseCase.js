const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReplyDetails = require('../../Domains/replies/entities/ReplyDetails');
const CommentDetails = require('../../Domains/comments/entities/CommentDetails');

class GetThreadDetailsUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;

    // Check if thread exist
    const thread = await this._threadRepository.findThreadById(threadId);

    if (!thread) {
      throw new NotFoundError(`Thread dengan id '${threadId}' tidak ditemukan!`);
    }

    const threadDetails = await this._threadRepository.getThreadDetails(threadId);
    const threadComments = await this._commentRepository.getThreadComments(threadId);

    // Map comments and replies data
    const structuredComments = threadComments.map((comment) => {
      const replies = comment.replies.map((reply) => new ReplyDetails(reply));

      return new CommentDetails(comment, replies);
    });

    return {
      ...threadDetails,
      comments: structuredComments,
    };
  }
}

module.exports = GetThreadDetailsUseCase;
