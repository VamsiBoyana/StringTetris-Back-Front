const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        // taskId: {
        //     type: String,
        //     required: false
        // },
        taskName: {
            type: String,
            required: true,
        },
        status: { type: String, enum: ["ACTIVE", "INACTIVE", "PENDING", "COMPLETED", "DISABLED"], default: "ACTIVE" },
        rewardPoints: {
            type: Number,
            default: 0,
        },
        // InitialBalance: { type: Number, default: null },
        // FinalBalance: { type: Number, default: null },
        subTask: { type: String, default: null },
        description: { type: String, default: null },
        siteLink: { type: String, default: null },
        taskImage: { type: String, default: null },
        siteImg: { type: String, default: null },
    }, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtual: true },
    toObject: { virtual: true },
}
);

module.exports = mongoose.model("Task", taskSchema);
