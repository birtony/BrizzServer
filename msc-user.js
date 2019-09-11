// Setup
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// User Schema
module.exports = new Schema({
  username: {
    type: String,
    required: true
  },
  password: String,
  statusActivated: Boolean,
  activationCode: String,
  firstName: String,
  lastName: String,
  birthDate: String,
  gender: String,
  city: String,
  complete: Boolean,
  lastUse: String,
  interests: {
    accounting: Boolean,
    administration: Boolean,
    payroll: Boolean,
    acting: Boolean,
    arts: Boolean,
    aviation: Boolean,
    broadcasting: Boolean,
    business: Boolean,
    chemistry: Boolean,
    civilEngineering: Boolean,
    computerNetworking: Boolean,
    cosmetics: Boolean,
    legal: Boolean,
    programming: Boolean,
    childhoodEducation: Boolean,
    electronics: Boolean,
    fashion: Boolean,
    fireProtection: Boolean,
    fitness: Boolean,
    flightServices: Boolean,
    hospitality: Boolean,
    mediaDesign: Boolean,
    journalism: Boolean,
    justice: Boolean,
    law: Boolean,
    mechanicalEngineering: Boolean,
    opticianry: Boolean,
    paralegal: Boolean,
    photography: Boolean,
    police: Boolean,
    nursing: Boolean,
    socialService: Boolean,
    tourism: Boolean,
    veterinary: Boolean
  },
  gpa: Number,
  ielts: Number,
  international: Boolean,
  yearBudget: {
    type: String,
    enum: ["UNDEFINED", "1k-5k", "5k-10k", "10k-15k", "15k-20k", "25k+"],
    default: ["UNDEFINED"]
  }
});
