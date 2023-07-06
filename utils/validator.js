const { body, query } = require('express-validator');

const statusField = body('status').notEmpty().isIn(['ACCEPTED', 'UNACCEPTED']).withMessage('valid status is required');
const usernameField = body('username').notEmpty().withMessage('username is required');
const emailField = body('email').isEmail().withMessage('valid email required');
const nameField = body('name').isString().withMessage('valid name is required');
const bioField = body('bio').isString().withMessage('string only for bio');
const locationField = body('location').isString().withMessage('string only for location');
const passwordField = body('password').isLength({ min: 6 }).withMessage('minimum length for password is 6');
const searchQueryField = query('query').notEmpty().withMessage('query required');
const updateFriendRequestFields = [usernameField, statusField];
const updateProfileField = [
  nameField.optional(),
  usernameField.optional(),
  emailField.optional(),
  bioField.optional(),
  locationField.optional(),
  passwordField.optional(),
];

module.exports = {
  usernameField,
  updateFriendRequestFields,
  updateProfileField,
  searchQueryField,
};
