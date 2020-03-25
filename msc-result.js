// Setup
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Result Schema
module.exports = new Schema({
  raisecTag: String,
  percentage: Number,
});
