const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Settlement = require('../models/Settlement');
const Note = require('../models/Note');

// @desc    Get Notes
// @route   GET /api/v1/notes
// @route   GET /api/v1/settlements/:settlementId/notes
// @access  Public
exports.getNotes = asyncHandler(async (req, res, next) => {
  if (req.params.settlementId) {
    const notes = await Note.find({
      settlement: req.params.settlementId
    });

    return res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get Single Note
// @route   GET /api/v1/notes/:id
// @access  Public
exports.getNote = asyncHandler(async (req, res, next) => {
  const note = await Note.findById(req.params.id).populate({
    path: 'settlement',
    select: 'settlementNumber periodEnding status'
  });

  if (!note) {
    return next(
      new ErrorResponse(`No note found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    sucess: true,
    data: note
  });
});

// @desc    Add a Note
// @route   GET /api/v1/settlements/settlementId/notes
// @access  Private
exports.addNote = asyncHandler(async (req, res, next) => {
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

  const note = await Note.create(req.body);

  res.status(201).json({
    sucess: true,
    data: note
  });
});

// @desc    Update a Note
// @route   PUT /api/v1/notes/:id
// @access  Private
exports.updateNote = asyncHandler(async (req, res, next) => {
  let note = await Note.findById(req.params.id);

  if (!note) {
    return next(
      new ErrorResponse(`Note with the id of ${req.params.id} not found`, 404)
    );
  }

  if (note.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User is not authorized to update note`, 401)
    );
  }
  note = await Note.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    sucess: true,
    data: note
  });
});

// @desc    Delete a Note
// @route   DELETE /api/v1/notes/:id
// @access  Private
exports.deleteNote = asyncHandler(async (req, res, next) => {
  let note = await Note.findById(req.params.id);

  if (!note) {
    return next(
      new ErrorResponse(`Note with the id of ${req.params.id} not found`, 404)
    );
  }

  if (note.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User is not authorized to delete note`, 401)
    );
  }
  await note.remove();

  res.status(200).json({
    sucess: true,
    data: {}
  });
});
