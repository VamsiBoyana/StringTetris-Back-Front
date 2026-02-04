const mongoose = require("mongoose");


const DailyRewardSchema = new mongoose.Schema(
    {
        rewardPoints: {
            type: Number,
            default: 0,
        },
        addedBy: {
            type: mongoose.Types.ObjectId,
            ref: "user",
        },

        status: {
            type: String,
            default: "ACTIVE",
        },
    },
    {
        timestamps: true,
        toJSON: { virtual: true },
        toObject: { virtual: true },
    })

const DailyRewardplan = mongoose.model("daily_reward", DailyRewardSchema);
module.exports = DailyRewardplan;