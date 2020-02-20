// Setup
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Program Schema
module.exports = new Scehma({
  id: Number,
  name: String,
  campus: String,
  email: String,
  tuition: String,
  url: String,
  duration: String,
  phone: String,
  description: String,
  requiredIelts: {},
  requirements: String,
});
