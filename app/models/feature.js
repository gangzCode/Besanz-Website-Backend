const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feature'
    },
    price: {
        type: Number,
        required: true
    }
});

const Feature = mongoose.model('Feature', featureSchema);

module.exports = { Feature };
