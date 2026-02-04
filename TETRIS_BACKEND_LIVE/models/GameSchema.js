const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the level schema separately
const levelSchema = new Schema({
  level: { type: String, required: true },
  // blockSpeed: { type: String, required: true },
  linesPerLevel: { type: Number, required: true },
  perLinescore: { type: Number, required: true },
  speedPerLevel: { type: Number, required: true },
  multiplier: { type: Number, required: true },
  quitPopUp: { type: String, required: true },
  lives: { type: Number, required: false },

  // playerspeed: { type: String, required: true },
});


//Ads SDK's
// const adsdkSchema = new Schema({
//   adSDK :{
//     type : String,
//     required : true
//   }
// })

// Define the main game schema
const gameControllerSchema = new Schema(
  {
    gameTitle: { type: String },
    gamePic: { type: String },
    level: { type: [levelSchema], default: [] }, // Reference to the level schema
    lives: { type: Number, required: false },
    disclaimer: { type: String },
    min: { type: Number, default: 10 },
    max: { type: Number, default: 30 },
   status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "INACTIVE", // keep inactive by default until enabled
    },
  },
  { timestamps: true }
);

// Create and export the game model
module.exports = mongoose.model("GameController", gameControllerSchema);
