const { default: axios } = require('axios');
const { baseUrl } = require('../config');

const auth = {
  verifyToken: (accessToken) => axios.post(`${baseUrl}/auth/verify-token`, {
    accessToken,
  }),
};

const user = {
  getUsers: (id, Authorization) => axios.get(`${baseUrl}/user?id=${id.toString()}`, {
    headers: {
      Authorization,
    },
  }).then((response) => response.data),
};

const tag = {
  getPostTags: (id, Authorization) => axios.get(`${baseUrl}/tag/post/${id.toString()}`, {
    headers: {
      Authorization,
    },
  }).then((response) => response.data),
  createPostTags: (id, tags, Authorization) => axios
    .post(`${baseUrl}/tag/post/${id.toString()}`, {
      tags,
    }, {
      headers: {
        Authorization,
      },
    })
    .then((response) => response.data)
    .catch(() => []),
  editPostTags: (id, tags, Authorization) => axios
    .put(`${baseUrl}/tag/post/${id.toString()}`, {
      tags,
    }, {
      headers: {
        Authorization,
      },
    })
    // .catch(() => [])
    .then((response) => response.data),
  deletePostTags: (id, Authorization) => axios
    .delete(`${baseUrl}/tag/post/${id.toString()}`, {
      headers: {
        Authorization,
      },
    })
    .then((response) => response.data)
    .catch(() => []),
};

module.exports = {
  auth,
  user,
  tag,
};
