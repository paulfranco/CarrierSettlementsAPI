const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Settlement = require('../models/Settlement');
const PropertyDamageClaim = require('../models/PropertyDamageClaim');

// @desc    Get Property Damage Claims
// @route   GET /api/v1/propertydamageclaims
// @route   GET /api/v1/settlements/:settlementId/propertydamageclaims
// @access  Public
exports.getPropertyDamageClaims = asyncHandler(async (req, res, next) => {
  if (req.params.settlementId) {
    const propertyDamageClaims = await PropertyDamageClaim.find({
      settlement: req.params.settlementId
    });

    return res.status(200).json({
      success: true,
      count: propertyDamageClaims.length,
      data: propertyDamageClaims
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get Single Property Damage Claim
// @route   GET /api/v1/propertydamageclaims/:id
// @access  Public
exports.getPropertyDamageClaim = asyncHandler(async (req, res, next) => {
  const propertyDamageClaim = await PropertyDamageClaim.findById(
    req.params.id
  ).populate({
    path: 'settlement',
    select: 'settlementNumber periodEnding status'
  });

  if (!propertyDamageClaim) {
    return next(
      new ErrorResponse(
        `No property damage claim found with the id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    sucess: true,
    data: propertyDamageClaim
  });
});

// @desc    Add a Property Damage Claim
// @route   GET /api/v1/settlements/settlementId/propertydamageclaims
// @access  Private
exports.addPropertyDamageClaim = asyncHandler(async (req, res, next) => {
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

  const propertyDamageClaim = await PropertyDamageClaim.create(req.body);

  res.status(201).json({
    sucess: true,
    data: propertyDamageClaim
  });
});

// @desc    Update Property Damage Claim
// @route   PUT /api/v1/propertydamageclaims/:id
// @access  Private
exports.updatePropertyDamageClaim = asyncHandler(async (req, res, next) => {
  let propertyDamageClaim = await PropertyDamageClaim.findById(req.params.id);

  if (!propertyDamageClaim) {
    return next(
      new ErrorResponse(
        `Property Damage Claim with the id of ${req.params.id} not found`,
        404
      )
    );
  }

  if (
    propertyDamageClaim.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User is not authorized to update property damage claim`,
        401
      )
    );
  }
  propertyDamageClaim = await PropertyDamageClaim.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    sucess: true,
    data: propertyDamageClaim
  });
});

// @desc    Delete Property Damage Claim
// @route   DELETE /api/v1/propertydamageclaims/:id
// @access  Private
exports.deletePropertyDamageClaim = asyncHandler(async (req, res, next) => {
  let propertyDamageClaim = await PropertyDamageClaim.findById(req.params.id);

  if (!propertyDamageClaim) {
    return next(
      new ErrorResponse(
        `Property Damage Claim with the id of ${req.params.id} not found`,
        404
      )
    );
  }

  if (
    propertyDamageClaim.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User is not authorized to delete property damage claim`,
        401
      )
    );
  }

  await propertyDamageClaim.remove();

  res.status(200).json({
    sucess: true,
    data: {}
  });
});
