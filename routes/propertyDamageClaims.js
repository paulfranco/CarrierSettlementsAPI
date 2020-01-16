const express = require('express');

const {
  getPropertyDamageClaims,
  getPropertyDamageClaim,
  addPropertyDamageClaim,
  updatePropertyDamageClaim,
  deletePropertyDamageClaim
} = require('../controllers/propertyDamageClaims');

const PropertyDamageClaim = require('../models/PropertyDamageClaim');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(PropertyDamageClaim, {
      path: 'settlement',
      select: 'settlementNumber status'
    }),
    getPropertyDamageClaims
  )
  .post(protect, authorize('admin'), addPropertyDamageClaim);

router
  .route('/:id')
  .get(getPropertyDamageClaim)
  .put(protect, authorize('admin'), updatePropertyDamageClaim)
  .delete(protect, authorize('admin'), deletePropertyDamageClaim);

module.exports = router;
