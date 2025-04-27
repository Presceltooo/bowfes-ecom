const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  title: String,
  description: String,
  permissions: {
    type: Array,
    default: []
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

const Role = mongoose.model('Role', roleSchema, "roles");
// Model là 1 bản ghi: gồm tên model, schema và tên collection

module.exports = Role;