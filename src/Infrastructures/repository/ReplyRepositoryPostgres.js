const CreatedReply = require('../../Domains/replies/entities/CreatedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(userId, createReply) {
    const { commentId, content } = createReply;
    const replyId = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [replyId, commentId, userId, content],
    };

    const result = await this._pool.query(query);

    return new CreatedReply({ ...result.rows[0] });
  }

  async findReplyById(replyId, commentId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND comment_id = $2',
      values: [replyId, commentId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async deleteReply(userId, deleteReply) {
    const { replyId, commentId } = deleteReply;

    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE comment_id = $1 AND id = $2 AND owner = $3',
      values: [commentId, replyId, userId],
    };

    await this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;
