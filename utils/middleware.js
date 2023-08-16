const { httpError } = require('../config');
const { ApiService } = require('../services/api.service');
const { AuthService } = require('../services/auth.service');
const { UserService } = require('../services/user.service');
const { TagService } = require('../services/tag.service');

async function checkToken(req, res, next) {
  const { authorization } = req.headers;
  const { authService } = req.services;
  if (!authorization) {
    return next(httpError.Unauthorized());
  }

  try {
    const data = await authService.verifyToken();
    req.user = data;
  } catch (error) {
    if (!('response' in error)) {
      return next(httpError.InternalServerError());
    }
    const { status, data } = error.response;
    if (status !== 200) {
      return next(httpError(status, data));
    }
    return next(httpError.Unauthorized());
  }
  return next();
}

async function initServices(req, res, next) {
  const compressedResponse = req.headers['compressed-response'];
  const compressedRequest = req.headers['compressed-request'];
  const Authorization = req.headers.authorization;
  const newHeaders = {
    compressedResponse,
    compressedRequest,
    Authorization,
  };
  const authService = new AuthService();
  const userService = new UserService();
  const tagService = new TagService();

  ApiService.setHeaders(newHeaders);
  req.services = {
    authService,
    userService,
    tagService,
  };

  return next();
}

module.exports = {
  checkToken,
  initServices,
};
