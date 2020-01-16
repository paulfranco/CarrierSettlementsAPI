const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Settlement = require('../models/Settlement');
const PerformanceBondDeduction = require('../models/PerformanceBondDeduction');

// @desc    Get Performance Bond Deductions
// @route   GET /api/v1/performancebonddeductions
// @route   GET /api/v1/settlements/:settlementId/performancebonddeductions
// @access  Public
exports.getPerformanceBondDeductions = asyncHandler(async (req, res, next) => {
  if (req.params.settlementId) {
    const performanceBondDeductions = await PerformanceBondDeduction.find({
      settlement: req.params.settlementId
    });

    return res.status(200).json({
      success: true,
      count: performanceBondDeductions.length,
      data: performanceBondDeductions
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get Single Performance Bond Deduction
// @route   GET /api/v1/performancebonddeductions/:id
// @access  Public
exports.getPerformanceBondDeduction = asyncHandler(async (req, res, next) => {
  const performanceBondDeduction = await PerformanceBondDeduction.findById(
    req.params.id
  ).populate({
    path: 'settlement',
    select: 'settlementNumber periodEnding status'
  });

  if (!performanceBondDeduction) {
    return next(
      new ErrorResponse(
        `No performance bond deduction found with the id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    sucess: true,
    data: performanceBondDeduction
  });
});

// @desc    Add a Performance Bond Deduction
// @route   GET /api/v1/settlements/settlementId/performancebonddeduction
// @access  Private
exports.addPerformanceBondDeduction = asyncHandler(async (req, res, next) => {
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

  const performanceBondDeduction = await PerformanceBondDeduction.create(
    req.body
  );

  res.status(201).json({
    sucess: true,
    data: performanceBondDeduction
  });
});

// @desc    Update Performance Bond Deduction
// @route   PUT /api/v1/performancebonddeduction/:id
// @access  Private
exports.updatePerformanceBondDeduction = asyncHandler(
  async (req, res, next) => {
    let performanceBondDeduction = await PerformanceBondDeduction.findById(
      req.params.id
    );

    if (!performanceBondDeduction) {
      return next(
        new ErrorResponse(
          `Performance Bond Deduction with the id of ${req.params.id} not found`,
          404
        )
      );
    }

    if (
      performanceBondDeduction.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User is not authorized to update performance bond deduction`,
          401
        )
      );
    }
    performanceBondDeduction = await PerformanceBondDeduction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      sucess: true,
      data: performanceBondDeduction
    });
  }
);

// @desc    Delete Performance Bond Deduction
// @route   DELETE /api/v1/performancebonddeduction/:id
// @access  Private
exports.deletePerformanceBondDeduction = asyncHandler(
  async (req, res, next) => {
    const performanceBondDeduction = await PerformanceBondDeduction.findById(
      req.params.id
    );

    if (!performanceBondDeduction) {
      return next(
        new ErrorResponse(
          `Performance Bond Deduction with the id of ${req.params.id} not found`,
          404
        )
      );
    }

    if (
      performanceBondDeduction.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User is not authorized to delete performance bond deduction`,
          401
        )
      );
    }

    await performanceBondDeduction.remove();

    res.status(200).json({
      sucess: true,
      data: {}
    });
  }
);
