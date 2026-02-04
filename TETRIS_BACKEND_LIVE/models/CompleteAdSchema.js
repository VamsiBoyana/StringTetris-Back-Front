const mongoose = require("mongoose");

const CompletedAdsSchema = new mongoose.Schema({
    adName: { type: String, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    adId: { type: mongoose.Schema.Types.ObjectId, ref: "Ads_Data", required: true },
   // AdSDK: { type: String, default: null },
    adImage: { type: String, default: null },
    rewardPoints: { type: Number, default: 0 },
    adCount: {
        type: Number,
        default: 0,
    },
    adTimer_InMinutes: {
        type: Number,
        default: 0,
    },
    addedBy: {
        type: mongoose.Types.ObjectId,
        ref: "user" // Reference to the user who added the ad
    },
    status: {
        type: String,
        enum: ["COMPLETED"],
    },
    userName: {
        type: String,
        default: null
    },
    // CompletedBy is added to track who completed the ad
    completedBy: {
        type: mongoose.Types.ObjectId,
        ref: "user", // Reference to the user who completed the ad
        default: null
    },
    // CompletedAt is added to track when the ad was completed
    completedAt: {
        type: Date,
        default: null
    },
    initialBalance: {
        type: Number, default: 0
    },
    finalBalance: {
        type: Number, default: 0
    },
  completionTime: { type: Date, default: Date.now },
  adId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdsData', required: true },  // Ensure this is a reference

},
    {
        timestamps: true, // Automatically includes createdAt and updatedAt
        toJSON: { virtual: true },
        toObject: { virtual: true },
    });

module.exports = mongoose.model("CompleteAdData", CompletedAdsSchema);
