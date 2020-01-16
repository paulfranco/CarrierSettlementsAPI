const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Settlement = require('../models/Settlement');
const OtherDeduction = require('../models/OtherDeduction');

// @desc    Get Other Deductions
// @route   GET /api/v1/otherdeductions
// @route   GET /api/v1/settlements/:settlementId/otherdeductions
// @access  Public
exports.getOtherDeductions = asyncHandler(async (req, res, next) => {
  if (req.params.settlementId) {
    const otherDeductions = await OtherDeduction.find({
      settlement: req.params.settlementId
    });

    return res.status(200).json({
      success: true,
      count: otherDeductions.length,
      data: otherDeductions
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get Single Other Deduction
// @route   GET /api/v1/otherdeductions/:id
// @access  Public
exports.getOtherDeduction = asyncHandler(async (req, res, next) => {
  const otherDeduction = await OtherDeduction.findById(req.params.id).populate({
    path: 'settlement',
    select: 'settlementNumber periodEnding status'
  });

  if (!otherDeduction) {
    return next(
      new ErrorResponse(
        `No other deduction found with the id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    sucess: true,
    data: otherDeduction
  });
});

// @desc    Add Other Deduction
// @route   GET /api/v1/settlements/settlementId/otherdeductions
// @access  Private
exports.addOtherDeduction = asyncHandler(async (req, res, next) => {
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

  const otherDeduction = await OtherDeduction.create(req.body);

  res.status(201).json({
    sucess: true,
    data: otherDeduction
  });
});

// @desc    Update Other Deduction
// @route   PUT /api/v1/otherdeductions/:id
// @access  Private
exports.updateOtherDeduction = asyncHandler(async (req, res, next) => {
  let otherDeduction = await OtherDeduction.findById(req.params.id);

  if (!otherDeduction) {
    return next(
      new ErrorResponse(
        `Other Deduction with the id of ${req.params.id} not found`,
        404
      )
    );
  }

  if (
    otherDeduction.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(`User is not authorized to update other deduction`, 401)
    );
  }
  otherDeduction = await OtherDeduction.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    sucess: true,
    data: otherDeduction
  });
});

// @desc    Delete Other Deduction
// @route   DELETE /api/v1/otherdeductions/:id
// @access  Private
exports.deleteOtherDeduction = asyncHandler(async (req, res, next) => {
  let otherDeduction = await OtherDeduction.findById(req.params.id);

  if (!otherDeduction) {
    return next(
      new ErrorResponse(
        `Other Deduction with the id of ${req.params.id} not found`,
        404
      )
    );
  }

  if (
    otherDeduction.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(`User is not authorized to delete other deduction`, 401)
    );
  }

  await otherDeduction.remove();

  res.status(200).json({
    sucess: true,
    data: {}
  });
});
