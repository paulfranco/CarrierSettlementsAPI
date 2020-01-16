const express = require('express');

const {
  getSettlements,
  getSettlement,
  addSettlement,
  updateSettlement,
  deleteSettlement
} = require('../controllers/settlements');

const Settlement = require('../models/Settlement');

// Include other resource routers
const noteRouter = require('./notes');
const chargebackRouter = require('./chargebacks');
const deliveryRoutesRouter = require('./deliveryRoutes');
const otherDeductionsRouter = require('./otherDeductions');
const propertyDamageClaimsRouter = require('./propertyDamageClaims');
const adminFeesRouter = require('./adminFees');
const performanceBondDeductionsRouter = require('./performanceBondDeductions');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:settlementId/notes', noteRouter);
router.use('/:settlementId/chargebacks', chargebackRouter);
router.use('/:settlementId/deliveryroutes', deliveryRoutesRouter);
router.use('/:settlementId/otherdeductions', otherDeductionsRouter);
router.use('/:settlementId/propertydamageclaims', propertyDamageClaimsRouter);
router.use('/:settlementId/adminfees', adminFeesRouter);
router.use(
  '/:settlementId/performancebonddeductions',
  performanceBondDeductionsRouter
);

router
  .route('/')
  .get(
    advancedResults(Settlement, {
      path: 'carrier',
      select: 'name email phone'
    }),
    getSettlements
  )
  .post(protect, authorize('staff', 'admin'), addSettlement);

router
  .route('/:id')
  .get(getSettlement)
  .put(protect, authorize('staff', 'admin'), updateSettlement)
  .delete(protect, authorize('staff', 'admin'), deleteSettlement);

module.exports = router;
