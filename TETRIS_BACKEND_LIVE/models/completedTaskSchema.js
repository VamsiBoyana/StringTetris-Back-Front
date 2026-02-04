const mongoose = require("mongoose");

const CompletedTaskSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    userName: { type: String, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // userId: { type: String, required: true },

    taskName: { type: String, required: true },
    rewardPoints: { type: Number, required: true },
    status: { type: String, default: "COMPLETED" },
    completionTime: { type: Date, default: Date.now },
    initialBalance: {
        type: Number, default: null
    },
    finalBalance: {
        type: Number, default: null
    }
});

module.exports = mongoose.model("CompletedTask", CompletedTaskSchema);