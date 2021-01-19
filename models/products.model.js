const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    image: [],
    name : String,
    price : Number,
    quantity : Number,
    color : String,
    kind : String ,
    "description": String
});
const Product = mongoose.model('Product', productSchema);
module.exports = Product;