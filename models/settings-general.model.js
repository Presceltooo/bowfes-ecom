const mongoose = require('mongoose');
const generate = require('../helpers/generate');

// Schema như là 1 khung
const settingGeneralSchema = new mongoose.Schema({
  websiteName: String,
  logo: String,
  phone: String,
  email: String,
  address: String,
  copyright: String,
  map: String,
}, {
  timestamps: true
});

const SettingGeneral = mongoose.model('SettingGeneral', settingGeneralSchema, "settings-general");
// Model là 1 bản ghi: gồm tên model, schema và tên collection

module.exports = SettingGeneral;