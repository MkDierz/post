const { body, query, param } = require('express-validator');

const idParam = param('id').isNumeric().withMessage('Valid id is required').toInt();
const contentField = body('content').notEmpty().withMessage('Valid content required');
const parentIdField = body('parentId').isNumeric().withMessage('Valid content required');
const searchQueryField = query('query').isAlphanumeric().withMessage('valid query required').optional();
const userIdQueryField = query('userId').isNumeric().withMessage('valid userId required').toInt()
  .optional();
const idQuery = query('id')
  .custom((value) => {
    if (!value.split(',').map((i) => parseInt(i, 10)).every(Number.isInteger)) {
      throw new Error('Array does not contain Integers');
    }
    return true;
  })
  .customSanitizer((value) => value.split(',').map((i) => parseInt(i, 10)))
  .optional();

const createFields = [
  contentField,
  parentIdField.optional(),
];
const updateFields = [
  contentField,
  idParam,
];
const readFields = [
  searchQueryField,
  idQuery,
  userIdQueryField,
];
module.exports = {
  idParam,
  contentField,
  searchQueryField,
  createFields,
  updateFields,
  readFields,
};
