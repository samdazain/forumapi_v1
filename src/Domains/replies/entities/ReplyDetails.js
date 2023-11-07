/* eslint-disable no-tabs */
/* eslint-disable camelcase */
class ReplyDetails {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, is_delete,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = is_delete ? '**balasan telah dihapus**' : content;
  }

  _verifyPayload({
    id, username, date, content, is_delete,
  }) {
    if (!id || !username || !date || !content) {
      throw new Error('REPLY_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
			|| typeof username !== 'string'
			|| typeof date !== 'string'
			|| typeof content !== 'string'
			|| typeof is_delete !== 'boolean'
    ) {
      throw new Error('REPLY_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ReplyDetails;
