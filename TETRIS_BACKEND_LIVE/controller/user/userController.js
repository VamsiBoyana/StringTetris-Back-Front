const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../../models/userSchema");
const Referral = require("../../models/refererSchema");
const jwt = require("jsonwebtoken");
const Withdraw = require("../../models/withdrawlSchema");
const RewardSetting = require("../../models/rewardSettingSchema"); // Ensure the correct path
const { faker } = require("@faker-js/faker");
const ClaimHistory = require("../../models/claimHistorySchema");
const AdsData = require("../../models/AdsSchema");
const CompleteAdData = require("../../models/CompleteAdSchema");
const ReferralSetting = require("../../models/refferalSettingSchema");
const TicketConvertion = require("../../models/TicketConvertion");
const withdrawLimits = require("../../models/WithdrawalLimitsSchema");
const TonWeb = require("tonweb");
const GameHistory = require("../../models/gameHistorySchema");
const refferalSettingSchema = require("../../models/refferalSettingSchema");
const { Address } = TonWeb.utils;
const moment = require("moment");
const web3 = require("@solana/web3.js");

// const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key"; // make sure to use env var for prod

// const login = async (req, res) => {
//   const { chatId, userName, profilePic, referalId } = req.body;

//   if (!chatId) {
//     return res.status(400).json({ message: "Please provide chatId" });
//   }

//   // const  referralAmount = await ReferralSetting.findOne({status:"ACTIVE"});
//   //   if(!referralAmount){
//   //     return res.status(404).json({message:"Signup Bonus not found"});
//   //   }
//   //   console.log(referralAmount.referralAmount,"referralAmount");

//   try {
//     const generateToken = (user) => {
//       return jwt.sign(
//         { user: { id: user._id } },
//         process.env.ACCESS_TOKEN_SECRET,
//         { expiresIn: "24h" }
//       );
//     };

//     let user = await User.findOne({ chatId });
//     let isNewUser = false;

//     if (!user) {
//       // Handle referral user if refererId is provided
//       let refererUser = null;
//       if (referalId) {
//         refererUser = await User.findOne({ chatId: referalId });
//         if (!refererUser) {
//           return res
//             .status(400)
//             .json({ message: "Invalid referral ID provided" });
//         }
//       }

//       // Get initial ticket amount for signup
//       // const amount = 2000;
//       let Bonus = await ReferralSetting.findOne({ status: "ACTIVE" });
//       if (!Bonus) {
//         return res.status(404).json({ message: "Signup Bonus not found" });
//       }
//       // console.log(Bonus, "Bonus");

//       // Generate referral link for new user
//       const referralLink = `https://t.me/${process.env.BOTNAME}/play?start=${chatId}`;

//       // Create new user
//       const newUser = new User({
//         chatId,
//         userName,
//         profilePic,
//         referalId,
//         ticketBalance: Bonus.signupBonus,
//         referrerId: refererUser ? refererUser._id : null,
//         referralLink,
//         loginType: "user",
//       });

//       user = await newUser.save();
//       isNewUser = true;
//       // console.log("User created");

//       // 5️⃣ Referral reward logic
//       if (refererUser) {
//         const existingReferral = await Referral.findOne({
//           referredUser: user._id,
//           referringUser: refererUser._id,
//         });

//         const initialBalance = refererUser.ticketBalance;
//         refererUser.ticketBalance += Bonus.referralAmount; // Add the reward to the referrer's balance
//         const finalBalance = refererUser.ticketBalance;

//         const newReferral = new Referral({
//           referredUser: user._id,
//           referringUser: refererUser._id,
//           referralAmount: Bonus.referralAmount,
//           initialBalance,
//           finalBalance,
//           createdAt: new Date(),
//         });

//         await newReferral.save();

//         // Add the referral to the referrer's referrals array and update the referrer
//         await User.findByIdAndUpdate(
//           refererUser._id,
//           { $addToSet: { referrals: newReferral.toObject() } },
//           { new: true }
//         );

//         await refererUser.save();
//       }
//     } else {
//       console.log("User logged in");
//     }

//     const token = generateToken(user);

//     // Build consistent user object to send back
//     const userResponse = {
//       id: user._id,
//       userName: user.userName,
//       profilePic: user.profilePic,
//       ticketBalance: user.ticketBalance,
//       referalId: user.referalId,
//       referrerId: user.referrerId,
//       loginType: user.loginType,
//       referralLink: user.referralLink,
//     };

