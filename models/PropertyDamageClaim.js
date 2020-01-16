const mongoose = require('mongoose');

const PropertyDamageClaimSchema = new mongoose.Schema({
  propertyDamageClaimNumber: {
    type: String,
    trim: true,
    required: [true, 'Please add a property damage claim number'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please add a comment'],
    maxlength: 300
  },
  damageType: {
    type: [String],
    required: [true, 'Please choose damage type'],
    enum: [
      'Floor Damage',
      'Carpet Damage',
      'Driveway Damage',
      'Wall Damage',
      'Door Damage',
      'Other Damage'
    ]
  },
  claimReportedDate: {
    type: Date
  },
  claimDeliveryDate: {
    type: Date
  },
  customerName: {
    type: String,
    required: [true, 'Please enter a customer name']
  },
  claimAmount: {
    type: Number,
    required: [true, 'Please add a chargenack amount'],
    default: 0.0
  },
  claimStatus: {
    type: [String],
    required: [true, 'Please choose damage type'],
    enum: ['Resolved', 'Open', 'Processing']
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

PropertyDamageClaimSchema.statics.getTotals = async function(settlementId) {
  console.log('Calculating Total Property Damage Claim Fee...'.blue);

  const obj = await this.aggregate([
    {
      $match: { settlement: settlementId }
    },
    {
      $group: {
        _id: '$settlement',
        propertyDamageClaimDeduction: { $sum: '$claimAmount' }
      }
    }
  ]);
  console.log(obj);
  try {
    await this.model('Settlement').findByIdAndUpdate(settlementId, {
      propertyDamageClaimDeduction: obj[0].propertyDamageClaimDeduction // use Math.cel() if dont want decimal points
    });
  } catch (err) {
    console.log(err);
  }
};

// Call getTotals after save
PropertyDamageClaimSchema.post('save', function() {
  this.constructor.getTotals(this.settlement);
});

// Call getTotals before remove
PropertyDamageClaimSchema.pre('remove', function() {
  this.constructor.getTotals(this.settlement);
});

module.exports = mongoose.model(
  'PropertyDamageClaim',
  PropertyDamageClaimSchema
);
