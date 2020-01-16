const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load models
const Carrier = require('./models/Carrier');
const Settlement = require('./models/Settlement');
const User = require('./models/User');
const Note = require('./models/Note');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

// Read JSON Files
const carriers = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/carriers.json`, 'utf-8')
);

const settlements = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/settlements.json`, 'utf-8')
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);

const notes = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/notes.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    //await Carrier.create(carriers);
    //await Settlement.create(settlements);
    //await User.create(users);
    await Note.create(notes);

    console.log('Data Imported ...'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Carrier.deleteMany();
    await Settlement.deleteMany();
    await User.deleteMany();
    await Note.deleteMany();

    console.log('Data Deleted ...'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
