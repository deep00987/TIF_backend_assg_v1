const mongoose = require('mongoose');
const { Snowflake } = require("@theinternetfolks/snowflake");
const lodash = require('lodash');

const communitySchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
            default: () => Snowflake.generate()
        },
        name: {
            type: String,
            maxlength: 128,
            required: true
        },
        slug: {
            type: String,
            maxlength: 255,
            unique: true,
            default: null,
        },
        owner: {
            type: String,
            ref: 'User',
            required: true
        },

    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    }

);

communitySchema.pre('save', function (next) {
    if (!this._id) {
        // Generate a Snowflake ID if _id is not already set
        this._id = Snowflake.generate()
    }

    if (!this.slug) {
        this.slug = lodash.kebabCase(this.name)
    }
    next();
})


const Community = mongoose.model('Community', communitySchema);

module.exports = { Community };