//     return res.status(200).json({
//       message: isNewUser
//         ? `Welcome ${userName}! Your account is created.`
//         : "Login successful",
//       token,
//       user: userResponse,
//     });
//   } catch (error) {
//     console.error("Failed to log in user:", error);
//     return res
//       .status(500)
//       .json({ message: "Unable to log in", error: error.message });
//   }
// };
const login = async (req, res) => {
  const {  referalId } = req.body;
 
    const userData = req.userData;
 
    // Destructure to extract the required fields
const { id, first_name, photo_url } = userData;
 
const chatId = id
const userName = first_name
const profilePic = photo_url
   
  if (!chatId) {
    return res.status(400).json({ message: "Please provide chatId" });
  }
 
  try {
    const generateToken = (user) => {
      return jwt.sign(
        { user: { id: user._id } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "24h" }
      );
    };

    let user = await User.findOne({ chatId });
    let isNewUser = false;

    if (!user) {
      // Handle referral user if refererId is provided
      let refererUser = null;
      if (referalId) {
        refererUser = await User.findOne({ chatId: referalId });
        if (!refererUser) {
          return res
            .status(400)
            .json({ message: "Invalid referral ID provided" });
        }
      }

      // Get initial ticket amount for signup
      // const amount = 2000;
      let Bonus = await ReferralSetting.findOne({ status: "ACTIVE" });
      if (!Bonus) {
        return res.status(404).json({ message: "Signup Bonus not found" });
      }
      // console.log(Bonus, "Bonus");

      // Generate referral link for new user
      // const referralLink = `https://t.me/${process.env.BOTNAME}/play?start=${chatId}`;

      // Create new user
      const newUser = new User({
        chatId,
        userName,
        profilePic,
        referalId,
        ticketBalance: Bonus.signupBonus,
        referrerId: refererUser ? refererUser._id : null,
        // referralLink,
        loginType: "user",
      });

      user = await newUser.save();
      isNewUser = true;
      // console.log("User created");

      // 5️⃣ Referral reward logic
      if (refererUser) {
        const existingReferral = await Referral.findOne({
          referredUser: user._id,
          referringUser: refererUser._id,
        });

        const initialBalance = refererUser.ticketBalance;
        refererUser.ticketBalance += Bonus.referralAmount; // Add the reward to the referrer's balance
        const finalBalance = refererUser.ticketBalance;

        const newReferral = new Referral({
          referredUser: user._id,
          referringUser: refererUser._id,
          referralAmount: Bonus.referralAmount,
          initialBalance,
          finalBalance,
          createdAt: new Date(),
        });

        await newReferral.save();

        // Add the referral to the referrer's referrals array and update the referrer
        await User.findByIdAndUpdate(
          refererUser._id,
          { $addToSet: { referrals: newReferral.toObject() } },
          { new: true }
        );

        await refererUser.save();
      }
    } else {
      console.log("User logged in");
    }

    const token = generateToken(user);

    // Build consistent user object to send back
    const userResponse = {
      id: user._id,
      userName: user.userName,
      profilePic: user.profilePic,
      ticketBalance: user.ticketBalance,
      referalId: user.referalId,
      referrerId: user.referrerId,
      loginType: user.loginType,
      referralLink: user.referralLink,
    };

    return res.status(200).json({
      message: isNewUser
        ? `Welcome ${userName}! Your account is created.`
        : "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Failed to log in user:", error);
    return res
      .status(500)
      .json({ message: "Unable to log in", error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.params._id;
    const { userName, email, profilepic } = req.body;

    if (!userId) {
      return res.status(404).json({ message: "User ID is required" });
    }

    // Fetch the user from the database using the findById method
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user fields
    if (userName) user.userName = userName;
    if (profilepic) user.profilepic = profilepic;

    // Save the updated user
    await user.save();

    res.status(200).json({
      message: `Your Profile updated successfully ${userName}...`,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        ticketBalance: user.ticketBalance,
        loginType: user.loginType,
        profilepic: user.profilepic, // Include updated fields as needed
      },
    });
  } catch (error) {
    console.error("Failed to update profile:", error);
    res.status(500).json({ message: "Unable to update profile" });
  }
};

const getProfile = async (req, res) => {
  try {
    // The `req.user` is populated by the `validateToken` middleware
    const userId = req.params._id;

    if (!userId) {
      return res.status(404).json({ message: "User ID is required" });
    }

    // Fetch the user from the database using the findById method
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      Note: "Please enter a valid TON wallet address to receive your payment. The withdrawal process will take 1 to 24 hours",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        ticketBalance: user.ticketBalance,
        loginType: user.loginType,
        referralLink: user.referralLink,
        profilePic: user.profilePic, // Include additional fields as needed
      },
      // user
    });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    res.status(500).json({ message: "Unable to fetch profile" });
  }
};

const getGameStats= async (req, res) => {
  try {
    const userId = req.params._id;

    if (!userId) {
      return res.status(404).json({ message: "User ID is required" });
    }

    const userStats=await GameHistory.countDocuments({userId});
    const wons = await GameHistory.countDocuments({ userId, playedStatus: "WON" });
    res.status(200).json({
      message: "user game stats fetched successfully",
      userGameStats: {
        id: userId,
        totalGamesPlayed: userStats,
        wins: wons,
        losses: userStats - wons,
      },
    });
  }

  catch (error) { 
    console.error("Failed to fetch profile:", error); 
    res.status(500).json({ message: "Unable to fetch profile" });
  }
}

// Submit a withdrawal request

// const withdrawrequest = async (req, res) => {
//   console.log(req.body, "jisd");

//   const userId = req.params._id;
//   const { amount, walletAddress, token } = req.body;

//   try {
//     // Validate amount
//     if (typeof amount !== "number" || amount <= 0) {
//       return res
//         .status(400)
//         .json({ message: "Amount must be a positive number" });
//     }
//     // Validate walletAddress presence & type
//     if (!walletAddress || typeof walletAddress !== "string") {
//       return res
//         .status(400)
//         .json({ message: "walletAddress is required and must be a string" });
//     }

//     // Validate token (only TON allowed)
//     if (!token || token !== "TON") {
//       return res
//         .status(400)
//         .json({ message: "Token must be 'TON' for TON withdrawal" });
//     }

//     // TON wallet address validation with TonWeb
//     // Validate TON wallet address properly
//     const isValid = TonWeb.utils.Address.isValid(walletAddress);
//     if (!isValid) {
//       return res.status(400).json({ message: "Invalid TON wallet address" });
//     }

//     const firstChar = walletAddress.charAt(0);

//     // According to TEP-2:
//     // E... (bounceable, mainnet)
//     // U... (non-bounceable, mainnet)
//     // k... (bounceable, testnet)
//     // 0... (non-bounceable, testnet)

//     if (firstChar === "E" || firstChar === "U") {
//       console.log("This is a Mnet address");
//     } else if (firstChar === "k" || firstChar === "0") {
//       return res.status(400).json({ message: "Enter Mnet wallet address" });
//     } else {
//       console.log("Unknown network type");
//       return res.status(400).json({ message: "please enter a valid address" });
//     }

//     // Check if address is bounceable
//     if (firstChar === "E" || firstChar === "k") {
//       console.log("This is a bounceable address");
//     } else if (firstChar === "U" || firstChar === "0") {
//       console.log("This is a non-bounceable address");
//     }
//     // Atomic balance deduction & user fetch
//     const user = await User.findOneAndUpdate(
//       { _id: userId, ticketBalance: { $gte: amount } },
//       { $inc: { ticketBalance: -amount } },
//       { new: true }
//     );
//     if (!user) {
//       return res
//         .status(400)
//         .json({ message: "User not found or insufficient balance" });
//     }

//     // Fetch conversion rate
//     const conversion = await TicketConvertion.findOne({ Status: "ACTIVE" });
//     if (!conversion) {
//       return res
//         .status(500)
//         .json({ message: "Ticket conversion rate not found" });
//     }

//     const withdrawallimits = await withdrawLimits.findOne({ status: "ACTIVE" });
//     if (!withdrawallimits) {
//       return res
//         .status(404)
//         .json({ message: "withdrawal Method is not found" });
//     }

//     const Money =
//       (amount * conversion.AmountInToken) / conversion.TicketQuantity;
//     const charge = (Money * withdrawallimits.Percentage_Charge) / 100;
//     const afterCharge = Money - charge;
//     console.log("Converted Money:", Money);
//     console.log("Converted charge:", charge);
//     console.log("Converted afterCharge:", afterCharge);

//     // Create withdrawal request
//     const request = new Withdraw({
//       userId,
//       amount,
//       USDT_Amount: Money,
//       userName: user.userName,
//       walletAddress,
//       charge: charge,
//       After_Charge: afterCharge,
//       token,
//       status: "pending",
//     });

//     const savedRequest = await request.save();

