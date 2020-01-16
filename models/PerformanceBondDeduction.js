const mongoose = require('mongoose');

const PerformanceBondDeductionSchema = new mongoose.Schema({
  bondDeductionNumber: {
    type: String,
    trim: true,
    required: [true, 'Please add a bond deduction number'],
    maxlength: 100
  },
  note: {
    type: String,
    required: [false, 'Please add a note'],
    maxlength: 300,
    default:
      'This deduction will remain active until the total has reached $2500.00 per truck'
  },
  performanceBondDeductionAmount: {
    type: Number,
    required: [true, 'Please add a Perfomance Bond Deduction Amount']
  },
  authorizedBy: {
    type: String,
    required: [
      true,
      'Please enter the name of the manager who authorized this deduction'
    ]
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

// Note: Can only add 1 Performance Bond Deduction per Settlement per user. Not sure why...

PerformanceBondDeductionSchema.statics.getTotals = async function(
  settlementId
) {
  console.log('Calculating Total Performance Bond Deductions Fee...'.blue);

  const obj = await this.aggregate([
    {
      $match: { settlement: settlementId }
    },
    {
      $group: {
        _id: '$settlement',
        bondDeduction: { $sum: '$performanceBondDeductionAmount' }
      }
    }
  ]);
  console.log(obj);
  try {
    await this.model('Settlement').findByIdAndUpdate(settlementId, {
      bondDeduction: obj[0].bondDeduction // use Math.cel() if dont want decimal points
    });
  } catch (err) {
    console.log(err);
  }
};

// Call getTotals after save
PerformanceBondDeductionSchema.post('save', function() {
  this.constructor.getTotals(this.settlement);
});

// Call getTotals before remove
PerformanceBondDeductionSchema.pre('remove', function() {
  this.constructor.getTotals(this.settlement);
});

module.exports = mongoose.model(
  'PerformanceBondDeduction',
  PerformanceBondDeductionSchema
);
