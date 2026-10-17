
const mongoose = require("mongoose");

const decisionSchema = new mongoose.Schema(
    {
        scenario: {
            type: String,
            required: true,
            trim: true
        },
        criteria: {
            type: [mongoose.Schema.Types.Mixed],
            required: true
        },
        options: {
            type: [mongoose.Schema.Types.Mixed],
            required: true
        },
        rankings: {
            type: [mongoose.Schema.Types.Mixed],
            required: true
        },
        totalWeight: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Decision", decisionSchema);
