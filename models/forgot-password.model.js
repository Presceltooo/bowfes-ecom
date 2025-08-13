const mongoose = require('mongoose');
const generate = require('../helpers/generate');

// Schema như là 1 khung
const forgotPasswordSchema = new mongoose.Schema({
  email: String,
  otp: String,
  expireAt: {
    type: Date,
    expires: 180
  }
}, {
  timestamps: true
});

const ForgotPassword = mongoose.model('ForgotPassword', forgotPasswordSchema, "forgot-password");
// Model là 1 bản ghi: gồm tên model, schema và tên collection

module.exports = ForgotPassword;