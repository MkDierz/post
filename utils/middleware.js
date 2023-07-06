const { auth } = require('./services');
const { httpError } = require('../config');

async function checkToken(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) {
    return next(httpError.Unauthorized());
  }
  const bearer = authorization.split(' ');
  const accessToken = bearer[1];

  try {
    const authServiceResponse = await auth.verifyToken(accessToken);
    const { status, data } = authServiceResponse;
    if (status !== 200) {
      return next(httpError(status, data));
    }
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

module.exports = {
  checkToken,
};
