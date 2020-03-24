// Setup
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Interests = require('./msc-interests.js');
const Program = require('./msc-program');
// User Schema
module.exports = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  statusActivated: Boolean,
  activationCode: String,
  firstName: String,
  lastName: String,
  birthDate: Date,
  gender: String,
  complete: Boolean,
  lastUse: Date,
  interests: Interests,
  ielts: Number,
  international: Boolean,
  originCountry: String,
  yearBudget: {
    type: String,
    enum: ['UNDEFINED', '1k-5k', '5k-10k', '10k-15k', '15k-20k', '20k-25k', '25k+'],
    default: 'UNDEFINED',
  },
  tempPrograms: [Program],
  finalPrograms: [Program]
});
