const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Carrier = require('../models/Carrier');

// desc     Get All Carriers
// @route   GET /api/v1/carriers
// @access  Public
exports.getCarriers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// desc     Get Single Carrier
// @route   GET /api/v1/carriers/:id
// @access  Public
exports.getCarrier = asyncHandler(async (req, res, next) => {
  const carrier = await Carrier.findById(req.params.id);

  if (!carrier) {
    return next(
      new ErrorResponse(
        `Carrier not found with the id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({ success: true, data: carrier });
});

// desc     Create new carrier
// @route   POST /api/v1/carriers
// @access  Private
exports.createCarrier = asyncHandler(async (req, res, next) => {
  // Add User to req.body
  req.body.user = req.user.id;

  console.log(req.body);

  // Check for published carrier
  const publishedCarrier = await Carrier.findOne({ user: req.user.id });

  // if the user is not and admin they can only add one carrier
  if (publishedCarrier && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with ${req.user.id} has already published a carrier`,
        400
      )
    );
  }

  const carrier = await Carrier.create(req.body);
  res.status(201).json({
    success: true,
    data: carrier
  });
});

// desc     Update carrier
// @route   PUT /api/v1/carriers/:id
// @access  Private
exports.updateCarrier = asyncHandler(async (req, res, next) => {
  let carrier = await Carrier.findById(req.params.id);

  if (!carrier) {
    return next(
      new ErrorResponse(
        `Carrier not found with the id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure user is carrier owner
  if (carrier.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this carrier`,
        401
      )
    );
  }

  carrier = await Carrier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: carrier });
});

// desc     Delete carrier
// @route   DELETE /api/v1/carriers/:id
// @access  Private
exports.deleteCarrier = asyncHandler(async (req, res, next) => {
  const carrier = await Carrier.findById(req.params.id);
  if (!carrier) {
    return next(
      new ErrorResponse(
        `Carrier not found with the id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure user is carrier owner
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this carrier`,
        401
      )
    );
  }

  carrier.remove();

  res.status(200).json({ success: true, data: carrier });
});

// desc     Ger carriers within a radius
// @route   GET /api/v1/carriers/radius/:zipcode/:distance
// @access  Public
exports.getCarriersInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calculate the radius using radians
  // Divide distance by the radius of the earth
  // Earth radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const carriers = await Carrier.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    success: true,
    count: carriers.length,
    data: carriers
  });
});

// desc     Upload photo for carrier
// @route   PUT /api/v1/carriers/:id/photo
// @access  Private
exports.carrierPhotoUpload = asyncHandler(async (req, res, next) => {
  const carrier = await Carrier.findById(req.params.id);
  if (!carrier) {
    return next(
      new ErrorResponse(
        `Carrier not found with the id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure user is carrier owner
  if (carrier.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this carrier`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  // Make sure that the file is an image
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check File Size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom file name
  file.name = `photo_${carrier._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err);

      return next(
        new ErrorResponse('There was a problem with the file upload', 500)
      );
    }

    await Carrier.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});
