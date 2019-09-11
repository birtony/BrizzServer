// Setup
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

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
  cost: Number,
  description: String,
  requiredIelts: Number,
  requiredGpa: Number
});
