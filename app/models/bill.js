const {Schema, mongoose} = require("mongoose");
const {BILL_PENDING} = require("../util/constants");

const billSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    user_email: {
        type: String,
        required: true
    },
    package_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package'
    },
    status: {
        type: String,
        default: BILL_PENDING,
        required: true
    },
    clover_session: {
        type: String,
    },
    clover_id: {
        type: String,
    },
    features: {
        type: [Schema.Types.Mixed],
    },
    contain_invoice: {
        type: Boolean,
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});

const Bill = mongoose.model('Bill', billSchema);

module.exports = { Bill };
