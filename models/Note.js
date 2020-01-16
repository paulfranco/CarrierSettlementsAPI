const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the note'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please add a comment'],
    maxlength: 300
  },
  settlement: {
    type: mongoose.Schema.ObjectId,
    ref: 'Settlement',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// prevent user from adding more than 1 note per settlement
// NoteSchema.index({ settlement: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Note', NoteSchema);
