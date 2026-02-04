const mongoose = require("mongoose");
const TicketConvertion = require("./TicketConvertion");

const withdrawalLimitsSchema = mongoose.Schema({
  minWithdrawal: {
    type: Number,
    required: false,
    // default: 10,
  },
  maxWithdrawal: {
    type: Number,
    required: false,
    // default: 500,
  },
  // fee_Wallet: {
  //   type: String,
  // },
  token_Mint: {
    type: String,
  },
  withdraw_Note: {
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
    required: true
  },
  fee_Wallet: {
    type: String,
    required: true,
  },
  withdrawalCount: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "DELETE"],
    default: TicketConvertion.ACTIVE,
  },

},
{ timestamps: true });

module.exports = mongoose.model("WithdrawLimits", withdrawalLimitsSchema);
