const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Settlement = require('../models/Settlement');
const AdminFee = require('../models/AdminFee');

// @desc    Get Admin Fees
// @route   GET /api/v1/adminfees
// @route   GET /api/v1/settlements/:settlementId/adminfees
// @access  Public
exports.getAdminFees = asyncHandler(async (req, res, next) => {
  if (req.params.settlementId) {
    const adminFees = await AdminFee.find({
      settlement: req.params.settlementId
    });

    return res.status(200).json({
      success: true,
      count: adminFees.length,
      data: adminFees
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get Single Admin Fee
// @route   GET /api/v1/adminfees/:id
// @access  Public
exports.getAdminFee = asyncHandler(async (req, res, next) => {
  const adminFee = await AdminFee.findById(req.params.id).populate({
    path: 'settlement',
    select: 'settlementNumber periodEnding status'
  });

  if (!adminFee) {
    return next(
      new ErrorResponse(
        `No admin fee found with the id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    sucess: true,
    data: adminFee
  });
});

// @desc    Add an Admin Fee
// @route   GET /api/v1/settlements/settlementId/adminfees
// @access  Private
exports.addAdminFee = asyncHandler(async (req, res, next) => {
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

  const adminFee = await AdminFee.create(req.body);

  res.status(201).json({
    sucess: true,
    data: adminFee
  });
});

// @desc    Update Admin Fee
// @route   PUT /api/v1/adminfees/:id
// @access  Private
exports.updateAdminFee = asyncHandler(async (req, res, next) => {
  let adminFee = await AdminFee.findById(req.params.id);

  if (!adminFee) {
    return next(
      new ErrorResponse(
        `Admin Fee with the id of ${req.params.id} not found`,
        404
      )
    );
  }

  if (adminFee.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User is not authorized to update admin fee`, 401)
    );
  }
  adminFee = await AdminFee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    sucess: true,
    data: adminFee
  });
});

// @desc    Delete Admin Fee
// @route   DELETE /api/v1/adminfees/:id
// @access  Private
exports.deleteAdminFee = asyncHandler(async (req, res, next) => {
  let adminFee = await AdminFee.findById(req.params.id);

  if (!adminFee) {
    return next(
      new ErrorResponse(
        `Admin Fee with the id of ${req.params.id} not found`,
        404
      )
    );
  }

  if (adminFee.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User is not authorized to delete admin fee`, 401)
    );
  }

  await adminFee.remove();

  res.status(200).json({
    sucess: true,
    data: {}
  });
});
