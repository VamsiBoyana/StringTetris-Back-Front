const mongoose = require("mongoose");

const ReferralSettingSchema = new mongoose.Schema({
  referralAmount: { type: Number, required: true },    // reward points
  signupBonus : { type: Number, required: true }, 
  referral_Note : {type : String, required:false},
  botName : {type:String ,required:false},
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "INACTIVE",  // keep inactive by default until enabled
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ReferralSetting", ReferralSettingSchema);
