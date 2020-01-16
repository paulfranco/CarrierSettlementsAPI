const express = require('express');

const {
  getChargebacks,
  getChargeback,
  addChargeback,
  updateChargeback,
  deleteChargeback
} = require('../controllers/chargebacks');

const Chargeback = require('../models/Chargeback');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Chargeback, {
      path: 'settlement',
      select: 'settlementNumber status'
    }),
    getChargebacks
  )
  .post(protect, authorize('admin'), addChargeback);

router
  .route('/:id')
  .get(getChargeback)
  .put(protect, authorize('admin'), updateChargeback)
  .delete(protect, authorize('admin'), deleteChargeback);

module.exports = router;
