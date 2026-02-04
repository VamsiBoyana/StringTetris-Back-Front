const mongoose = require("mongoose");

var WithdrawSettingSchema = new Schema(
    {
      
      fee_Wallet: {
        type: String,
      },
      token_Mint:{
        type: String,
      },
      min_Withdraw: {
        type: Number,
      },
      max_Withdraw: {
        type: Number,
      },
      withdraw_Note:{
        type: String,
      },
      percentage_Charge: {
        type: Number,
      },
      fixed_Charge: {
        type: Number,
      },
      symbol: {
        type: String,
      },
      status: {
          type: String,
          enum: ["ACTIVE", "INACTIVE", "DELETE"],
          default: ticketStatus.ACTIVE,
      },
    },
    { timestamps: true }
  );
  

  module.exports = mongoose.model("WithdrawSetting", WithdrawSettingSchema);
