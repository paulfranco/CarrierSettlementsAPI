const mongoose = require('mongoose');

const ChargebackSchema = new mongoose.Schema({
  chargebackNumber: {
    type: String,
    trim: true,
    required: [true, 'Please add a chargeback number'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please add a comment'],
    maxlength: 300
  },
  chargebackAmount: {
    type: Number,
    required: [true, 'Please add a chargenack amount']
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

ChargebackSchema.statics.getTotals = async function(settlementId) {
  console.log('Calculating Total Chargeback Fees...'.blue);

  const obj = await this.aggregate([
    {
      $match: { settlement: settlementId }
    },
    {
      $group: {
        _id: '$settlement',
        chargebackAmount: { $sum: '$chargebackAmount' }
      }
    }
  ]);
  console.log(obj);
  try {
    await this.model('Settlement').findByIdAndUpdate(settlementId, {
      chargebackAmount: obj[0].chargebackAmount // use Math.cel() if dont want decimal points
    });
  } catch (err) {
    console.log(err);
  }
};

// Call getTotals after save
ChargebackSchema.post('save', function() {
  this.constructor.getTotals(this.settlement);
});

// Call getTotals before remove
ChargebackSchema.pre('remove', function() {
  this.constructor.getTotals(this.settlement);
});

module.exports = mongoose.model('Chargeback', ChargebackSchema);
