/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    is_delete: {
      type: 'BOOLEAN',
      default: false,
    },
    date: {
      type: 'TIMESTAMP',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.addConstraint(
    'comments',
    'fk_comments.thread_id_and_threads.id',
    'FOREIGN KEY(thread_id) REFERENCES threads(id)',
  );

  pgm.addConstraint(
    'comments',
    'fk_comments.owner_and_users.id',
    'FOREIGN KEY(owner) REFERENCES users(id)',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('comments', { cascade: true });
};
