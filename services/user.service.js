const { ApiService } = require('./api.service');

class UserService extends ApiService {
  constructor() {
    super('/user');
  }

  async getUsers(id) {
    return this.get(`?id=${id.toString()}`);
  }
}

module.exports = { UserService };
