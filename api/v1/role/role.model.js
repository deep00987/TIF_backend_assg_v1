const mongoose = require('mongoose');
const {Snowflake} = require("@theinternetfolks/snowflake")

const roleSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: () => Snowflake.generate(),
    },
    name: {
      type: String,
      required: true,
      maxlength: 64,
      unique: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

roleSchema.pre('save', function(next) {
    if (!this._id) {
      // Generate a Snowflake ID if _id is not already set
      this._id = Snowflake.generate()
    }
    next();
})

const Role = mongoose.model('Role', roleSchema);

module.exports = {Role};
