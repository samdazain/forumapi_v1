/* eslint-disable no-tabs */
const CommentRepository = require('../../Domains/comments/CommentRepository');
const CreatedComment = require('../../Domains/comments/entities/CreatedComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(userId, createComment) {
    const { content, threadId } = createComment;
    const commentId = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [commentId, threadId, userId, content],
    };

    const result = await this._pool.query(query);

    return new CreatedComment(result.rows[0]);
  }

  async findCommentById(commentId, threadId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async deleteComment(userId, deleteComment) {
    const { threadId, commentId } = deleteComment;

    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE thread_id = $1 AND id = $2 AND owner = $3',
      values: [threadId, commentId, userId],
    };

    await this._pool.query(query);
  }

  async getThreadComments(threadId) {
    const query = {
      text: `
			SELECT 
			c.id, u.username, c.date::text, c.content, c.is_delete,
			(SELECT COALESCE(json_agg(
				json_build_object(
					'id', r.id,
					'is_delete', r.is_delete,
					'content', r.content,
					'date', r.date::text,
					'username', u2.username
				)
				ORDER BY r.date ASC
			), '[]')
			FROM replies r
			JOIN users u2 ON r.owner = u2.id
			WHERE r.comment_id = c.id
			) as replies
		FROM comments c 
		JOIN users u ON c.owner = u.id
		WHERE c.thread_id = $1
		ORDER BY c.date ASC;
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
