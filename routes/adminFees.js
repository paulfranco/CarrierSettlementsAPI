const express = require('express');

const {
  getAdminFees,
  getAdminFee,
  addAdminFee,
  updateAdminFee,
  deleteAdminFee
} = require('../controllers/adminFees');

const AdminFee = require('../models/AdminFee');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(AdminFee, {
      path: 'settlement',
      select: 'settlementNumber status'
    }),
    getAdminFees
  )
  .post(protect, authorize('admin'), addAdminFee);

router
  .route('/:id')
  .get(getAdminFee)
  .put(protect, authorize('admin'), updateAdminFee)
  .delete(protect, authorize('admin'), deleteAdminFee);

module.exports = router;
