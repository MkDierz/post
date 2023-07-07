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

module.exports = {
  auth,
  user,
};
