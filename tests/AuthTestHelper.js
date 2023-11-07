/* istanbul ignore file */
const Jwt = require('@hapi/jwt');
const JwtTokenManager = require('../src/Infrastructures/security/JwtTokenManager');

const AuthTestHelper = {
  async getAccessToken({ username, id } = { username: 'dicoding', id: 'user-123' }) {
    const jwtTokenManager = new JwtTokenManager(Jwt.token);
    const accessToken = await jwtTokenManager.createAccessToken({
      username,
      id,
    });

    return accessToken;
  },
};

module.exports = AuthTestHelper;
