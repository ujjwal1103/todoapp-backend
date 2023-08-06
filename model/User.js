
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unquie: true
    },
    password: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["male","female","other"]
    },
    mobileNumber: {
      type: String,
      validate: {
        validator: (value)=> {
          return !value || /^\d{10}$/.test(value);
        },
        message: props =>
          props.value
            ? `${props.value} is not a valid 10-digit phone number`
            : 'Phone number should be a valid 10-digit number or empty'
      }
  
    },
    dp: {
      type: String,
      default:"https://firebasestorage.googleapis.com/v0/b/image-upload-b22f2.appspot.com/o/images%2Favatar.svg?alt=media&token=506117cf-32ff-4aae-be4b-33ad5c3318ca"
    },
    isGoogleLogin: {
      type: Boolean,
      default: false,
    }
  },{timestamps:true});
  
  const User = mongoose.model('User', userSchema);
  
  module.exports = User;