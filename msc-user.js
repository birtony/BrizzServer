// Setup
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Interests = require("./msc-interests.js");

// User Schema
module.exports = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  statusActivated: Boolean,
  activationCode: String,
  firstName: String,
  lastName: String,
  birthDate: String,
  gender: String,
  complete: Boolean,
  lastUse: Date,
  interests: Interests,
  ielts: Number,
  international: Boolean,
  originCountry: String,
  yearBudget: {
    type: String,
    enum: ["UNDEFINED", "1k-5k", "5k-10k", "10k-15k", "15k-20k", "20k-25k", "25k+"],
    default: "UNDEFINED",
  },
});
