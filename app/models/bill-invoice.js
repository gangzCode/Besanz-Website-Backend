const mongoose = require("mongoose");

const billInvoiceSchema = new mongoose.Schema({
    bill_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill'
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    data: {
        type: String,
    },
});

const BillInvoice = mongoose.model('BillInvoice', billInvoiceSchema);

module.exports = { BillInvoice };
