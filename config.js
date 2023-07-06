require('dotenv').config();
const httpError = require('http-errors');

const tokenSecret = process.env.TOKEN_SECRET || 'secret';
const tokenAge = process.env.TOKEN_AGE || '5min';
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'otherSecret';
const refreshTokenAge = process.env.REFRESH_TOKEN_AGE || '10min';
const baseUrl = process.env.BASE_URL || 'http://localhost/api';

module.exports = {
  tokenSecret,
  refreshTokenSecret,
  tokenAge,
  refreshTokenAge,
  httpError,
  baseUrl,
};
