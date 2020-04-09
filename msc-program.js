// Setup
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Program Schema
module.exports = new Schema({
  id: Number,
  name: String,
  campus: String,
  email: String,
  tuition: String,
  url: String,
  duration: String,
  phone: String,
  description: String,
  requiredIelts: Number,
  requirements: String,
  categoryTag: String,
  editable: Boolean,
});
