const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const CarrierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please Add Name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot be more that 50 characters']
    },
    slug: String,
    ubi: {
      type: String,
      required: [true, 'Please Add Unified Business Id'],
      maxlength: [12, 'UBI cannot be more than 12 characters']
    },
    landi: {
      type: String,
      required: [true, 'Please Add an Labor and Industries Account Number'],
      maxlength: [12, 'UBI cannot be more than 12 characters']
    },
    ein: {
      type: String,
      required: [true, 'Please Add an EIN'],
      maxlength: [12, 'UBI cannot be more than 12 characters']
    },
    dot: {
      type: String,
      required: [true, 'Please Add Unified Business Id'],
      maxlength: [12, 'UBI cannot be more than 12 characters']
    },
    mcnumber: {
      type: String,
      required: [true, 'Please Add an MC Number'],
      maxlength: [12, 'UBI cannot be more than 12 characters']
    },
    ccpermit: {
      type: String,
      required: [true, 'Please Add a CC Permit'],
      maxlength: [12, 'UBI cannot be more than 12 characters']
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number cannot be more than 20 characters']
    },
    fax: {
      type: String,
      maxlength: [20, 'Phone number cannot be more than 20 characters']
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid Email'
      ]
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS'
      ]
    },
    address: {
      type: String,
      required: [true, 'Please add an address']
    },
    location: {
      //GeoJson Point
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      country: String
    },
    services: {
      // Array of strings
      type: [String],
      required: false,
      enum: ['Furniture Delivery', 'Installation', 'Appliance Delivery']
    },
    market: {
      type: [String],
      required: false,
      enum: ['Seattle', 'Spokane', 'Richland', 'Portland']
    },
    account: {
      type: [String],
      required: false,
      enum: [
        'Mor Furniture',
        'Ashley Furniture',
        'Macys Furniture',
        'Restoration Hardware'
      ]
    },
    status: {
      type: [String],
      required: false,
      enum: ['Active', 'Terminated', 'Processing', 'Recruting']
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    averageSettlementRevenue: Number,
    averageSettlementStopCount: Number,
    averageSettlementRouteCount: Number,
    totalSalesRevenue: Number,
    totalStopCount: Number,
    totalRouteCount: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create carrier slu from the name
CarrierSchema.pre('save', function(next) {
  console.log('Slugify Ran', this.name);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Geocode and create location field
CarrierSchema.pre('save', async function(next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  };

  // Do not save address in db
  this.address = undefined;
  next();
});

// Cascade delete settlements when a Carrier is deleted
CarrierSchema.pre('remove', async function(next) {
  console.log(`Settlements being removed from carrier ${this._id}`);
  await this.model('Settlement').deleteMany({ carrier: this._id });
  next();
});

// Reverse populate with virtuals
CarrierSchema.virtual('settlements', {
  ref: 'Settlement',
  localField: '_id',
  foreignField: 'carrier',
  justOne: false
});

module.exports = mongoose.model('Carrier', CarrierSchema);
