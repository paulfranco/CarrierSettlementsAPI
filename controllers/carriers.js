// desc     Get All Carriers
// @route   GET /api/v1/carriers
// @access  Public
exports.getCarriers = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Show all carriers' });
};

// desc     Get Single Carrier
// @route   GET /api/v1/carriers/:id
// @access  Public
exports.getCarrier = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Show single carrier' });
};

// desc     Create new carrier
// @route   POST /api/v1/carriers
// @access  Private
exports.createCarrier = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Create new carrier' });
};

// desc     Update carrier
// @route   PUT /api/v1/carriers/:id
// @access  Private
exports.updateCarrier = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `update carrier ${req.params.id}` });
};

// desc     Delete carrier
// @route   DELETE /api/v1/carriers/:id
// @access  Private
exports.deleteCarrier = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `delete carrier ${req.params.id}` });
};
