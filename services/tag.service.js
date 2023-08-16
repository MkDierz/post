const { ApiService } = require('./api.service');

class TagService extends ApiService {
  constructor() {
    super('/tag');
  }

  async getPostTags(id) {
    return this.get(`/post/${id.toString()}`);
  }

  async createPostTags(id, tags) {
    return this.post(`/post/${id.toString()}`, { tags });
  }

  async editPostTags(id, tags) {
    return this.put(`/post/${id.toString()}`, { tags });
  }

  async deletePostTags(id) {
    return this.delete(`/post/${id.toString()}`);
  }
}

module.exports = { TagService };
