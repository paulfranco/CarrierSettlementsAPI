const express = require('express');

const {
  getNotes,
  getNote,
  addNote,
  updateNote,
  deleteNote
} = require('../controllers/notes');

const Note = require('../models/Note');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Note, {
      path: 'settlement',
      select: 'settlementNumber status'
    }),
    getNotes
  )
  .post(protect, authorize('admin'), addNote);

router
  .route('/:id')
  .get(getNote)
  .put(protect, authorize('admin'), updateNote)
  .delete(protect, authorize('admin'), deleteNote);

module.exports = router;
