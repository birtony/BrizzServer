// Setup
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Result = require('./msc-result.js');

// Interests Schema
module.exports = new Schema({
  i1: Result,
  i2: Result,
  i3: Result,
  i4: Result,
  i5: Result,
  i6: Result,
});
