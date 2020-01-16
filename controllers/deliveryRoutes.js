const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Settlement = require('../models/Settlement');
const DeliveryRoute = require('../models/DeliveryRoute');

// @desc    Get Delivery Routes
// @route   GET /api/v1/deliveryroutes
// @route   GET /api/v1/settlements/:settlementId/deliveryroutes
// @access  Public
exports.getDeliveryRoutes = asyncHandler(async (req, res, next) => {
  if (req.params.settlementId) {
    const deliveryRoutes = await DeliveryRoute.find({
      settlement: req.params.settlementId
    });

    return res.status(200).json({
      success: true,
      count: deliveryRoutes.length,
      data: deliveryRoutes
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get Single Delivery Route
// @route   GET /api/v1/deliveryroutes/:id
// @access  Public
exports.getDeliveryRoute = asyncHandler(async (req, res, next) => {
  const deliveryRoute = await DeliveryRoute.findById(req.params.id).populate({
    path: 'settlement',
    select: 'settlementNumber periodEnding status'
  });

  if (!deliveryRoute) {
    return next(
      new ErrorResponse(
        `No delivery route found with the id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    sucess: true,
    data: deliveryRoute
  });
});

// @desc    Add a Delivery Route
// @route   GET /api/v1/settlements/settlementId/deliveryroutes
// @access  Private
exports.addDeliveryRoute = asyncHandler(async (req, res, next) => {
  req.body.settlement = req.params.settlementId;
  req.body.user = req.user.id;

  const settlement = await Settlement.findById(req.params.settlementId);

  if (!settlement) {
    return next(
      new ErrorResponse(
        `Settlement with the id of ${req.params.settlementId} not found`,
        404
      )
    );
  }

  const deliveryRoute = await DeliveryRoute.create(req.body);

  res.status(201).json({
    sucess: true,
    data: deliveryRoute
  });
});

// @desc    Update Delivery Route
// @route   PUT /api/v1/deliveryroutes/:id
// @access  Private
exports.updateDeliveryRoute = asyncHandler(async (req, res, next) => {
  let deliveryRoute = await DeliveryRoute.findById(req.params.id);

  if (!deliveryRoute) {
    return next(
      new ErrorResponse(
        `Delivery Route with the id of ${req.params.id} not found`,
        404
      )
    );
  }

  if (
    deliveryRoute.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(`User is not authorized to update delivery route`, 401)
    );
  }
  deliveryRoute = await DeliveryRoute.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    sucess: true,
    data: deliveryRoute
  });
});

// @desc    Delete Delivery Route
// @route   DELETE /api/v1/deliveryroutes/:id
// @access  Private
exports.deleteDeliveryRoute = asyncHandler(async (req, res, next) => {
  const deliveryRoute = await DeliveryRoute.findById(req.params.id);

  if (!deliveryRoute) {
    return next(
      new ErrorResponse(
        `Delivery Route with the id of ${req.params.id} not found`,
        404
      )
    );
  }

  if (
    deliveryRoute.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(`User is not authorized to delete delivery route`, 401)
    );
  }

  await deliveryRoute.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
