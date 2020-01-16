const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Settlement = require('../models/Settlement');
const Chargeback = require('../models/Chargeback');

// @desc    Get Chargebacks
// @route   GET /api/v1/chargebacks
// @route   GET /api/v1/settlements/:settlementId/chargebacks
// @access  Public
exports.getChargebacks = asyncHandler(async (req, res, next) => {
  if (req.params.settlementId) {
    const chargebacks = await Chargeback.find({
      settlement: req.params.settlementId
    });

    return res.status(200).json({
      success: true,
      count: chargebacks.length,
      data: chargebacks
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get Single Chargeback
// @route   GET /api/v1/chargebacks/:id
// @access  Public
exports.getChargeback = asyncHandler(async (req, res, next) => {
  const chargeback = await Chargeback.findById(req.params.id).populate({
    path: 'settlement',
    select: 'settlementNumber periodEnding status'
  });

  if (!chargeback) {
    return next(
      new ErrorResponse(
        `No chargeback found with the id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    sucess: true,
    data: chargeback
  });
});

// @desc    Add a Chargeback
// @route   GET /api/v1/settlements/settlementId/chargebacks
// @access  Private
exports.addChargeback = asyncHandler(async (req, res, next) => {
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

  const chargeback = await Chargeback.create(req.body);

  res.status(201).json({
    sucess: true,
    data: chargeback
  });
});

// @desc    Update Chargeback
// @route   PUT /api/v1/chargebacks/:id
// @access  Private
exports.updateChargeback = asyncHandler(async (req, res, next) => {
  let chargeback = await Chargeback.findById(req.params.id);

  if (!chargeback) {
    return next(
      new ErrorResponse(
        `Chargeback with the id of ${req.params.id} not found`,
        404
      )
    );
  }

  if (chargeback.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User is not authorized to update chargeback`, 401)
    );
  }
  chargeback = await Chargeback.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    sucess: true,
    data: chargeback
  });
});

// @desc    Delete Chargeback
// @route   DELETE /api/v1/chargebacks/:id
// @access  Private
exports.deleteChargeback = asyncHandler(async (req, res, next) => {
  const chargeback = await Chargeback.findById(req.params.id);

  if (!chargeback) {
    return next(
      new ErrorResponse(
        `Chargeback with the id of ${req.params.id} not found`,
        404
      )
    );
  }

  if (chargeback.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User is not authorized to delete chargeback`, 401)
    );
  }

  await chargeback.remove();

  res.status(200).json({
    sucess: true,
    data: {}
  });
});
