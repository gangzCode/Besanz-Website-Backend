const {Schema, mongoose} = require("mongoose");

const packageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    features: {
        type: [Schema.Types.Mixed],
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});

const Package = mongoose.model('Package', packageSchema);

module.exports = { Package };
