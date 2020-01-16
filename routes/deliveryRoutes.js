const express = require('express');

const {
  getDeliveryRoutes,
  getDeliveryRoute,
  addDeliveryRoute,
  updateDeliveryRoute,
  deleteDeliveryRoute
} = require('../controllers/deliveryRoutes');

const DeliveryRoute = require('../models/DeliveryRoute');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(DeliveryRoute, {
      path: 'settlement',
      select: 'settlementNumber status'
    }),
    getDeliveryRoutes
  )
  .post(protect, authorize('admin'), addDeliveryRoute);

router
  .route('/:id')
  .get(getDeliveryRoute)
  .put(protect, authorize('admin'), updateDeliveryRoute)
  .delete(protect, authorize('admin'), deleteDeliveryRoute);

module.exports = router;
