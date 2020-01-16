const mongoose = require('mongoose');

const SettlementSchema = new mongoose.Schema({
  settlementNumber: {
    type: String,
    trim: true,
    required: [true, 'Please add a Settlement Number']
  },
  periodEnding: {
    type: Date,
    required: [true, 'Please add a Period ending for this settlement']
  },
  periodStart: {
    type: Date,
    required: [true, 'Please add a Period ending for this settlement']
  },
  status: {
    type: [String],
    required: [true, 'Please add the settlement status'],
    enum: ['Paid', 'Open', 'Processing']
  },
  payDate: {
    type: Date,
    required: false
  },
  checkNumber: {
    type: String,
    required: false
  },
  settlementAmount: {
    type: Number,
    required: [true, 'Please add the Settlement Amount']
  },
  routeCount: {
    type: Number,
    required: [true, 'Please add the number of routes in this Settlement']
  },
  stopCount: {
    type: Number,
    required: true
  },
  routeAverageAmount: Number,
  routeAverageStops: Number,
  routeAverageMiles: Number,
  chargebackAmount: Number,
  adminFee: Number,
  insuranceDeduction: Number,
  bondDeduction: Number,
  propertyDamageClaimDeduction: Number,
  truckRentalDeduction: Number,
  otherDeductions: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  carrier: {
    type: mongoose.Schema.ObjectId,
    ref: 'Carrier',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// Static Method To get Averages for Stop Count and Average Settlement Revenue
SettlementSchema.statics.getAverages = async function(carrierId) {
  console.log('Calculating Average Settlement Revenue...'.blue);
  console.log('Calculating Average Settlement Stop Count...'.yellow);

  const obj = await this.aggregate([
    {
      $match: { carrier: carrierId }
    },
    {
      $group: {
        _id: '$carrier',
        averageSettlementRevenue: { $avg: '$settlementAmount' },
        averageSettlementStopCount: { $avg: '$stopCount' },
        averageSettlementRouteCount: { $avg: '$routeCount' }
      }
    }
  ]);
  console.log(obj);
  try {
    await this.model('Carrier').findByIdAndUpdate(carrierId, {
      averageSettlementRevenue: (obj[0].averageSettlementRevenue / 10) * 10, // use Math.cel() if dont want decimal points
      averageSettlementStopCount: (obj[0].averageSettlementStopCount / 10) * 10,
      averageSettlementRouteCount:
        (obj[0].averageSettlementRouteCount / 10) * 10
    });
  } catch (err) {
    console.log(err);
  }
};

// Call getAverageSettlementRevenue after save
SettlementSchema.post('save', function() {
  this.constructor.getAverages(this.carrier);
});

// Call getAverageSettlementRevenue before remove
SettlementSchema.pre('remove', function() {
  this.constructor.getAverages(this.carrier);
});

// Static Method To get Averages for Stop Count and Average Settlement Revenue
SettlementSchema.statics.getTotals = async function(carrierId) {
  console.log('Calculating Total Revenue Generated...'.blue);
  console.log('Calculating Total Stop Count...'.yellow);

  const obj = await this.aggregate([
    {
      $match: { carrier: carrierId }
    },
    {
      $group: {
        _id: '$carrier',
        totalSalesRevenue: { $sum: '$settlementAmount' },
        totalStopCount: { $sum: '$stopCount' },
        totalRouteCount: { $sum: '$routeCount' }
      }
    }
  ]);
  console.log(obj);
  try {
    await this.model('Carrier').findByIdAndUpdate(carrierId, {
      totalSalesRevenue: obj[0].totalSalesRevenue, // use Math.cel() if dont want decimal points
      totalStopCount: obj[0].totalStopCount,
      totalRouteCount: obj[0].totalRouteCount
    });
  } catch (err) {
    console.log(err);
  }
};

// Call getTotals after save
SettlementSchema.post('save', function() {
  this.constructor.getTotals(this.carrier);
});

// Call getTotals before remove
SettlementSchema.pre('remove', function() {
  this.constructor.getTotals(this.carrier);
});

// Cascade delete delivery routes when a settlement is deleted
SettlementSchema.pre('remove', async function(next) {
  console.log(`Delivery Routes being removed from settlement ${this._id}`);
  await this.model('DeliveryRoute').deleteMany({ settlement: this._id });
  await this.model('AdminFee').deleteMany({ settlement: this._id });
  await this.model('PropertyDamageClaim').deleteMany({ settlement: this._id });
  await this.model('Chargeback').deleteMany({ settlement: this._id });
  await this.model('PerformanceBondDeduction').deleteMany({
    settlement: this._id
  });
  await this.model('OtherDeduction').deleteMany({ settlement: this._id });
  await this.model('Note').deleteMany({ settlement: this._id });
  next();
});

module.exports = mongoose.model('Settlement', SettlementSchema);
