const express = require('express');
const {
  getCarrier,
  getCarriers,
  createCarrier,
  updateCarrier,
  deleteCarrier,
  getCarriersInRadius,
  carrierPhotoUpload
} = require('../controllers/carriers');

const Carrier = require('../models/Carrier');

const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const settlementRouter = require('./settlements');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:carrierId/settlements', settlementRouter);

router.route('/radius/:zipcode/:distance').get(getCarriersInRadius);

router
  .route('/:id/photo')
  .put(protect, authorize('staff', 'admin'), carrierPhotoUpload);

router
  .route('/')
  .get(advancedResults(Carrier, 'settlements'), getCarriers)
  .post(protect, authorize('staff', 'admin'), createCarrier);

router
  .route('/:id')
  .put(protect, authorize('staff', 'admin'), updateCarrier)
  .get(getCarrier)
  .delete(protect, authorize('staff', 'admin'), deleteCarrier);

module.exports = router;
