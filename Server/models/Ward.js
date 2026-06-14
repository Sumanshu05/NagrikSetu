const mongoose = require("mongoose");

const wardSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        zone: {
            type: String,
            trim: true,
        },
        wardNumber: {
            type: Number,
        },
        officers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        city: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Ward", wardSchema);