//     return res.status(200).json({
//       status: "success",
//       message: "Withdrawal request submitted successfully.",
//       request: savedRequest,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to create withdrawal request",
//       error: error.message,
//     });
//   }
// };

// const withdrawrequest = async (req, res) => {
//   console.log(req.body, "jisd");

//   const userId = req.params._id;
//   const { amount, walletAddress, token } = req.body;

//   try {

//        // Check if user has made a withdrawal in the last 24 hours
//     const withdrawallimits = await withdrawLimits.findOne({ status: "ACTIVE" });
//     if (!withdrawallimits) {
//       return res
//         .status(404)
//         .json({ message: "Withdrawal method not found" });
//     }

//     console.log("withdrawallimits",withdrawallimits);

//     // Validate amount
//    if (amount <= withdrawLimits.minWithdrawal || amount >= withdrawLimits.maxWithdrawal) {
//   return res
//     .status(400)
//     .json({ message: `Amount must be within the ${withdrawLimits.minWithdrawal} USDT and ${withdrawLimits.maxWithdrawal} USDT` });
// }
//     // Validate walletAddress presence & type
//     if (!walletAddress || typeof walletAddress !== "string") {
//       return res
//         .status(400)
//         .json({ message: "walletAddress is required and must be a string" });
//     }

//     // Validate token (only TON allowed)
//     if (!token || token !== "TON") {
//       return res
//         .status(400)
//         .json({ message: "Token must be 'TON' for TON withdrawal" });
//     }

//     // TON wallet address validation with TonWeb
//     const isValid = TonWeb.utils.Address.isValid(walletAddress);
//     if (!isValid) {
//       return res.status(400).json({ message: "Invalid TON wallet address" });
//     }

//     const firstChar = walletAddress.charAt(0);

//     // TEP-2 address validation (testnet/mainnet)
//     if (firstChar === "k" || firstChar === "0") {
//       console.log("This is a testnet address");
//     } else if (firstChar === "E" || firstChar === "U") {
//       return res.status(400).json({ message: "Enter testnet wallet address" });
//     } else {
//       console.log("Unknown network type");
//       return res.status(400).json({ message: "Please enter a valid address" });
//     }

//     const allowedWithdrawalsPerDay = withdrawallimits.withdrawalCount;

//      console.log(withdrawallimits.withdrawalCount,"allowedWithdrawalsPerDay");

//        // Get the start and end of the current day to filter completed ads by user
//          const startOfDay = moment().startOf('day').toDate();
//          const endOfDay = moment().endOf('day').toDate();

//          console.log(startOfDay,"startOfDay");
//          console.log(endOfDay,"endOfDay");

//     const recentWithdrawals = await Withdraw.find({

//       createdAt: { $gte: startOfDay, $lte: endOfDay },
//        userId,
//       // status: "pending",
//     });
//     console.log("Number of recent withdrawals: ", recentWithdrawals);

//     if (recentWithdrawals.length >= allowedWithdrawalsPerDay) {
//       return res.status(400).json({
//         message: `You have already reached the maximum number of withdrawal requests for today (${allowedWithdrawalsPerDay}). Please try again tomorrow.`,
//       });
//     }

//     // Atomic balance deduction & user fetch
//     const user = await User.findOneAndUpdate(
//       { _id: userId, ticketBalance: { $gte: amount } },
//       { $inc: { ticketBalance: -amount } },
//       { new: true }
//     );
//     if (!user) {
//       return res
//         .status(400)
//         .json({ message: "User not found or insufficient balance" });
//     }

//     // Fetch conversion rate
//     const conversion = await TicketConvertion.findOne({ Status: "ACTIVE" });
//     if (!conversion) {
//       return res
//         .status(500)
//         .json({ message: "Ticket conversion rate not found" });
//     }

//     console.log(conversion,"conversion");

//     const Money = (amount * conversion.AmountInToken) / conversion.TicketQuantity;
//     const charge = (Money * withdrawallimits.Percentage_Charge) / 100;
//     const afterCharge = Money - charge;
//     console.log(conversion.AmountInToken,conversion.TicketQuantity);
//     console.log("hgqeuiguy32gryg",`${(amount * conversion.AmountInToken) / conversion.TicketQuantity}`);
//     console.log("charge2",`${Money * withdrawallimits.Percentage_Charge}`);
//     console.log("withdrawallimits.percentage_charge",withdrawallimits.Percentage_Charge);

//     console.log("Converted Money:", Money);
//     console.log("Converted charge:", charge);
//     console.log("Converted afterCharge:", afterCharge);

//     // Create withdrawal request
//     const request = new Withdraw({
//       userId,
//       amount,
//       USDT_Amount: Money,
//       userName: user.userName,
//       walletAddress,
//       charge: charge,
//       After_Charge: afterCharge,
//       token,
//       status: "pending",

//     });

//     const savedRequest = await request.save();

//     return res.status(200).json({
//       status: "success",
//       message: "Withdrawal request submitted successfully...",
//       request: savedRequest,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to create withdrawal request",
//       error: error.message,
//     });
//   }
// };

// const withdrawrequest = async (req, res) => {
//   console.log(req.body, "jisd");

//   const userId = req.params._id;
//   const { amount, walletAddress, token } = req.body;

//   try {
//     // Validate amount
//     if (typeof amount !== "number" || amount <= 0) {
//       return res
//         .status(400)
//         .json({ message: "Amount must be a positive number" });
//     }
//     // Validate walletAddress presence & type
//     if (!walletAddress || typeof walletAddress !== "string") {
//       return res
//         .status(400)
//         .json({ message: "walletAddress is required and must be a string" });
//     }

//     // Validate token (only TON allowed)
//     if (!token || token !== "TON") {
//       return res
//         .status(400)
//         .json({ message: "Token must be 'TON' for TON withdrawal" });
//     }

//     // TON wallet address validation with TonWeb
//     // Validate TON wallet address properly
//     const isValid = TonWeb.utils.Address.isValid(walletAddress);
//     if (!isValid) {
//       return res.status(400).json({ message: "Invalid TON wallet address" });
//     }

//     const firstChar = walletAddress.charAt(0);

//     // According to TEP-2:
//     // E... (bounceable, mainnet)
//     // U... (non-bounceable, mainnet)
//     // k... (bounceable, testnet)
//     // 0... (non-bounceable, testnet)

//     if (firstChar === "E" || firstChar === "U") {
//       console.log("This is a Mnet address");
//     } else if (firstChar === "k" || firstChar === "0") {
//       return res.status(400).json({ message: "Enter Mnet wallet address" });
//     } else {
//       console.log("Unknown network type");
//       return res.status(400).json({ message: "please enter a valid address" });
//     }

