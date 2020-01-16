const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Settlement = require('../models/Settlement');
const Carrier = require('../models/Carrier');

// @desc    Get Settlements
// @route   GET /api/v1/settlements
// @route   GET /api/v1/carriers/:carrierId/settlements
// @access  Public
exports.getSettlements = asyncHandler(async (req, res, next) => {
  if (req.params.carrierId) {
    const settlements = await Settlement.find({
      carrier: req.params.carrierId
    });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single Settlement
// @route   GET /api/v1/settlements/:id
// @access  Public
exports.getSettlement = asyncHandler(async (req, res, next) => {
  const settlement = await Settlement.findById(req.params.id).populate({
    path: 'carrier',
    select: 'name ubi'
  });

  if (!settlement) {
    return next(
      new ErrorResponse(`No settlement with the id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: settlement
  });
});

// @desc    Add a settlement
// @route   POST /api/v1/carriers/carrierId/settlements
// @access  Private
exports.addSettlement = asyncHandler(async (req, res, next) => {
  req.body.carrier = req.params.carrierId;
  req.body.user = req.user.id;

  const carrier = await Carrier.findById(req.params.carrierId);

  if (!carrier) {
    return next(
      new ErrorResponse(`No carrier with the id of ${req.params.carrierId}`),
      404
    );
  }

  // Make sure user is carrier owner
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a course to carrier ${carrier._id}`,
        401
      )
    );
  }

  const settlement = await Settlement.create(req.body);

  res.status(200).json({
    success: true,
    data: settlement
  });
});

// @desc    Update a settlement
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateSettlement = asyncHandler(async (req, res, next) => {
  let settlement = await Settlement.findById(req.params.id);

  if (!settlement) {
    return next(
      new ErrorResponse(`No settlement with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is carrier owner
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update settlement ${settlement._id}`,
        401
      )
    );
  }

  settlement = await Settlement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: settlement
  });
});

// @desc    Delete a settlement
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteSettlement = asyncHandler(async (req, res, next) => {
  const settlement = await Settlement.findById(req.params.id);

  if (!settlement) {
    return next(
      new ErrorResponse(`No settlement with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is carrier owner
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete settlement ${settlement._id}`,
        401
      )
    );
  }

  await settlement.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
