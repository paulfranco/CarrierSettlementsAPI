const mongoose = require('mongoose');

const AdminFeeSchema = new mongoose.Schema({
  adminFeeAmount: {
    type: Number,
    required: [true, 'Please add an Admin Fee Amount']
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

// prevent user from adding more than 1 admin fee per settlement
AdminFeeSchema.index({ settlement: 1, user: 1 }, { unique: true });

// Static Method to get the total Admin Fee
AdminFeeSchema.statics.getTotals = async function(settlementId) {
  console.log('Calculating Total Admin Fee...'.blue);

  const obj = await this.aggregate([
    {
      $match: { settlement: settlementId }
    },
    {
      $group: {
        _id: '$settlement',
        adminFee: { $sum: '$adminFeeAmount' }
      }
    }
  ]);
  console.log(obj);
  try {
    await this.model('Settlement').findByIdAndUpdate(settlementId, {
      adminFee: obj[0].adminFee // use Math.cel() if dont want decimal points
    });
  } catch (err) {
    console.log(err);
  }
};

// Call getTotals after save
AdminFeeSchema.post('save', function() {
  this.constructor.getTotals(this.settlement);
});

// Call getTotals before remove
AdminFeeSchema.pre('remove', function() {
  this.constructor.getTotals(this.settlement);
});

module.exports = mongoose.model('AdminFee', AdminFeeSchema);
