const { Router } = require('express');
const { checkToken, initServices } = require('../utils/middleware');
const errorHandler = require('../utils/errorHandler');
const {
  idParam,
  createFields,
  updateFields,
  readFields,
} = require('../utils/validator');
const {
  read,
  create,
  deleteById,
  readById,
  updateById,
} = require('./app');

const router = Router();
router.use(initServices);
router.use(checkToken);

router.post('/', createFields, errorHandler.validation, create);
router.get('/', readFields, errorHandler.validation, read);
router.get('/:id', idParam, errorHandler.validation, readById);
router.put('/:id', updateFields, errorHandler.validation, updateById);
router.delete('/:id', idParam, errorHandler.validation, deleteById);

module.exports = router;
