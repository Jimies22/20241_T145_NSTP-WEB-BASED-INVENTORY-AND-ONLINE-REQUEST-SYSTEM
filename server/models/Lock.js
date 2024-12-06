const mongoose = require("mongoose");

const lockSchema = new mongoose.Schema({
    button: {
        type: String,
        required: true,
        unique: true
    },
    isLocked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Lock", lockSchema);