//     // Check if address is bounceable
//     if (firstChar === "E" || firstChar === "k") {
//       console.log("This is a bounceable address");
//     } else if (firstChar === "U" || firstChar === "0") {
//       console.log("This is a non-bounceable address");
//     }
//     // Atomic balance deduction & user fetch
//     const user = await User.findOneAndUpdate(
//       { _id: userId, ticketBalance: { $gte: amount } },
//       { $inc: { ticketBalance: -amount } },
//       { new: true }
//     );
//     if (!user) {
//       return res
//         .status(400)
//         .json({ message: "User not found or insufficient balance" });
//     }

//     // Fetch conversion rate
//     const conversion = await TicketConvertion.findOne({ Status: "ACTIVE" });
//     if (!conversion) {
//       return res
//         .status(500)
//         .json({ message: "Ticket conversion rate not found" });
//     }

//     const withdrawallimits = await withdrawLimits.findOne({ status: "ACTIVE" });
//     if (!withdrawallimits) {
//       return res
//         .status(404)
//         .json({ message: "withdrawal Method is not found" });
//     }

//     const Money =
//       (amount * conversion.AmountInToken) / conversion.TicketQuantity;
//     const charge = (Money * withdrawallimits.Percentage_Charge) / 100;
//     const afterCharge = Money - charge;
//     console.log("Converted Money:", Money);
//     console.log("Converted charge:", charge);
//     console.log("Converted afterCharge:", afterCharge);

//     // Create withdrawal request
//     const request = new Withdraw({
//       userId,
//       amount,
//       USDT_Amount: Money,
//       userName: user.userName,
//       walletAddress,
//       charge: charge,
//       After_Charge: afterCharge,
//       token,
//       status: "pending",
//     });

//     const savedRequest = await request.save();

//     return res.status(200).json({
//       status: "success",
//       message: "Withdrawal request submitted successfully.",
//       request: savedRequest,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to create withdrawal request",
//       error: error.message,
//     });
//   }
// };

// const withdrawrequest = async (req, res) => {
//   const userId = req.params._id;
//   const { amount, walletAddress, token } = req.body;

//   try {
//     // Check if user has made a withdrawal in the last 24 hours
//     const withdrawallimits = await withdrawLimits.findOne({ status: "ACTIVE" });
//     if (!withdrawallimits) {
//       return res.status(404).json({ message: "Withdrawal method not found" });
//     }

//     // Validate amount
//     if (
//       amount <= withdrawLimits.minWithdrawal ||
//       amount >= withdrawLimits.maxWithdrawal
//     ) {
//       return res.status(400).json({
//         message: `Amount must be within the ${withdrawLimits.minWithdrawal} USDT and ${withdrawLimits.maxWithdrawal} USDT`,
//       });
//     }
//     // Validate walletAddress presence & type
//     if (!walletAddress || typeof walletAddress !== "string") {
//       return res
//         .status(400)
//         .json({ message: "walletAddress is required and must be a string" });
//     }

//     // Validate token (only TON allowed)
//     if (!token || token !== "TON") {
//       return res
//         .status(400)
//         .json({ message: "Token must be 'TON' for TON withdrawal" });
//     }

//     // TON wallet address validation with TonWeb
//     const isValid = TonWeb.utils.Address.isValid(walletAddress);
//     if (!isValid) {
//       return res.status(400).json({ message: "Invalid TON wallet address" });
//     }

//     const firstChar = walletAddress.charAt(0);

//     // // TEP-2 address validation (testnet/mainnet)
//     // if (firstChar === "k" || firstChar === "0") {
//     //   console.log("This is a testnet address");
//     // } else if (firstChar === "E" || firstChar === "U") {
//     //   return res.status(400).json({ message: "Enter testnet wallet address" });
//     // } else {
//     //   console.log("Unknown network type");
//     //   return res.status(400).json({ message: "Please enter a valid address" });
//     // }

//        if (firstChar === "E" || firstChar === "U") {
//       console.log("This is a Mnet address");
//     } else if (firstChar === "k" || firstChar === "0") {
//       return res.status(400).json({ message: "Enter Mnet wallet address" });
//     } else {
//       console.log("Unknown network type");
//       return res.status(400).json({ message: "please enter a valid address" });
//     }

//     //     // Check if address is bounceable
//     //     if (firstChar === "E" || firstChar === "k") {
//     //       console.log("This is a bounceable address");
//     //     } else if (firstChar === "U" || firstChar === "0") {
//     //       console.log("This is a non-bounceable address");
//     //     }

//     const allowedWithdrawalsPerDay = withdrawallimits.withdrawalCount;

//     // console.log(withdrawallimits.withdrawalCount, "allowedWithdrawalsPerDay");

//     // Get the start and end of the current day to filter completed ads by user
//     const startOfDay = moment().startOf("day").toDate();
//     const endOfDay = moment().endOf("day").toDate();

//     // console.log(startOfDay, "startOfDay");
//     // console.log(endOfDay, "endOfDay");

//     const recentWithdrawals = await Withdraw.find({
//       createdAt: { $gte: startOfDay, $lte: endOfDay },
//       userId,
//       // status: "pending",
//     });
//     // console.log("Number of recent withdrawals: ", recentWithdrawals);

//     if (recentWithdrawals.length >= allowedWithdrawalsPerDay) {
//       return res.status(400).json({
//         message: `You have already reached the maximum number of withdrawal requests for today (${allowedWithdrawalsPerDay}). Please try again tomorrow.`,
//       });
//     }

//     // Atomic balance deduction & user fetch
//     const user = await User.findOneAndUpdate(
//       { _id: userId, ticketBalance: { $gte: amount } },
//       { $inc: { ticketBalance: -amount } },
//       { new: true }
//     );

//     if (!user) {
//       return res
//         .status(400)
//         .json({ message: "User not found or insufficient balance" });
//     }

//     // Fetch conversion rate
//     const conversion = await TicketConvertion.findOne({ status: "ACTIVE" });
//     if (!conversion) {
//       return res
//         .status(500)
//         .json({ message: "Ticket conversion rate not found" });
//     }

//     const Money =
//       (amount * conversion.amountInToken) / conversion.ticketQuantity;
//     const charge = (Money * withdrawallimits.percentage_Charge) / 100;
//     const afterCharge = Money - charge;

//     // Create withdrawal request
//     const request = new Withdraw({
//       userId,
//       amount,
//       usdt_Amount: Money,
//       userName: user.userName,
//       walletAddress,
//       charge: charge,
//       after_Charge: afterCharge,
//       token,
//       status: "PENDING",
//     });

//     const savedRequest = await request.save();

