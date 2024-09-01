const {mongoose} = require("mongoose");

const cloverLogSchema = new mongoose.Schema({
    session_id: {
        type: String,
    },
    user_email: {
        type: String,
    },
    type: {
        type: String,
    },
    status: {
        type: String,
    },
    json: {
        type: mongoose.Schema.Types.Mixed,
    },
    time_stamp: {
        type: Date,
        default: Date.now
    }
});

const CloverLog = mongoose.model('CloverLog', cloverLogSchema);

module.exports = { CloverLog };
