const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    date: Date,
    total: Number,
    status: Number,
    address: String,
    phone: String,
    note: String,
    email: String,
    name: String,
    products: [],
    userId: String
});
const Order = mongoose.model('order', orderSchema);
module.exports = Order;