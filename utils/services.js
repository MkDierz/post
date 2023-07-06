const { default: axios } = require('axios');
const { baseUrl } = require('../config');

const auth = {
  verifyToken: (accessToken) => axios.post(`${baseUrl}/auth/verify-token`, {
    accessToken,
  }),
  update: (data, token) => axios.put(`${baseUrl}/auth/update`, {
    ...data,
  }, {
    headers: {
      authorization: token,
    },
  }),
};

module.exports = {
  auth,
};
