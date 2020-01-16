const mongoose = require('mongoose');

const DeliveryRouteSchema = new mongoose.Schema({
  routeNumber: {
    type: String,
    trim: true,
    required: [true, 'Please add a route number'],
    maxlength: 20
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
    default: Date.now
  },
  stopCount: Number,
  pieceCount: Number,
  routeMileage: Number,
  routeRevenue: Number,
  settlement: {
    type: mongoose.Schema.ObjectId,
    ref: 'Settlement',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// prevent user from adding more than 1 note per settlement
// NoteSchema.index({ settlement: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('DeliveryRoute', DeliveryRouteSchema);
