const express = require('express');
const {
  getCarrier,
  getCarriers,
  createCarrier,
  updateCarrier,
  deleteCarrier
} = require('../controllers/carriers');
const router = express.Router();

router
  .route('/')
  .get(getCarriers)
  .post(createCarrier);

router
  .route('/:id')
  .put(updateCarrier)
  .get(getCarrier)
  .delete(deleteCarrier);

module.exports = router;
