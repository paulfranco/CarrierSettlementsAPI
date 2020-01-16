const express = require('express');

const {
  getOtherDeductions,
  getOtherDeduction,
  addOtherDeduction,
  updateOtherDeduction,
  deleteOtherDeduction
} = require('../controllers/otherDeductions');

const OtherDeduction = require('../models/OtherDeduction');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(OtherDeduction, {
      path: 'settlement',
      select: 'settlementNumber status'
    }),
    getOtherDeductions
  )
  .post(protect, authorize('admin'), addOtherDeduction);

router
  .route('/:id')
  .get(getOtherDeduction)
  .put(protect, authorize('admin'), updateOtherDeduction)
  .delete(protect, authorize('admin'), deleteOtherDeduction);

module.exports = router;
