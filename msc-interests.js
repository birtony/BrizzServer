// Setup
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// Interests Schema
module.exports = new Schema({
  accounting: Boolean,
  administration: Boolean,
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
});