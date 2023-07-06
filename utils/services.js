const { default: axios } = require('axios');
const { baseUrl } = require('../config');

const auth = {
  verifyToken: (accessToken) => axios.post(`${baseUrl}/auth/verify-token`, {
    accessToken,
  }),
};

module.exports = {
  auth,
};
