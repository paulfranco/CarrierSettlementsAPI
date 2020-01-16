const express = require('express');

const {
  getPerformanceBondDeductions,
  getPerformanceBondDeduction,
  addPerformanceBondDeduction,
  updatePerformanceBondDeduction,
  deletePerformanceBondDeduction
} = require('../controllers/performanceBondDeductions');

const PerformanceBondDeduction = require('../models/PerformanceBondDeduction');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(PerformanceBondDeduction, {
      path: 'settlement',
      select: 'settlementNumber status'
    }),
    getPerformanceBondDeductions
  )
  .post(protect, authorize('admin'), addPerformanceBondDeduction);

router
  .route('/:id')
  .get(getPerformanceBondDeduction)
  .put(protect, authorize('admin'), updatePerformanceBondDeduction)
  .delete(protect, authorize('admin'), deletePerformanceBondDeduction);

module.exports = router;
