const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: String,
    username: {
      type: String,
      require: true
    },   
    password: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String
});
const User = mongoose.model('User', userSchema);
module.exports = User;