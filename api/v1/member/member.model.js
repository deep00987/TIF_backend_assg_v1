const mongoose = require('mongoose');
const { Snowflake } = require("@theinternetfolks/snowflake");

const memberSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => Snowflake.generate(),
    },
    community: {
        type: String,
        ref: 'Community',
        required: true,
    },
    user: {
        type: String,
        ref: 'User',
        required: true,
    },
    role: {
        type: String,
        ref: 'Role',
        required: true,
    },
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
});

memberSchema.pre('save', function(next) {
    if (!this._id) {
      // Generate a Snowflake ID if _id is not already set
      this._id = Snowflake.generate()
    }
    next();
})

const Member = mongoose.model('Member', memberSchema);

module.exports = {Member};