//     return res.status(200).json({
//       status: "success",
//       message: "Withdrawal request submitted successfully...",
//       request: savedRequest,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to create withdrawal request",
//       error: error.message,
//     });
//   }
// }; //without WB

const withdrawrequest = async (req, res) => {
  console.log(req.body, "jisd");
 
  const userId = req.params._id;
  const { amount, walletAddress, token } = req.body;
 
  try {
 
         // 🔐 Validate token presence
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Token is required and must be a string" });
    }
    // Check if user has made a withdrawal in the last 24 hours
    const withdrawallimits = await withdrawLimits.findOne({ status: "ACTIVE", symbol: token.toUpperCase() } );
    if (!withdrawallimits) {
      return res.status(404).json({ message: "Withdrawal method not found" });
    }
 
    console.log("withdrawallimits", withdrawallimits);
    // Fetch conversion rate
    const conversion = await TicketConvertion.findOne({ status: "ACTIVE" });
    if (!conversion) {
      return res
        .status(500)
        .json({ message: "Ticket conversion rate not found" });
    }
 
    console.log(conversion, "conversion");
 
    const Money =
      (amount * conversion.amountInToken) / conversion.ticketQuantity;
    const gfggvhb =
      (amount * conversion.amountInToken) / conversion.ticketQuantity;
    console.log(gfggvhb, "gfggvhb");
    console.log(
      `${amount} * ${conversion.amountInToken}) / ${conversion.ticketQuantity}`,
      "amount * conversion.amountInToken) / conversion.ticketQuantity"
    );
    console.log(Money, "Money");
 
    const charge = (Money * withdrawallimits.percentage_Charge) / 100;
    const afterCharge = Money - charge;
 
    console.log(
      ` dffgyguhbhjbh(${Money} <= ${withdrawallimits.minWithdrawal} || ${Money} >= ${withdrawallimits.maxWithdrawal})`,
      Money <= withdrawallimits.minWithdrawal ||
        Money >= withdrawallimits.maxWithdrawal
    );
 
    // Validate amount
    if (
      Money < withdrawallimits.minWithdrawal ||
      Money > withdrawallimits.maxWithdrawal
    ) {
      return res
        .status(400)
        .json({
          message: `Amount must be within the ${withdrawallimits.minWithdrawal} USDT and ${withdrawallimits.maxWithdrawal} USDT`,
        });
    }
    // Validate walletAddress presence & type
    if (!walletAddress || typeof walletAddress !== "string") {
      return res
        .status(400)
        .json({ message: "walletAddress is required and must be a string" });
    }
 
    // Validate token (only TON allowed)
    // if ( token !== "TON" || token !== "SOL") {
    //   return res
    //     .status(400)
    //     .json({ message: "Token must be 'TON' for TON withdrawal" });
    // }
 
    // TON wallet address validation with TonWeb
    // const isValid = TonWeb.utils.Address.isValid(walletAddress);
    // if (!isValid) {
    //   return res.status(400).json({ message: "Invalid TON wallet address" });
    // }
 
    // const firstChar = walletAddress.charAt(0);
 
    // // TEP-2 address validation (testnet/mainnet)
    // if (firstChar === "k" || firstChar === "0") {
    //   console.log("This is a testnet address");
    // } else if (firstChar === "E" || firstChar === "U") {
    //   return res.status(400).json({ message: "Enter testnet wallet address" });
    // } else {
    //   console.log("Unknown network type");
    //   return res.status(400).json({ message: "Please enter a valid address" });
    // }
 
    // if (firstChar === "k" || firstChar === "0") {
    //   console.log("Detected testnet address");
    // } else if (firstChar === "E" || firstChar === "U") {
    //   return res.status(400).json({ message: "Enter testnet wallet address" });
    // } else {
    //   return res.status(400).json({ message: "Please enter a valid address" });
    // }
 
        // ✅ 5) Address validation for TON or SOL
        if (token === "TON") {
          const isValid = TonWeb.utils.Address.isValid(walletAddress);
          if (!isValid) {
            return res.status(400).json({ message: "Invalid TON wallet address" });
          }
   
          const firstChar = walletAddress.charAt(0);
    if (firstChar === "E" || firstChar === "U") {
      console.log("This is a Mnet address");
    } else if (firstChar === "k" || firstChar === "0") {
      return res.status(400).json({ message: "Enter Mnet wallet address" });
    } else {
      console.log("Unknown network type");
      return res.status(400).json({ message: "please enter a valid address" });
    }
   
        } else if (token === "SOL") {
          try {
            const pubkey = new web3.PublicKey(walletAddress);
            const isOnCurve = web3.PublicKey.isOnCurve(pubkey.toBuffer());
            if (!isOnCurve) {
              return res.status(400).json({ message: "Invalid SOL wallet address (not on curve)" });
            }
          } catch (err) {
            return res.status(400).json({ message: "Invalid SOL wallet address" });
          }
        } else {
          return res.status(400).json({ message: "Unsupported token type" });
        }
 
    //     // Check if address is bounceable
    //     if (firstChar === "E" || firstChar === "k") {
    //       console.log("This is a bounceable address");
    //     } else if (firstChar === "U" || firstChar === "0") {
    //       console.log("This is a non-bounceable address");
    //     }
 
    const allowedWithdrawalsPerDay = withdrawallimits.withdrawalCount;
 
    console.log(withdrawallimits.withdrawalCount, "allowedWithdrawalsPerDay");
 
    // Get the start and end of the current day to filter completed ads by user
    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();
 
    console.log(startOfDay, "startOfDay");
    console.log(endOfDay, "endOfDay");
 
    const recentWithdrawals = await Withdraw.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      userId,
      // status: "pending",
    });
    console.log("Number of recent withdrawals: ", recentWithdrawals);
 
    if (recentWithdrawals.length >= allowedWithdrawalsPerDay) {
      return res.status(400).json({
        message: `You have already reached the maximum number of withdrawal requests for today (${allowedWithdrawalsPerDay}). Please try again tomorrow.`,
      });
    }
 
    // Atomic balance deduction & user fetch
    const user = await User.findOneAndUpdate(
      { _id: userId, ticketBalance: { $gte: amount } },
      { $inc: { ticketBalance: -amount } },
      { new: true }
    );
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found or insufficient balance" });
    }
 
    // Create withdrawal request
    const request = new Withdraw({
     userId,
      amount,
      usdt_Amount: Money,
      userName: user.userName,
      walletAddress,
      charge,
      after_Charge: afterCharge,
      token,
      status: "PENDING",
    });
 
    const savedRequest = await request.save();
 
    return res.status(200).json({
      status: "success",
      message: "Withdrawal request submitted successfully...",
      request: savedRequest,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to create withdrawal request",
      error: error.message,
    });
  }
};
 
 

