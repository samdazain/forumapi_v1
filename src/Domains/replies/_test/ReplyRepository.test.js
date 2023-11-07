const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository interface', () => {
  it('should throw error when invokke unimplemented method', async () => {
    // Arrange
    const replyRepository = new ReplyRepository();

    // Action & assert
    await expect(replyRepository.addReply()).rejects.toThrowError(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );

    await expect(replyRepository.findReplyById()).rejects.toThrowError(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );

    await expect(replyRepository.deleteReply()).rejects.toThrowError(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});
