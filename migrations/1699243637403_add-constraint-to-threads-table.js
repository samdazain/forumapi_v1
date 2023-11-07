/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.addConstraint(
    'threads',
    'fk_threads.owner_and_users.id',
    'FOREIGN KEY(owner) REFERENCES users(id)',
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint('threads', 'fk_threads.owner_and_users.id');
};
