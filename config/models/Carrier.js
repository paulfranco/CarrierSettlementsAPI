const mongoose = require('mongoose');

const CarrierSchema = new mongoose.Schema({
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
  ein: {
    type: String,
    required: false,
    maxlength: [12, 'UBI cannot be more than 12 characters']
  },
  dot: {
    type: String,
    required: [true, 'Please Add Unified Business Id'],
    maxlength: [12, 'UBI cannot be more than 12 characters']
  },
  mcnumber: {
    type: String,
    required: false,
    maxlength: [12, 'UBI cannot be more than 12 characters']
  },
  ccpermit: {
    type: String,
    required: false,
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
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: Number,
      required: true,
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
    required: true,
    enum: ['Furniture Delivery', 'Installation', 'Appliance Delivery']
  },
  market: {
    type: [String],
    required: true,
    enum: ['Seattle', 'Spokane', 'Richland', 'Portland']
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  averageSettlement: Number,
  totalSales: Number,
  photo: {
    type: String,
    default: 'no-photo.jpg'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Carrier', CarrierSchema);
