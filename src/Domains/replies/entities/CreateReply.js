class CreateReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { commentId, content } = payload;

    this.content = content;
    this.commentId = commentId;
  }

  _verifyPayload({ content, commentId }) {
    if (!content || !commentId) {
      throw new Error('CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof commentId !== 'string') {
      throw new Error('CREATE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CreateReply;
