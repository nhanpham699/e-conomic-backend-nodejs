const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({
    image: [],
    name : String,
    price : Number,
    quantity : Number,
    color : String,
    kind : String ,
    size : String,
    description : String,
    productId: String,
    userId: String
});
const Cart = mongoose.model('cart', cartSchema);
module.exports = Cart;