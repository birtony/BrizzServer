// Setup
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Interests = require("./msc-interests.js");

// Program Schema
module.exports = new Schema({
  id: Number,
  name: String,
  address: String,
  location: {
    lat: Number,
    lon: Number
  },
  email: String,
  phone: String,
  yearlyCost: Number,
  description: String,
  requiredIelts: Number,
  requiredGpa: Number,
  interests: Interests,
});