//get withdraw status for user
// const getWithdrawStatus = async (req, res) => {
//   try {
//     const userId = req.params; // Extract userId from URL params

//     // Validate userId
//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
//     const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
//     const skip = (page - 1) * limit;


//     const withdrawStats= await Withdraw.find({userId})
   
//     // Fetch withdrawal requests for the user
//     const withdrawals = await Withdraw.find({ userId })
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const transferredAmount = withdrawStats
//       .filter((w) => w.status === "TRANSFERRED") 
//       .reduce((sum, w) => sum + (w.amount || 0), 0);

//     const AmountToTransfer=withdrawStats
//       .filter((w) => w.status === "PENDING"|| w.status === "APPROVED") 
//       .reduce((sum, w) => sum + (w.amount || 0), 0);


//     const count = await Withdraw.countDocuments({ userId });

//     const totalPages = Math.ceil(count / limit);

//     if (!withdrawals || withdrawals.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No withdrawal requests found for this user" });
//     }

//     return res.status(200).json({
//       message: "Withdrawal status fetched successfully",
//       page,
//       totalPages,
//       limit,
//       transferredAmount,
//       AmountToTransfer,
//       count: count,
//       withdrawals,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching withdrawal status:", error);
//     res
//       .status(500)
//       .json({ message: "Unable to fetch withdrawal status", error });
//   }
// }; //without WB


const getWithdrawStatus = async (req, res) => {
  try {
    const userId = req.params; // Extract userId from URL params
 
    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
 
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
    const skip = (page - 1) * limit;
 
 
    const withdrawStats= await Withdraw.find({userId})
   
    // Fetch withdrawal requests for the user
    const withdrawals = await Withdraw.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
 
    const transferredAmount = withdrawStats
      .filter((w) => w.status === "TRANSFERRED")
      .reduce((sum, w) => sum + (w.amount || 0), 0);
 
    const AmountToTransfer=withdrawStats
      .filter((w) => w.status === "PENDING"|| w.status === "APPROVED")
      .reduce((sum, w) => sum + (w.amount || 0), 0);
 
 
    const count = await Withdraw.countDocuments({ userId });
 
    const totalPages = Math.ceil(count / limit);
 
    if (!withdrawals || withdrawals.length === 0) {
      return res
        .status(404)
        .json({ message: "No withdrawal requests found for this user" });
    }
 
    return res.status(200).json({
      message: "Withdrawal status fetched successfully",
      page,
      totalPages,
      limit,
      transferredAmount,
      AmountToTransfer,
      count: count,
      withdrawals,
    });
  } catch (error) {
    console.error("❌ Error fetching withdrawal status:", error);
    res
      .status(500)
      .json({ message: "Unable to fetch withdrawal status", error });
  }
};
 

//userClaimreward
// const UserClaimReward = async (req, res) => {
//   try {
//     const userId = req.params._id;
//     console.log(`Fetching user with ID: ${userId}`);
//     console.log(`Fetching user with ID`, req.params._id);

//     // Fetch reward settings
//     const rewardSetting = await RewardSetting.findOne({ status: "active" });
//     if (!rewardSetting) {
//       return res
//         .status(400)
//         .json({ message: "Reward system is not configured by the admin." });
//     }

//     // Ensure reward points are valid
//     const rewardPoints = rewardSetting.points;
//     if (!rewardPoints || isNaN(rewardPoints)) {
//       console.error("Error: rewardPoints is undefined or NaN.");
//       return res.status(500).json({
//         message: "Reward system misconfigured: Invalid reward points.",
//       });
//     }

//     // Fetch the correct user from the database
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     // Ensure `ticketBalance` has a valid default value
//     if (typeof user.ticketBalance !== "number" || isNaN(user.ticketBalance)) {
//       user.ticketBalance = 0; // Reset to 0 if invalid
//     }

//     const now = Date.now();
//     const twentyFourHours = 24 * 60 * 60 * 1000; // 86400000 ms

//     // Ensure `DailyReward` is checked correctly
//     const lastRewardTime = user.DailyReward
//       ? new Date(user.DailyReward).getTime()
//       : 0;
//     const timePassed = now - lastRewardTime;

//     // Check if 24 hours have passed
//     if (!user.DailyReward || timePassed >= twentyFourHours) {
//       console.log("User is eligible for a reward. Granting now...");

//       // Store initial and final balances
//       const initialBalance = user.ticketBalance;

//       user.ticketBalance += rewardPoints; // Guaranteed to be a valid number
//       user.DailyReward = now; // Update timestamp only for this user

//       await user.save();
//       console.log("Reward successfully saved!");

//       const finalBalance = user.ticketBalance;

//       // Save claim history
//       const newClaim = new ClaimHistory({
//         userId: user._id,
//         userName: user.userName, // Ensure userName is passed correctly
//         rewardPoints: rewardPoints,
//         claimedAt: new Date(),
//         initialBalance: initialBalance, // Store initial balance
//         finalBalance: finalBalance, // Store final balance
//         status: "claimed", // Set status to claimed
//       });

//       await newClaim.save();
//       console.log("Claim history successfully saved!");

//       return res.status(200).json({
//         message: `Your Daily Reward claimed successfully...`,
//         data: {
//           userId: user._id,
//           userName: user.userName,
//           status: "claimed", // Status of the claim
//           rewardPoints: rewardPoints,
//           initialBalance: initialBalance, // Return initial balance
//           finalBalance: finalBalance, // Return final balance
//           claimedAt: newClaim.claimedAt,
//           id: newClaim._id,
//         },
//       });
//     }

//     // Calculate time remaining
//     const timeRemaining = twentyFourHours - timePassed;
//     console.log(
//       `User needs to wait. Time remaining: ${Math.ceil(
//         timeRemaining / (60 * 1000)
//       )} minutes.`
//     );

//     return res.status(400).json({
//       // message: `⏳ You can claim your reward in ${Math.ceil(
//       //   timeRemaining / (60 * 1000)
//       // )} minutes.`,
//       message:`Already claimed today`
//     });
//   } catch (error) {
//     console.error("Error in claiming reward:", error);
//     return res
//       .status(500)
//       .json({ message: "Internal server error. Please try again later." });
//   }
// };

