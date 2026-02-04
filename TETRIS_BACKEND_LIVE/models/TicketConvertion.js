const mongoose = require("mongoose");

const ticketConvertionSchema = new mongoose.Schema(
  {
    ticketQuantity: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "INACTIVE", // keep inactive by default until enabled
    },
    amountInToken: {
      type: Number,
      default: 0,
    },
    defaultAdminWallet: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtual: true },
    toObject: { virtual: true },
  }
);

module.exports = mongoose.model("TicketConvertion", ticketConvertionSchema);
