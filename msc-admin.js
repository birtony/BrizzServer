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
  tempPrograms: [Program],
  finalPrograms: [Program],
});
