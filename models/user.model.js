const mongoose = require('mongoose');
const generate = require('../helpers/generate');

// Schema như là 1 khung
const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  phone: String,
  tokenUser: {
    type: String,
    default: generate.generateRandomString(30)  
  },
  avatar: String,
  status: {
    type: String,
    default: 'active'
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema, "users");
// Model là 1 bản ghi: gồm tên model, schema và tên collection

module.exports = User;