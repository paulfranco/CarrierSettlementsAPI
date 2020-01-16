const mongoose = require('mongoose');

const OtherDeductionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please add a comment'],
    maxlength: 300
  },
  deductionType: {
    type: [String],
    required: [true, 'Please choose deduction type'],
    enum: [
      'Truck Rental',
      'Truck Mileage',
      'Truck Repair',
      'Insurance Deduction',
      'Uniform Deduction',
      'Supplies Deduction',
      'Truck Wash Deduction',
      'Other Deduction'
    ]
  },
  deductionAmount: {
    type: Number,
    required: [true, 'Please add a deduction amount'],
    default: 0.0
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

OtherDeductionSchema.statics.getTotals = async function(settlementId) {
  console.log('Calculating Total Other Deductions Fee...'.blue);

  const obj = await this.aggregate([
    {
      $match: { settlement: settlementId }
    },
    {
      $group: {
        _id: '$settlement',
        otherDeductions: { $sum: '$deductionAmount' }
      }
    }
  ]);
  console.log(obj);
  try {
    await this.model('Settlement').findByIdAndUpdate(settlementId, {
      otherDeductions: obj[0].otherDeductions // use Math.cel() if dont want decimal points
    });
  } catch (err) {
    console.log(err);
  }
};

// Call getTotals after save
OtherDeductionSchema.post('save', function() {
  this.constructor.getTotals(this.settlement);
});

// Call getTotals before remove
OtherDeductionSchema.pre('remove', function() {
  this.constructor.getTotals(this.settlement);
});

module.exports = mongoose.model('OtherDeduction', OtherDeductionSchema);
