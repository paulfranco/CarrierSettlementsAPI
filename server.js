const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
//const logger = require('./middleware/logger');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to DB
connectDB();
// Route files
const carriers = require('./routes/carriers');
const settlements = require('./routes/settlements');
const auth = require('./routes/auth');
const users = require('./routes/users');
const notes = require('./routes/notes');
const chargebacks = require('./routes/chargebacks');
const deliveryRoutes = require('./routes/deliveryRoutes');
const adminFees = require('./routes/adminFees');
const performanceBondDeductions = require('./routes/performanceBondDeductions');
const propertyDamageClaims = require('./routes/propertyDamageClaims');
const otherDeductions = require('./routes/otherDeductions');

const app = express();

// Body parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

//app.use(logger);
// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowsMs: 10 * 60 * 1000, // 10 minutes
  max: 100
});

app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/carriers', carriers);
app.use('/api/v1/settlements', settlements);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/notes', notes);
app.use('/api/v1/chargebacks', chargebacks);
app.use('/api/v1/deliveryroutes', deliveryRoutes);
app.use('/api/v1/adminfees', adminFees);
app.use('/api/v1/performancebonddeductions', performanceBondDeductions);
app.use('/api/v1/propertydamageclaims', propertyDamageClaims);
app.use('/api/v1/otherdeductions', otherDeductions);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red.bold);
  // Close server and exit process
  server.close(() => process.exit(1));
});
