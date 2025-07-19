const mongoose = require('mongoose');
const generate = require('../helpers/generate');

// Schema như là 1 khung
const accountSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  phone: String,
  token: {
    type: String,
    default: generate.generateRandomString(20)  
  },
  avatar: String,
  role_id: String,
  status: String,
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

const Account = mongoose.model('Account', accountSchema, "accounts");
// Model là 1 bản ghi: gồm tên model, schema và tên collection

module.exports = Account;