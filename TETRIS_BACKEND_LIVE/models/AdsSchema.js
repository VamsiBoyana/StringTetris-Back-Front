const mongoose = require("mongoose");

const AdsSchema = new mongoose.Schema({
    adName: { type: String, default: null },
    adSDK: { type: String, default: null },
    adImage: { type: String, default: null },
    rewardPoints: { type: Number, default: 0 },
    adCount: {
        type: Number,
        default: 0,
    },
    adTimer_InMinutes: {
        type: Number,
        default: 60,
    },
    addedBy: {
        type: mongoose.Types.ObjectId,
        ref: "user"
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE", "DELETE"],
        //default: taskStatus.ACTIVE
    },
    claimedAt: { type: Date, default: null },  // Added to track when the ad was claimed

},
    {
        timestamps: true,
        toJSON: { virtual: true },
        toObject: { virtual: true },
    });

const AdsData = mongoose.model("Ads_Data", AdsSchema);
module.exports = AdsData;