const UserClaimReward = async (req, res) => {
  try {
    const userId = req.params._id;

    // Fetch reward settings
    const rewardSetting = await RewardSetting.findOne({ status: "ACTIVE" });
    if (!rewardSetting) {
      return res
        .status(400)
        .json({ message: "Reward system is not configured by the admin." });
    }

    // Ensure reward points are valid
    const rewardPoints = rewardSetting.points;
    if (!rewardPoints || isNaN(rewardPoints)) {
      console.error("Error: rewardPoints is undefined or NaN.");
      return res.status(500).json({
        message: "Reward system misconfigured: Invalid reward points.",
      });
    }

    // Fetch the correct user from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure `ticketBalance` has a valid default value
    if (typeof user.ticketBalance !== "number" || isNaN(user.ticketBalance)) {
      user.ticketBalance = 0; // Reset to 0 if invalid
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Set time to midnight to compare only dates

    // Ensure `dailyReward` is checked correctly
    const lastRewardDate = user.DailyReward ? new Date(user.DailyReward) : null;
    const lastRewardDay = lastRewardDate
      ? new Date(
          lastRewardDate.getFullYear(),
          lastRewardDate.getMonth(),
          lastRewardDate.getDate()
        )
      : null;

    // Check if the user has already claimed today
    if (lastRewardDay && today.getTime() === lastRewardDay.getTime()) {
      return res.status(400).json({
        message: `⏳ You have already claimed your reward for today.`,
      });
    }

    // Store initial and final balances
    const initialBalance = user.ticketBalance;

    user.ticketBalance += rewardPoints; // Guaranteed to be a valid number
    user.DailyReward = now; // Update timestamp only for this user

    await user.save();
    // console.log("Reward successfully saved!");

    const finalBalance = user.ticketBalance;

    // Save claim history
    const newClaim = new ClaimHistory({
      userId: user._id,
      userName: user.userName, // Ensure userName is passed correctly
      rewardPoints: rewardPoints,
      claimedAt: new Date(),
      initialBalance: initialBalance, // Store initial balance
      finalBalance: finalBalance, // Store final balance
      status: "CLAIMED", // Set status to claimed
    });

    await newClaim.save();
    // console.log("Claim history successfully saved!");

    return res.status(200).json({
      message: `Your Daily Reward claimed successfully...`,
      data: {
        userId: user._id,
        userName: user.userName,
        status: "CLAIMED", // Status of the claim
        rewardPoints: rewardPoints,
        initialBalance: initialBalance, // Return initial balance
        finalBalance: finalBalance, // Return final balance
        claimedAt: newClaim.claimedAt,
        id: newClaim._id,
      },
    });
  } catch (error) {
    console.error("Error in claiming reward:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

const getclaimhistory = async (req, res) => {
  try {
    const userId = req.params.id; // Extract userId correctly

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid userId" });
    }

    // Fetch claim history for the specified user with pagination
    const claims = await ClaimHistory.find({ userId }); // Ensures we only fetch this user's data

    const totalclaimBonus = await ClaimHistory.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } }, // ✅ Ensure ObjectId format
      { $group: { _id: null, totalBonus: { $sum: "$rewardPoints" } } },
    ]);

    const claimBonus =
      totalclaimBonus.length > 0 ? totalclaimBonus[0].totalBonus : 0;

    res.status(200).json({
      success: true,
      // total,
      claims,
      totalclaimBonus: claimBonus, // Corrected total claim bonus calculation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const GetDailyReward = async (req, res) => {
  const userId = req.params.id;
  try {
    // Fetch the reward setting
    const rewardSetting = await RewardSetting.findOne({ status: "ACTIVE" });

    if (!rewardSetting) {
      return res.status(404).json({ message: "No reward settings found" });
    }

    return res.status(200).json({
      message: "Reward settings fetched successfully",
      data: rewardSetting,
    });
  } catch (error) {
    console.error(" Error fetching reward settings:", error);
    res.status(500).json({ message: "Unable to fetch reward settings", error });
  }
};

// const getreferralHistory = async (req, res) => {
//   try {
//     const { _id: userId } = req.params; // same naming style as your route
//     const filter = userId ? { referringUser: userId } : {};

//     // 🚀 1-liner: pull the refs, join the User collection, keep it lean
//     const referrals = await Referral.find(filter)
//       .sort({ createdAt: -1 })
//       .populate({
//         path: "referredUser",
//         select: "userName firstName lastName email chatId",
//       })
//       .populate({
//         path: "referringUser",
//         select: "userName firstName lastName email chatId",
//       })
//       .lean(); // --> converts to plain JS objects, faster mapping

//     // Shape the payload for the front-end
//     const cleaned = referrals.map((r) => ({
//       _id: r._id,
//       referredUser: r.referredUser?._id,
//       userId: r.referringUser?._id,

//       // 🌟 userName priority: userName > full name > email > chatId
//       referreduserName:
//         r.referredUser?.userName ||
//         `${r.referredUser?.firstName || ""} ${
//           r.referredUser?.lastName || ""
//         }`.trim() ||
//         r.referredUser?.chatId ||
//         "Unknown",

//       referringuserName:
//         r.referringUser?.userName ||
//         `${r.referringUser?.firstName || ""} ${
//           r.referringUser?.lastName || ""
//         }`.trim() ||
//         r.referringUser?.chatId ||
//         "Unknown",

//       referralamount: r.referralamount,
//       initialBalance: r.initialBalance ?? 0,
//       finalBalance: r.finalBalance ?? 0,
//       initiated: r.initiated,
//       createdAt: r.createdAt,
//       updatedAt: r.updatedAt,
//     }));

//     res.json({ success: true, count: cleaned.length, data: cleaned });
//   } catch (err) {
//     console.error("Error fetching referrals:", err);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

const getreferralHistory = async (req, res) => {
  try {
    const { _id: userId } = req.params; // same naming style as your route
    const filter = userId ? { referringUser: userId } : {};

    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to 10 per page if not provided
    const skip = (page - 1) * limit;

    // 🚀 1-liner: pull the refs, join the User collection, keep it lean
    const referrals = await Referral.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip) // Apply pagination: skip records for the current page
      .limit(limit) // Limit the number of records per page
      .populate({
        path: "referredUser",
        select: "userName chatId",
      })
      .populate({
        path: "referringUser",
        select: "userName chatId",
      })
      .lean(); // --> converts to plain JS objects, faster mapping

      const referralStats=await Referral.find({referringUser: userId })
      // console.log(referralStats,"referralstats");
      


    const totalReferralsCount = await Referral.countDocuments({ referringUser: userId });
    // console.log(totalReferralsCount,"totalReferralsCount");
    
    const totalPages = Math.ceil(totalReferralsCount / limit);
    const referralAmount=referralStats.reduce((sum, r) => sum + (r.referralAmount || 0), 0);
     const conversion = await TicketConvertion.findOne({ status: "ACTIVE" });
    if (!conversion) {
      return res
        .status(500)
        .json({ message: "Ticket conversion rate not found" });
    }

    const totalreferralMoneyInUsdt =
      (referralAmount * conversion.amountInToken) / conversion.ticketQuantity;



      
      

    // Shape the payload for the front-end
    const cleaned = referrals.map((r) => ({
      _id: r._id,
      referredUser: r.referredUser?._id,
      referringUser: r.referringUser?._id,
      // referringUserName:
      //   r.referringUser?.userName ||
      //   "Unknown",

        referredUserName:
        r.referredUser?.userName ||
        `${r.referredUser?.firstName || ""} ${
          r.referredUser?.lastName || ""
        }`.trim() ||
        r.referredUser?.chatId ||
        "Unknown",

      referringUserName:
        r.referringUser?.userName ||
        `${r.referringUser?.firstName || ""} ${
          r.referringUser?.lastName || ""
        }`.trim() ||
        r.referringUser?.chatId ||
        "Unknown",

      referralAmount: r.referralAmount,
      initialBalance: r.initialBalance ?? 0,
      finalBalance: r.finalBalance ?? 0,
      initiated: r.initiated,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    // console.log(cleaned,"cleaned");

    res.json({
      success: true,
      message: "Single User refferals fetched succesfully..",
      count: cleaned.length,
      // totalReferralsCount:cleaned.length,
      totalReferralsCount,
      totalreferralMoney: referralAmount, 
      totalreferralMoneyInUsdt: totalreferralMoneyInUsdt.toFixed(4),
      totalPages,
      page,
      limit,
      data: cleaned,
      // referrals,
    });
  } catch (err) {
    console.error("Error fetching referrals:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//userSignupbulk(faker-M)
const usersignup = async (req, res) => {
  try {
    const { userName, email, password, loginType, bulkInsert } = req.body;

    // Bulk insert users if requested
    if (bulkInsert) {
      // console.log("🚀 Bulk inserting 100000 users...");

      const hashedPassword = await bcryptjs.hash("Users@123", 10); // Pre-hash password once
      const users = Array.from({ length: 100000 }).map(() => ({
        userName: faker.person.firstName(),
        email: faker.internet.email(),
        password: hashedPassword,
        loginType: "user",
      }));

      // 🔥 SUPER FAST INSERT: insertMany with { ordered: false }
      await User.create(users);

      // console.log("✅ Successfully inserted 100000 users");
      return res
        .status(201)
        .json({ message: "100000 users inserted successfully" });
    }

    // Normal single user signup
    if (!userName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hashedPasswordSingle = await bcryptjs.hash(password, 10);
    const newUser = new User({
      userName,
      email,
      password: hashedPasswordSingle,
      loginType: loginType || "user",
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "Registered successfully",
      user: {
        id: savedUser._id,
        userName: savedUser.userName,
        email: savedUser.email,
        loginType: savedUser.loginType,
      },
    });
  } catch (error) {
    console.error("❌ Failed to create new user:", error);
    res.status(500).json({ message: "Unable to create new user" });
  }
};

const getuserads = async (req, res) => {
  const userId = req.params._id; // Extract adId from URL params
  try {

    // If AdId is not provided, return all ads
    const ads = await AdsData.find({ status: "ACTIVE" });

    return res.status(200).json({
      success: true,
      total_no_of_ads: ads.length,
      message: "All ads fetched successfully",
      data: ads,
    });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to fetch ads" });
  }
};

const UserGetReferralReward = async (req, res) => {
  const userId = req.params._id; // Extract userId from URL params
  try {
    // Get all referral rewards
    const referralSettings = await ReferralSetting.findOne({status : "ACTIVE"});

    return res.status(200).json({
      message: "All referralSettings fetched succesfully",
      count: referralSettings.length,
      referralSettings,
    });
  } catch (error) {
    console.error(" Error fetching referral rewards:", error);
    return res.status(500).json({
      message: "Failed to fetch referral rewards",
      error: error.message,
    });
  }
};

const GetUserClaimHistory = async (req, res) => {
  try {
    const userId = req.params._id; // or whatever param your route uses

    // Get all claims sorted latest first
    const claimHistories = await ClaimHistory.find({ userId }).sort({ claimedAt: -1 });

    // console.log("claimHistories", claimHistories);
    

    if (!claimHistories || claimHistories.length === 0) {
      return res.status(200).json({ claimedToday: true });
    }

    // Get the latest claim
    const latestClaim = claimHistories[0];
    const claimedDate = latestClaim.claimedAt.toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];

    // Boolean check if claimed today
    const claimedToday = claimedDate !== today;

    return res.status(200).json({ claimedToday });
  } catch (error) {
    console.error("Error fetching claim history:", error);
    return res.status(500).json({ message: "Unable to fetch claim history" });
  }
};

// const GetUserClaimHistory = async (req, res) => {
//   try {
//     const userId = req.params._id; // or whatever param your route uses
 
//     // Get all claims sorted latest first
//     const claimHistories = await ClaimHistory.find({ userId }).sort({ claimedAt: -1 });
 
//     if (!claimHistories || claimHistories.length === 0) {
//       return res.status(200).json({ claimedToday: true });
//     }
 
//     // Get the latest claim
//     const latestClaim = claimHistories[0];
//     const claimedDate = latestClaim.claimedAt.toISOString().split("T")[0];
//     const today = new Date().toISOString().split("T")[0];
 
//     // Boolean check if claimed today
//     const claimedToday = claimedDate !== today;
 
//     return res.status(200).json({ claimedToday });
//   } catch (error) {
//     console.error("Error fetching claim history:", error);
//     return res.status(500).json({ message: "Unable to fetch claim history" });
//   }
// };


const dashBoardUser = async (req, res) => {

  const userId = req.params._id; // Extract userId from URL params
  try {
    const usercount = await User.countDocuments({});
    const transactioncount = await Withdraw.countDocuments({});
    const gamescount = await GameHistory.countDocuments({});
    const withdrawals=await Withdraw.find()
    const totalTransferredAmount=await withdrawals
      .filter((w) => w.status === "TRANSFERRED") 
      .reduce((sum, w) => sum + (w.usdt_Amount || 0), 0);

    return res.status(200).json({
      message: "Data fetched Succesfully..",
      totalUsers: usercount,
      totalWithdrawals: transactioncount,
      totalGames: gamescount,
      totalTransferredAmount: totalTransferredAmount,
    });
  } catch (error) {
    console.error("Error in data fetching:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
 
 



 

module.exports = {
  getreferralHistory,
  login,
  getProfile,
  updateProfile,
  UserGetReferralReward,
  withdrawrequest,
  getWithdrawStatus,
  UserClaimReward,
  getclaimhistory,
  GetDailyReward,
  usersignup,
  getuserads,
  GetUserClaimHistory,
  dashBoardUser,
  getGameStats
};
