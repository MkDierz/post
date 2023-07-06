const { Router } = require('express');
const { checkToken } = require('../utils/middleware');
const errorHandler = require('../utils/errorHandler');
const {
  usernameField,
  updateFriendRequestFields,
  updateProfileField,
  searchQueryField,
} = require('../utils/validator');
const {
  profile,
  updateProfile,
  friendRequest,
  friendRequestSent,
  sendFriendRequest,
  updateFriendRequest,
  friendList,
  findUser,
} = require('./app');

const router = Router();
router.use(checkToken);

router.get('/', profile);
router.put('/', updateProfileField, errorHandler.validation, updateProfile);
router.get('/friends', friendList);
router.get('/friend-request', friendRequest);
router.get('/friend-request/sent', friendRequestSent);
router.post('/friend-request', usernameField, errorHandler.validation, sendFriendRequest);
router.put('/friend-request', updateFriendRequestFields, errorHandler.validation, updateFriendRequest);
router.get('/search', searchQueryField, errorHandler.validation, findUser);

module.exports = router;
