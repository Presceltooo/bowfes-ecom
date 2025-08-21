const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user_id: String,
  room_chat_id: String,
  content: String,
  images: Array,
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

const Chat = mongoose.model('Chat', chatSchema, "chats");
// Model là 1 bản ghi: gồm tên model, schema và tên collection

module.exports = Chat;