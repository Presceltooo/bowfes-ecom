const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // user_id: String,
  cart_id: String,
  userInfo: {
    fullName: String,
    phone: String,
    address: String,
  },
  products: [
    {
      product_id: String,
      price: Number,
      discountPercentage: Number,
      quantity: Number
    }
  ]
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema, "orders");
// Model là 1 bản ghi: gồm tên model, schema và tên collection

module.exports = Order;