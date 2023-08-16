const { ApiService } = require('./api.service');

class AuthService extends ApiService {
  constructor() {
    super('/auth');
  }

  async verifyToken() {
    return this.get(`/verify-token?accessToken=${this.defaultHeaders.Authorization.split(' ')[1]}`);
  }
}

module.exports = { AuthService };
