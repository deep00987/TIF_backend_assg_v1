const {Snowflake} = require("@theinternetfolks/snowflake")

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: () => Snowflake.generate()
  }, 
  name: {
    type: String,
    required: true,
    maxlength: 64,
    default: null
  },
  email: {
    type: String,
    maxlength: 128,
    unique: true,
    required: true
  },
  password: {
    type: String,
    maxlength: 64,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', function(next) {
  if (!this._id) {
    // Generate a Snowflake ID if _id is not already set
    this._id = Snowflake.generate()
  }
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
