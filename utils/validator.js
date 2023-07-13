const { body, query, param } = require('express-validator');

const idParam = param('id').isNumeric().withMessage('Valid id is required').toInt();
const contentField = body('content').notEmpty().withMessage('Valid content required');
const tagsField = body('tags').isArray().withMessage('unacceptable input')
  .custom((value) => {
    if (!value.every((item) => /^[a-zA-Z0-9-]*$/.test(item))) {
      throw new Error('tag cannot contains non-alphanumeric or forbidden characters');
    }
    return true;
  })
  .optional();
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
  tagsField,
  contentField,
  parentIdField.optional(),
];
const updateFields = [
  tagsField,
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
