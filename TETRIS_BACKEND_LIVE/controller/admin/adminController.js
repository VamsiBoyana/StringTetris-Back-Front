const mongoose = require("mongoose");
const axios = require("axios");
const bcryptjs = require("bcryptjs");
const User = require("../../models/userSchema");
const jwt = require("jsonwebtoken");
const Withdraw = require("../../models/withdrawlSchema");
const RewardSetting = require("../../models/rewardSettingSchema");
// // const withdrawMethod=require("../../models/adminwithdrawmethodsc")
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const AdsData = require("../../models/AdsSchema");
const { findById } = require("../../models/gameHistorySchema");
const CompletedTask = require("../../models/completedTaskSchema");
const CompleteAdData = require("../../models/CompleteAdSchema");
const ClaimHistory = require("../../models/claimHistorySchema");
const GameHistory = require("../../models/gameHistorySchema");
const ReferralSetting = require("../../models/refferalSettingSchema");
const Referral = require("../../models/refererSchema");
const { Cell } = require("@ton/core");
const web3 = require("@solana/web3.js");

const { count } = require("console");

const Adminsignup = async (req, res) => {
  try {
    const { userName, email, password, loginType } = req.body;

    // Validate input fields
    if (!userName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

  

    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
      loginType: loginType || "Admin", 
    });

    // Save the new user
    const savedUser = await newUser.save();

    // Send response (excluding password)
    res.status(201).json({
      message: `${userName} your admin registration successfully`,
      user: {
        id: savedUser._id,
        userName: savedUser.userName,
        email: savedUser.email,
        loginType: savedUser.loginType,
      },
    });
  } catch (error) {
    console.error("Failed to create new Admin:", error);
    console.error(error.stack); // Log the full stack trace for more context

    // Provide more specific error messages based on error type
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Unable to create new admin" });
  }
};

const Adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase();

    // Find user & ensure password is retrieved
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    // Check if user has admin access
    if (user.loginType !== "Admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Not an Admin account." });
    }

    // Check if password field exists
    if (!user.password) {
      console.error("⚠️ Error: Password field is missing in the database.");
      return res
        .status(500)
        .json({ message: "Server error: Missing user password." });
    }

    // Compare entered password with hashed password
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { user: { id: user._id, role: user.loginType } }, // Include role in token
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    // Send success response (excluding password)
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        ticketBalance: user.ticketBalance,
        loginType: user.loginType, // Include login type
      },
      token,
    });
  } catch (error) {
    console.error("Failed to log in user:", error);
    return res
      .status(500)
      .json({ message: "Unable to log in", error: error.message });
  }
};

// const getAllUsers = async (req, res) => {
//   try {
//     // Fetch all users from the database
//     const userCount = await User.countDocuments();

//     // console.log("Total Users Count:", userCount);

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const users = await User.find()
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);
//     // console.log("Fetched Users:", users);
//     const totalPages = Math.ceil(userCount / limit);

//     // Check if no users were found
//     if (!users || users.length === 0) {
//       return res.status(404).json({ message: "No users found" });
//     }

//     // Return the list of users in the response
//     res.status(200).json({
//       message: "All users fetched successfully",
//       count: userCount,
//       totalPages: totalPages,
//       page: page,
//       limit: limit,
//       users: users,
//     });
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).json({ message: "Unable to fetch users" });
//   }
// };

const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
 
    // console.log("Total Users Count:", userCount);
 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userName = req.query.userName;  // Get the username query parameter
 
    const filter = userName ? { userName: { $regex: userName, $options: 'i' } } : {}; // Case-insensitive search
 
    const userCount = await User.countDocuments(filter);
   
 
 
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    console.log("Fetched Users:", users);
    const totalPages = Math.ceil(userCount / limit);
 
    // Check if no users were found
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
 
    // Return the list of users in the response
    res.status(200).json({
      message: "All users fetched successfully",
      count: userCount,
      totalPages: totalPages,
      page: page,
      limit: limit,
      users: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Unable to fetch users" });
  }
};
 
const EditProfile = async (req, res) => {
  try {
    const userId = req.params._id;
    const { userName, profilepic } = req.body;

    if (!userId) {
      return res.status(404).json({ message: "User ID is required" });
    }

    // Fetch the user from the database using the findById method
    const user = await User.findById(userId);

    // console.log("🔍 User Found:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user fields
    if (userName) user.userName = userName;
    if (profilepic) user.profilepic = profilepic;

    // Save the updated user
    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
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

const AdmingetProfile = async (req, res) => {
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
        profilepic: user.profilepic, // Include additional fields as needed
        referralLink: user.referralLink,
      },
    });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    res.status(500).json({ message: "Unable to fetch profile" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.loginType !== "Admin") {
      return res
        .status(400)
        .json({ message: "This request is for admin users only" });
    }

    const sendOtp = user.generateOTP();
    await user.save();
    // console.log(sendOtp);

    // Send reset link via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      text: `<p>Your OTP code for resetting your password is:<string>${sendOtp}</string></p> `, // Plain text version
      html: `<h2>Password Reset OTP</h2>
            <p>Your OTP code is: <strong>${sendOtp}</strong></p>
            <p>This code is valid for 10 minutes. Do not share it with anyone.</p>
             <p>If you did not request a password reset, please ignore this email.</p>`,
    });

    return res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return res
      .status(500)
      .json({ message: "Unable to process request", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { otp, newPassword, confirmPassword, email } = req.body;

    // Check if all fields are provided
    if (!otp || !newPassword || !confirmPassword || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // console.log(user, "user");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP is expired
    if (user.otpExpires && new Date() > user.otpExpires) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Hash and update password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    // console.log(req.body);

    // Check if all fields are provided
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare old password with stored password
    const isOldPasswordValid = await bcryptjs.compare(
      oldPassword,
      user.password
    );

    if (!isOldPasswordValid) {
      return res.status(401).json({ message: "Invalid old password" });
    }

    // Validate if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update password in database
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const withdrawLimits = async (req, res) => {
  const { userId } = req.params._id;
  try {
    const limits = {
      minWithdrawal: 10,
      maxWithdrawal: 500,
    };
    res.status(200).json(limits);
  } catch (error) {
    console.error("Error fetching withdrawal limits:", error);
    res.status(500).json({ message: "Failed to fetch withdrawal limits" });
  }
};

// const approvewithdraw = async (req, res) => {
//   const { requestId } = req.body;

//   try {
//     // Step 1: Fetch the withdrawal request and populate userId
//     const request = await Withdraw.findById(requestId).populate(
//       "userId",
//       "userName ticketBalance"
//     );

//     if (!request) {
//       return res.status(404).json({ message: "Withdrawal request not found" });
//     }

//     // Step 2: Ensure the request is still pending
//     if (request.status !== "pending") {
//       return res
//         .status(400)
//         .json({ message: "Withdrawal request is already processed" });
//     }

//           const mintresponse = await fetch('https://testnet.tonapi.io/v2/rates?tokens=ton&currencies=usdt', {
//             method: 'GET',
//             headers: {},
//           });

//           const data = await mintresponse.json();
//           var Token_Amount = (Withdraw.After_Charge / data.rates.TON.prices.USDT).toFixed(2);
//           var Fee_tokens = (Withdraw.charge / data.rates.TON.prices.USDT).toFixed(4)
//           // var TokenSymbol = 'TON'

//     // Step 3: Check if userId is populated
//       const user = request.userId;
//     console.log("request11", user);

//     if (!user) {
//       return res
//         .status(400)
//         .json({
//           message: "User associated with this withdrawal request not found",
//         });
//     }

//     // Step 4: Log current balance before deduction
//     console.log("Current user ticketBalance:", user.ticketBalance);

//     // Check user's balance and deduct the amount
//     if (user.ticketBalance < request.amount) {
//       return res
//         .status(400)
//         .json({ message: "Insufficient balance in user's account" });
//     }

//     // Step 5: Mark the withdrawal request as approved before deducting
//     // Mark the withdrawal request as approved first to prevent duplicate deduction
//     request.status = "approved";
//     request.tokenAmount = Token_Amount;
//     request.feeTokens = Fee_tokens;
//     await request.save();

//     // Step 6: Deduct the amount from the user's balance
//     // user.ticketBalance -= request.amount;

//     // Log balance after deduction to ensure correct calculation
//     console.log("User ticketBalance after deduction:", user.ticketBalance);

//     // Ensure to fetch the updated user document and save it correctly
//     await user.save();

//     // Re-fetch the updated user to ensure balance is properly saved
//     const updatedUser = await User.findById(user._id);

//     res.status(200).json({
//       message: "Withdrawal request approved successfully.",
//       updatedBalance: updatedUser.ticketBalance, // Use the re-fetched balance to ensure it is correct
//     });
//   } catch (error) {
//     console.error("Error approving withdrawal:", error.message);
//     res
//       .status(500)
//       .json({
//         message: "Failed to approve withdrawal request",
//         error: error.message,
//       });
//   }
// };

const approvewithdraw = async (req, res) => {
  const { requestId } = req.body;
 
  console.log("req.body",req.body);
 
  try {
    // Fetch withdrawal request
    const request = await Withdraw.findById(requestId);
    console.log("Withdrawal request:", request);
 
    if (!request) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }
 
    if (request.status !== "PENDING") {
      return res.status(400).json({ message: "Withdrawal request already processed" });
    }
 
    let Token_Amount, Fee_tokens;
 
    if (request.token === "TON") {
      // Fetch TON price
      const mintresponse = await fetch("https://testnet.tonapi.io/v2/rates?tokens=ton&currencies=usdt");
      const data = await mintresponse.json();
 
      if (!data.rates || !data.rates.TON || !data.rates.TON.prices || !data.rates.TON.prices.USDT) {
        return res.status(500).json({ message: "Failed to fetch TON price data" });
      }
 
      Token_Amount = (request.After_Charge / data.rates.TON.prices.USDT).toFixed(2);
      Fee_tokens = (request.charge / data.rates.TON.prices.USDT).toFixed(4);
      symbol = "TON";
    } else if (request.token === "SOL") {
      const mintresponse = await fetch("https://api.dexscreener.com/token-pairs/v1/solana/BjcRmwm8e25RgjkyaFE56fc7bxRgGPw96JUkXRJFEroT");
 
      if (!mintresponse.ok) {
        return res.status(500).json({ message: "Failed to fetch SOL price data" });
      }
 
      console.log("request",request);
     
 
      const data = await mintresponse.json();
      // console.log("mintresponse", data);
      // console.log(data[0].baseToken.symbol);
 
            const Token = data[0].baseToken.symbol;
 
 
      if (!data[0] || !data[0].priceUsd) {
        return res.status(500).json({ message: "SOL price data not found" });
      }
 
      const usdtPrice = data[0].priceUsd;
 
      console.log("usdtPrice", usdtPrice);
     
 
      Token_Amount = (request.after_Charge / usdtPrice).toFixed(2);
 
      console.log("request.After_Charge",request.after_Charge);
      console.log("request.charge",request.charge);
 
      Fee_tokens = (request.charge / usdtPrice).toFixed(4);
 
      console.log("Token_Amount", Token_Amount);
      console.log("Fee_tokens", Fee_tokens);
      symbol = Token;
    } else {
      return res.status(400).json({ message: "Unsupported token type" });
    }
 
    // Update withdrawal with status and token values
    const updatedWithdrawal = await Withdraw.findByIdAndUpdate(
      requestId,
      {
        status: "APPROVED",
        token_Amount: Token_Amount,
        fee_Tokens: Fee_tokens,
        symbol: symbol,
      },
      { new: true }
    );
 
    console.log("updatedWithdrawal", updatedWithdrawal);
   
 
    return res.status(200).json({
      message: "Withdrawal request approved successfully.",
      withdrawal: updatedWithdrawal,
    });
  } catch (error) {
    console.error("Error approving withdrawal:", error.message);
    return res.status(500).json({
      message: "Failed to approve withdrawal request",
      error: error.message,
    });
  }
};

// const transferwithdraw = async (req, res) => {
//   try {
//     const { hash, _id } = req.body;

//     if (!hash || !Array.isArray(_id) || _id.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Missing or invalid hash or userId array" });
//     }

//     // Extract just the _id values from the userId array
//     const ids = _id.map((item) => item._id);

//     // const cell = Cell.fromBoc(Buffer.from(hash, "base64"))[0];
//     // const hashh = cell.hash().toString("hex");

//     // Update all Withdraw docs with _id in ids array
//     const result = await Withdraw.updateMany(
//       { _id: { $in: ids } },
//       { $set: { hash: hashh, status: "TRANSFERRED" } }
//     );

//     return res.status(200).json({
//       message: `${result.modifiedCount} withdrawal requests transferred successfully.`,
//       result,
//     });
//   } catch (error) {
//     console.error("Error batch transfer withdrawal:", error.message);
//     return res.status(500).json({
//       message: "Failed to transfer withdrawal requests",
//       error: error.message,
//     });
//   }
// };


const transferwithdraw = async (req, res) => {
  try {
    console.log("req.body",req.body);
 
    const { hash, _id } = req.body;
 
    // if (!hash || !Array.isArray(_id) || _id.length === 0) {
    //   return res
    //     .status(400)
    //     .json({ message: "Missing or invalid hash or userId array" });
    // }
 
    // Extract just the _id values from the userId array
    // const ids = _id.map((item) => item._id);
    const ids = _id;
 
 
if (hash) {
      const options = {
        method: "get",
        url: `https://pro-api.solscan.io/v2.0/transaction/actions?tx=${hash}`, // Corrected string interpolation
        headers: {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3MzE0MDQzNDI4NTEsImVtYWlsIjoiaW5mb0BzdHJpbmdtZXRhdmVyc2UuY29tIiwiYWN0aW9uIjoidG9rZW4tYXBpIiwiYXBpVmVyc2lvbiI6InYyIiwiaWF0IjoxNzMxNDA0MzQyfQ.SMLho5s-_pTBHYlZj2qV3OEq9Qwy8mh859xApQRcoBs"
        }
      };
      const responsedata = await axios(options);
      console.log("✅ Extracted Transaction Hash:", responsedata);
    }
 
    // const cell = Cell.fromBoc(Buffer.from(hash, "base64"))[0];
    // const hashh = cell.hash().toString("hex");
 
    // Update all Withdraw docs with _id in ids array
    const result = await Withdraw.updateMany(
      { _id: { $in: ids } },
      { $set: { hash: hash, status: "TRANSFERRED" } }
    );
 
    return res.status(200).json({
      message: `${result.modifiedCount} withdrawal requests transferred successfully.`,
      result,
    });
  } catch (error) {
    console.error("Error batch transfer withdrawal:", error.message);
    return res.status(500).json({
      message: "Failed to transfer withdrawal requests",
      error: error.message,
    });
  }
};
 


const rejectwithdraw = async (req, res) => {
  const { requestId, reason } = req.body;

  try {
    if (!requestId || !reason) {
      return res.status(400).json({ message: "Missing requestId or reason" });
    }
    // Fetch the withdrawal request
    const request = await Withdraw.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    // Check if the request is still pending
    if (request.status == "APPROVED") {
      return res
        .status(400)
        .json({ message: "Withdrawal request is already processed" });
    }

    const user = await User.findById(request.userId);

    user.ticketBalance += request.amount;
    await user.save();

    // Mark the request as rejected
    request.status = "REJECTED";
    request.rejectionReason = reason || "No reason provided";
    await request.save();

    res.status(200).json({
      message: "Withdrawal request rejected successfully.",
      reason,
      request,
    });
  } catch (error) {
    console.error("Error rejecting withdrawal:", error);
    res.status(500).json({ message: "Failed to reject withdrawal request" });
  }
};

const AdminSetReward = async (req, res) => {
  try {
    const rewardPoints = Number(req.body.rewardPoints); // Reward points from admin

    if (isNaN(rewardPoints) || rewardPoints <= 0) {
      return res.status(400).json({ message: "Invalid reward points" });
    }

    // Mark all existing rewards as inactive
    await RewardSetting.updateMany({}, { $set: { status: "INACTIVE" } });

    // Create a new active reward setting
    const newRewardSetting = new RewardSetting({
      points: rewardPoints,
      status: "ACTIVE",
    });
    await newRewardSetting.save();

    return res.status(201).json({
      message: "Daily Reward points updated successfully!",
      newRewardSetting,
    });
  } catch (error) {
    console.error("❌ Error in setting/rewarding points:", error);
    //console.error(error.stack);
    res.status(500).json({
      message: "Unable to set/edit reward points",
      error: error.message,
    });
  }
};

const GetAllDailyReward = async (req, res) => {
  try {
    // Fetch the reward setting
    const rewardSetting = await RewardSetting.find();

    if (!rewardSetting) {
      return res.status(404).json({ message: "No reward settings found" });
    }

    return res.status(200).json({
      message:
        "All Reward settings (Overall Daily rewards) fetched successfully",
      count: rewardSetting.length,
      data: rewardSetting,
      rewardPoints: rewardSetting.points,
    });
  } catch (error) {
    console.error(" Error fetching reward settings:", error);
    res.status(500).json({ message: "Unable to fetch reward settings", error });
  }
};

// const getAllWithdrawStatus = async (req, res) => {
//   try {
//     // Fetch withdrawal requests for the user
//     const withdrawals = await Withdraw.find();

//     if (!withdrawals || withdrawals.length === 0) {
//       return res.status(404).json({
//       message: "withdrawals Not found",
//       count: withdrawals.length,
//       withdrawals,
//     })
//   }

//     return res.status(200).json({
//       message: "All Withdrawal status fetched successfully",
//       count: withdrawals.length,
//       withdrawals,
//     });
//   } catch (error) {
//     console.error("Error fetching withdrawal status:", error);
//     res
//       .status(500)
//       .json({ message: "Unable to fetch withdrawal status", error });
//   }
// };

//Add sinle Ad

// const getAllWithdrawStatus = async (req, res) => {
  
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     // Use the status provided in the query parameter
//     const statusFilter = req.query.status || ""; // Default to an empty string to fetch all if no status is provided

//     // If no status is provided, fetch all withdrawals
//     const count = await Withdraw.countDocuments(
//       statusFilter ? { status: statusFilter } : {} // Only filter by status if provided
//     );

//     const totalPages = Math.ceil(count / limit);

//     // Fetch withdrawals matching the status filter (or all if status is empty)
//     const withdrawals = await Withdraw.find(
//       statusFilter ? { status: statusFilter } : {} // Apply the filter for status
//     )
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     if (!withdrawals || withdrawals.length === 0) {
//       return res.status(404).json({
//         message: "No withdrawals found",
//       });
//     }

//     return res.status(200).json({
//       message: "All withdrawals fetched successfully",
//       count: count,
//       totalPages: totalPages,
//       limit: limit,
//       page: page,
//       withdrawals,
//     });
//   } catch (error) {
//     console.error("Error fetching withdrawal status:", error);
//     res
//       .status(500)
//       .json({ message: "Unable to fetch withdrawal status", error });
//   }
// }; //without WB

const getAllWithdrawStatus = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
 
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
 
    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({ success: false, message: "Invalid page number" });
    }
    if (isNaN(limitNumber) || limitNumber < 1) {
      return res.status(400).json({ success: false, message: "Invalid limit" });
    }
 
    const filterConditions = {};
 
    for (let key in filters) {
      if (filters[key]) {
        let value = filters[key];
 
        // Check if value has quotes
        if (/^["'].*["']$/.test(value)) {
          // Remove only if value starts and ends with quotes
          value = value.replace(/^["']+|["']+$/g, "").trim();
          console.log(`🧹 Cleaned value for ${key}:`, value);
        } else {
          console.log(`✅ No quotes for ${key}, using as is:`, value);
        }
 
        // Use case-insensitive regex for flexible matching
        filterConditions[key] = { $regex: value, $options: "i" };
      }
    }
 
    console.log("Final filterConditions:", filterConditions);
 
    const count = await Withdraw.countDocuments(filterConditions);
    const totalPages = Math.max(1, Math.ceil(count / limitNumber));
 
    const withdrawals = await Withdraw.find(filterConditions)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();
 
    if (!withdrawals.length) {
      return res.status(404).json({ message: "No withdrawals found" });
    }
 
    return res.status(200).json({
      message: "All withdrawals fetched successfully",
      count,
      totalPages,
      limit: limitNumber,
      page: pageNumber,
      withdrawals,
    });
  } catch (error) {
    console.error("Error fetching withdrawal status:", error);
    res.status(500).json({ message: "Unable to fetch withdrawal status", error });
  }
};
 
 






const addAd = async (req, res) => {
  try {
    const {
      adName,
      adSDK,
      adImage,
      rewardPoints,
      adCount,
      adTimer_InMinutes,
      addedBy,
      status,
      adId,
    } = req.body;

    // Ensure AddedBy is provided
    if (!addedBy) {
      return res
        .status(400)
        .json({ success: false, message: "AddedBy (Admin ID) is required" });
    }

    // Find the user by AddedBy ID
    const user = await User.findById(addedBy);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the user is an admin
    if (user.loginType !== "Admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only admins can add or update ads" });
    }

    // If AdId is provided, attempt to update the ad
    if (adId) {
      // Find the ad by AdId and update it
      const updatedAd = await AdsData.findByIdAndUpdate(
        adId,
        {
          adName,
          adSDK,
          adImage,
          rewardPoints,
          adCount,
          adTimer_InMinutes,
          addedBy,
          status,
        },
        { new: true } // This returns the updated document
      );

      if (!updatedAd) {
        return res
          .status(404)
          .json({ success: false, message: "AD not found to update" });
      }

      return res.status(200).json({
        success: true,
        message: "AD updated successfully.",
        data: updatedAd,
      });
    }

    // Validate required fields for the ad
    if (
      !adName ||
      !adSDK ||
      !adImage ||
      !rewardPoints ||
      !adCount ||
      !adTimer_InMinutes ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // If AdId is not provided, create a new ad
    const newAd = new AdsData({
      adName,
      adSDK,
      adImage,
      rewardPoints,
      adCount,
      adTimer_InMinutes,
      addedBy,
      status,
    });

    // Save the new ad to the database
    const savedAd = await newAd.save();

    return res.status(201).json({
      success: true,
      message: "Ad added successfully.",
      data: savedAd,
    });
  } catch (error) {
    console.error("Error in adding or updating ad:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to add or update ad" });
  }
};

//getAllAds
const getAds = async (req, res) => {
  try {
    const { AdId } = req.params; // Extract AdId from params

    if (AdId) {
      // If AdId is provided, find the single ad
      const ad = await AdsData.findById(AdId);

      if (!ad) {
        return res
          .status(404)
          .json({ success: false, message: "AD not found" });
      }

      return res.status(200).json({
        success: true,
        message: "AD found successfully",
        data: ad,
      });
    }

    // If AdId is not provided, return all ads
    const ads = await AdsData.find();

    return res.status(200).json({
      success: true,
      total_no_of_ads: ads.length,
      message: "All ADs fetched successfully",
      data: ads,
    });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to fetch ads" });
  }
};

const AdminLogout = async (req, res) => {
  try {
    // Instruct frontend to remove the token (since it's stored on the client side)
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("❌ Logout failed:", error);
    return res
      .status(500)
      .json({ message: "Unable to log out", error: error.message });
  }
};

const getCompletedTasksByUser = async (req, res) => {
  try {
    const userId = req.params._id; // Get userId from request params

    // const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    // const limit = parseInt(req.query.limit) || 10; // Default to 10 tasks per page if not provided
    // const skip = (page - 1) * limit; // Number of documents to skip

    if (userId) {
      // Fetch count of tasks for a specific user
      const count = await CompletedTask.countDocuments({ userId });
      // const totalPages = Math.ceil(count / limit); // Calculate total pages

      // Fetch the tasks based on the pagination
      const completedTasks = await CompletedTask.find({ userId });
      // .skip(skip)   // Skip the previous records based on page
      // .limit(limit); // Limit the number of tasks fetched

      // console.log("Completed tasks for this user:", completedTasks);
      // console.log(
      //   "Count of completed tasks for this user:",
      //   completedTasks.length
      // );

      // If no tasks found for the user, return a 404
      if (!completedTasks || completedTasks.length === 0) {
        return res
          .status(404)
          .json({ message: "No completed tasks found for this user" });
      }

      // Return tasks along with the count of completed tasks and pagination info
      return res.status(200).json({
        message: "Completed tasks for this user retrieved successfully",
        // totalPages,
        // page,
        // limit,
        count,
        completedTasks,
        // taskCount: count,
      });
    } else {
      // If no userId is provided in the params, fetch tasks for all users
      const count = await CompletedTask.countDocuments({});
      // const totalPages = Math.ceil(count / limit);
      const completedTasks = await CompletedTask.find();
      // .skip(skip)
      // .limit(limit); // Apply pagination here too

      // If no tasks found for all users, return a 404
      if (!completedTasks || completedTasks.length === 0) {
        return res.status(404).json({ message: "No completed tasks found" });
      }

      // Return all completed tasks with pagination info
      return res.status(200).json({
        message: "All completed tasks retrieved successfully",
        // page,
        // limit,
        count,
        // taskCount: count,
        // totalPages,
        completedTasks,
      });
    }
  } catch (error) {
    console.error("Error fetching completed tasks:", error);
    res.status(500).json({
      message: "Failed to retrieve completed tasks",
      error: error.message,
    });
  }
};

const getCompletedAdsByUser = async (req, res) => {
  try {
    const userId = req.params._id; // Get userId from params
    // console.log("UserId from params:", userId); // Debug log to verify if userId is passed correctly

    if (userId) {
      // If userId is provided, fetch completed ads for that specific user
      const completedAds = await CompleteAdData.find({ userId });

      // console.log("Completed ADs for this user:", completedAds); // Debug log to check the result

      if (!completedAds || completedAds.length === 0) {
        return res
          .status(404)
          .json({ message: "No completed ADs found for this user" });
      }
      return res.status(200).json({
        message: `Completed ADs for userId - ${userId}`,
        taskCount: completedAds.length,
        completedAds,
      });
    } else {
      // If userId is not provided, fetch completed ads for all users
      const completedAds = await CompleteAdData.find();

      if (!completedAds || completedAds.length === 0) {
        return res.status(404).json({ message: "No completed ADs found" });
      }

      return res.status(200).json({
        message: "All completed ADs retrieved successfully",
        tasksCount: completedAds.length,
        completedAds,
      });
    }
  } catch (error) {
    console.error("Error fetching completed ads:", error);
    return res.status(500).json({
      message: "Unable to retrieve completed ads",
      error: error.message,
    });
  }
};

const getAllClaimHistory = async (req, res) => {
  try {
    // Fetch all claim history data from the ClaimHistory collection
    const claims = await ClaimHistory.find()
      .sort({ claimedAt: -1 }) // Sort by claimedAt to show newest claims first
      .exec();

    if (!claims || claims.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No claim history found for any users",
      });
    }

    // Calculate total claim bonus (sum of all rewardPoints) for all users
    const totalClaimBonus = await ClaimHistory.aggregate([
      { $group: { _id: null, totalBonus: { $sum: "$rewardPoints" } } },
    ]);

    const claimBonus =
      totalClaimBonus.length > 0 ? totalClaimBonus[0].totalBonus : 0;

    res.status(200).json({
      success: true,
      total_Cliams: claims.length,
      claims,
      totalClaimBonus: claimBonus, // Sum of all rewardPoints for all users
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

const Usernotification = async (req, res) => {
  const { Notification } = req.body;

  if (!Notification) {
    return res.status(404).json({
      status: "Failed",
      message: "Notification not found.",
    });
  }

  let successCount = 0;
  let failCount = 0;
  const botKey = process.env.TELEGRAM_BOT_TOKEN;
  // console.log(botKey, "botkey");

  // Function to send the notification to all users
  const sendNotificationToAllUsers = async () => {
    try {
      // Fetch all users
      const users = await User.find({}).select({ chatId: 1 }); // Get all users' chatIds

      for (let i = 0; i < users.length; i++) {
        const chatId = users[i].chatId;
        const sendMessageUrl = `https://api.telegram.org/bot${botKey}/sendMessage`;

        // console.log(chatId, "chatId");

        try {
          const response = await axios.get(sendMessageUrl, {
            params: {
              chat_id: chatId,
              text: Notification,
            },
          });

          if (response.data.ok) {
            // console.log(`Notification sent to user ${chatId}`);
            successCount++;
          } else {
            console.error(
              `Failed to send notification to user ${chatId}`,
              response.data
            );
            failCount++;
          }
        } catch (error) {
          failCount++;
          console.error(
            `Error sending notification to user ${chatId}`,
            error.message
          );
        }
      }

      return res.status(200).json({
        status: "Success",
        message: ` Notifications sent. Success: ${successCount}, Failed: ${failCount}`,
      });
    } catch (error) {
      return res.status(500).json({
        status: "Failed",
        message: "Internal server error while sending notifications.",
      });
    }
  };
  // Call the function to send notifications to all users
  sendNotificationToAllUsers();
};

const AdminSetReferralReward = async (req, res) => {
  try {
    const { id } = req.params;
    const { referralAmount, signupBonus, referral_Note, botName } = req.body;
    // const referralAmount = Number(req.body.referralAmount);

    if (isNaN(referralAmount) || referralAmount <= 0) {
      return res.status(400).json({ message: "Invalid referral amount" });
    }

    if (id) {
      // Update existing referral reward by id
      const updatedReferralSetting = await ReferralSetting.findByIdAndUpdate(
        id,
        {
          referralAmount,
          signupBonus,
          referral_Note,
          botName,
          updatedAt: new Date(),
          status: "ACTIVE",
        },
        { new: true }
      );

      if (!updatedReferralSetting) {
        return res
          .status(404)
          .json({ message: "Referral reward setting not found" });
      }

      // Deactivate all other referral rewards except this one
      // await ReferralSetting.updateMany(
      //   { _id: { $ne: id } },
      //   { $set: { status: "INACTIVE" } }
      // );

      return res.status(200).json({
        message: "Referral reward updated successfully!",
        referralSetting: updatedReferralSetting,
      });
    } else {
      // Create new referral reward
      await ReferralSetting.updateMany({}, { $set: { status: "INACTIVE" } });

      const newReferralSetting = new ReferralSetting({
        referralAmount,
        signupBonus,
        referral_Note,
        botName,
        status: "ACTIVE",
        updatedAt: new Date(),
      });

      await newReferralSetting.save();

      return res.status(201).json({
        message: "Referral reward created successfully!",
        referralSetting: newReferralSetting,
      });
    }
  } catch (error) {
    console.error("Error in upserting referral reward:", error);
    return res.status(500).json({
      message: "Failed to upsert referral reward",
      error: error.message,
    });
  }
};

const AdminGetReferralReward = async (req, res) => {
  try {
    const id = req.params.id;

    if (id) {
      const referralSetting = await ReferralSetting.findById(id);
      if (!referralSetting) {
        return res.status(404).json({ message: "Referral reward not found" });
      }

      return res.status(200).json({
        message: "Specific referralSetting fetched succesfully",
        referralSetting,
      });
    } else {
      // Get all referral rewards
      const referralSettings = await ReferralSetting.find();
      // const referralSettings = await ReferralSetting.findOne({status : "ACTIVE"});

      return res.status(200).json({
        message: "All referralSettings fetched succesfully",
        count: referralSettings.length,
        referralSettings,
      });
    }
  } catch (error) {
    console.error("❌ Error fetching referral rewards:", error);
    return res.status(500).json({
      message: "Failed to fetch referral rewards",
      error: error.message,
    });
  }
};

const searchRecords = async (req, res) => {
  try {
    const {
      type,
      page = 1,
      limit = 10,
      fromDate,
      toDate,
      userId, // Use userId instead of username
    } = req.query;
    const skip = (page - 1) * limit;

    // Initialize the date filter
    let dateFilter = {};
    if (fromDate || toDate) {
      const from = new Date(`${fromDate}T00:00:00.000Z`);
      const to = new Date(`${toDate}T23:59:59.999Z`);

      // Check if the dates are valid
      if (isNaN(from) || isNaN(to)) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      dateFilter.createdAt = {};
      if (fromDate) dateFilter.createdAt.$gte = from;
      if (toDate) dateFilter.createdAt.$lte = to;
    }

    // Apply userId filter if provided
    let userFilter = {};
    if (userId) {
      userFilter.userId = userId; // Filter by userId
    }

    // Switch based on the selected type (ads, gamehistory, tasks, etc.)
    switch (type) {
      case "gamehistory": {
        const gameHistoryCount = await GameHistory.countDocuments({
          ...dateFilter,
          ...userFilter,
        });
        const gameHistoryTotalPages = Math.ceil(gameHistoryCount / limit);
        const gameHistoryRecords = await GameHistory.find({
          ...dateFilter,
          ...userFilter,
        })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 });

        if (!gameHistoryRecords.length) {
          return res
            .status(200)
            .json({ message: "No game history found", history: [] });
        }

        return res.status(200).json({
          message: "Game history retrieved successfully",
          totalPages: gameHistoryTotalPages,
          page,
          limit,
          length: gameHistoryCount,
          history: gameHistoryRecords,
        });
      }

      case "ads": {
        const adsCount = await CompleteAdData.countDocuments({
          ...dateFilter,
          ...userFilter,
        });
        const adsTotalPages = Math.ceil(adsCount / limit);
        const adsRecords = await CompleteAdData.find({
          ...dateFilter,
          ...userFilter,
        })
          .skip(skip)
          .limit(limit)
          .sort({ completionTime: -1 });

        if (!adsRecords.length) {
          return res.status(200).json({ message: "No ads found", ads: [] });
        }

        return res.status(200).json({
          message: "Ads retrieved successfully",
          totalPages: adsTotalPages,
          page,
          limit,
          length: adsCount,
          ads: adsRecords,
        });
      }

      case "tasks": {
        const taskCount = await CompletedTask.countDocuments({
          ...dateFilter,
          ...userFilter,
        });
        const taskTotalPages = Math.ceil(taskCount / limit);
        const taskRecords = await CompletedTask.find({
          ...dateFilter,
          ...userFilter,
        })
          .skip(skip)
          .limit(limit)
          .sort({ completionTime: -1 }); // Assuming 'CompletionTime' is the timestamp field

        if (!taskRecords.length) {
          return res.status(200).json({ message: "No tasks found", tasks: [] });
        }

        return res.status(200).json({
          message: "Tasks retrieved successfully",
          totalPages: taskTotalPages,
          page,
          limit,
          length: taskCount,
          tasks: taskRecords,
        });
      }

      case "dailyreward": {
        const dailyRewardCount = await ClaimHistory.countDocuments({
          ...dateFilter,
          ...userFilter,
        });
        const dailyRewardTotalPages = Math.ceil(dailyRewardCount / limit);
        const dailyRewardRecords = await ClaimHistory.find({
          ...dateFilter,
          ...userFilter,
        })
          .skip(skip)
          .limit(limit)
          .sort({ claimedAt: -1 });

        if (!dailyRewardRecords.length) {
          return res
            .status(200)
            .json({ message: "No daily rewards found", rewards: [] });
        }

        return res.status(200).json({
          message: "Daily rewards retrieved successfully",
          totalPages: dailyRewardTotalPages,
          page,
          limit,
          length: dailyRewardCount,
          rewards: dailyRewardRecords,
        });
      }

      case "referral": {
        const referralFilter = { ...dateFilter };
        if (userId) {
          referralFilter.referringUser = userId; // Modify as needed (referredUser or referringUser)
        }

        const referralCount = await Referral.countDocuments(referralFilter);
        const referralTotalPages = Math.ceil(referralCount / limit);
        const referralRecords = await Referral.find(referralFilter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("referringUser", "userName chatId")
          .populate("referredUser", "userName chatId");

        return res.status(200).json({
          message: referralRecords.length
            ? `Referrals for ${userId} fetched successfully`
            : `No referrals for this user`,
          page,
          limit,
          totalPages: referralTotalPages,
          totalCount: referralCount,
          data: referralRecords,
        });
      }

      case "withdrawal": {
        let withdrawalFilter = {
          ...dateFilter,
          // status: "transferred",
          // token: "TON",
        };
        if (userId) withdrawalFilter.userId = userId;

        const withdrawalCount = await Withdraw.countDocuments(withdrawalFilter);
        const withdrawalTotalPages = Math.ceil(withdrawalCount / limit);
        const withdrawalRecords = await Withdraw.find(withdrawalFilter)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 });

        return res.status(200).json({
          message: withdrawalRecords.length
            ? "Withdrawal records retrieved successfully"
            : "No withdrawal records found",
          totalPages: withdrawalTotalPages,
          page,
          limit,
          length: withdrawalCount,
          withdrawals: withdrawalRecords,
        });
      }

      case "alltypes": {
        // Fetching records from different cases
        const gameHistoryRecords = await GameHistory.find({
          ...dateFilter,
          ...userFilter,
        }).sort({ createdAt: -1 });

        const adsRecords = await CompleteAdData.find({
          ...dateFilter,
          ...userFilter,
        }).sort({ completionTime: -1 });

        const taskRecords = await CompletedTask.find({
          ...dateFilter,
          ...userFilter,
        }).sort({ completionTime: -1 });

        const dailyRewardRecords = await ClaimHistory.find({
          ...dateFilter,
          ...userFilter,
        }).sort({ claimedAt: -1 });

        const referralRecords = await Referral.find({
          ...dateFilter,
          ...userFilter,
        })
          .sort({ createdAt: -1 })
          .populate("referringUser", "userName chatId")
          .populate("referredUser", "userName chatId");

        const withdrawalRecords = await Withdraw.find({
          ...dateFilter,
          ...userFilter,
          status: "transferred",
          token: "TON",
        }).sort({ createdAt: -1 });

        // Calculate total count for each type
        const gameHistoryCount = gameHistoryRecords.length;
        const adsCount = adsRecords.length;
        const taskCount = taskRecords.length;
        const dailyRewardCount = dailyRewardRecords.length;
        const referralCount = referralRecords.length;
        const withdrawalCount = withdrawalRecords.length;

        // Combine all records into a single array
        const allRecords = [
          ...gameHistoryRecords.map((record) => ({
            ...record.toObject(),
            type: "gamehistory",
          })),
          ...adsRecords.map((record) => ({
            ...record.toObject(),
            type: "ads",
          })),
          ...taskRecords.map((record) => ({
            ...record.toObject(),
            type: "tasks",
          })),
          ...dailyRewardRecords.map((record) => ({
            ...record.toObject(),
            type: "dailyRewards",
          })),
          ...referralRecords.map((record) => ({
            ...record.toObject(),
            type: "referrals",
          })),
          ...withdrawalRecords.map((record) => ({
            ...record.toObject(),
            type: "withdrawals",
          })),
        ];

        // Sort all combined records by time (assuming 'createdAt' is the common time field)
        allRecords.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Pagination logic
        const totalCount = allRecords.length;
        const totalPages = Math.ceil(totalCount / limit);

        // Get the paginated data (slice the array based on skip and limit)
        const paginatedRecords = allRecords.slice(skip, skip + limit);

        // Return the combined and paginated response
        return res.status(200).json({
          message: "All types of Data retrieved successfully...",
          data: {
            length: totalCount, // Total number of combined records
            totalPages,
            page,
            limit,
            typeCounts: {
              gamehistory: gameHistoryCount,
              ads: adsCount,
              tasks: taskCount,
              dailyRewards: dailyRewardCount,
              referrals: referralCount,
              withdrawals: withdrawalCount,
              all_records: paginatedRecords,
            },
          },
        });
      }

      default:
        return res.status(400).json({ message: "Invalid type selected" });
    }
  } catch (error) {
    console.error("Error in search:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const userId = req.query.userId; // Get userId from query parameters
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.max(parseInt(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    // let userId;
    let user;

    // console.log("🔍 Valid userId:", userId);

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid userId format" });
      }

      // userId = queryUserId;
      user = await User.findById(userId).lean();
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: `No user found with id ${userId}` });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid userId to fetch history.",
      });
    }

    // Now that we have a single userId, pull stats just for them
    const [games, tasks, ads, referrals, rewards, withdrawals] =
      await Promise.all([
        GameHistory.find({ userId }).lean(),
        CompletedTask.find({ userId }).lean(),
        CompleteAdData.find({ userId }).lean(),
        Referral.find({ referringUser: userId }).lean(),
        ClaimHistory.find({ userId }).lean(),
        Withdraw.find({ userId }).lean(),
      ]);

    // Build stats
    const totalGames = games.length;
    const wins = games.filter((g) => g.playedStatus === "WON").length;
    const losses = games.filter(
      (g) => g.playedStatus === "LOSE" || g.playedStatus === "EXPIRED"
    ).length;
    const totalBetAmount = games.reduce((sum, g) => sum + g.betAmount, 0);
    const ticketBalance = user.ticketBalance || 0;
    const totalAdsWatched = ads.length;
    const totalAdRewards = ads.reduce(
      (sum, a) => sum + (a.rewardPoints || 0),
      0
    );
    const totalTasksDone = tasks.length;
    const totalTaskRewards = tasks.reduce(
      (sum, t) => sum + (t.rewardPoints || 0),
      0
    );
    const totalReferrals = referrals.length;
    // console.log("Total Referrals:", referrals);

    const totalRefEarn = referrals.reduce(
      (sum, r) => sum + (r.referralAmount || 0),
      0
    );
    const totalDailyRew = rewards.length;
    const totalDailyAmt = rewards.reduce(
      (sum, r) => sum + (r.rewardPoints || 0),
      0
    );

    const totalWinAmountInGame = games
      .filter((g) => g.playedStatus === "WON")
      .reduce((sum, g) => sum + (g.winAmount || 0), 0);
    // const totalWithdAmount = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
    // const totalTUSDT_AMOUNT = withdrawals
    //   .filter(w => w.status === 'transferred')
    //   .reduce((sum, w) => sum + (w.USDT_Amount || 0), 0);

    //to show only transferred amount(tokens)

    const totalWithdAmount = withdrawals
      .filter((w) => w.status === "TRANSFERRED") // Only include withdrawals with status 'transferred'
      .reduce((sum, w) => sum + (w.amount || 0), 0);

    const totalTUSDT_AMOUNT = withdrawals
      .filter((w) => w.status === "TRANSFERRED") // Only include withdrawals with status 'transferred'
      .reduce((sum, w) => sum + (w.usdt_Amount || 0), 0);

    const userStats = {
      userName: user.userName,
      ticketBalance,
      totalGames,
      wins,
      totalWinAmountInGame,
      losses: losses,
      totalBetAmount,
      totalAdsWatched,
      totalAdRewards,
      totalTasksDone,
      totalTaskRewards,
      totalReferrals,
      totalRefEarn,
      totalDailyRew,
      totalDailyAmt,
      totalWithdAmount,
      totalTUSDT_AMOUNT,
    };

    // Fetch & merge timeline
    const historyDocs = await Promise.all([
      GameHistory.find({ userId }).lean(),
      CompletedTask.find({ userId }).lean(),
      CompleteAdData.find({ userId }).lean(),
      ClaimHistory.find({ userId }).lean(),
      Referral.find({ referringUser: userId })
        .populate("referredUser", "userName")
        .populate("referringUser", "userName")
        .lean(),
      Withdraw.find({
        userId,
        status: { $in: ["PENDING", "APPROVED", "REJECTED", "TRANSFERRED"] },
      }).lean(),
    ]);

    const combined = [];
    const mapType = [
      ["Game", "initiated", historyDocs[0]],
      ["Task", "completionTime", historyDocs[1]],
      ["Ad", "completionTime", historyDocs[2]],
      ["Reward", "claimedAt", historyDocs[3]],
      ["Referral", "createdAt", historyDocs[4]],
      ["Withdrawal", "updatedAt", historyDocs[5]],
    ];

    mapType.forEach(([type, timeKey, docs]) => {
      docs.forEach((doc) => {
        combined.push({
          type,
          ...doc,
          timestamp: doc[timeKey] || doc.createdAt,
        });
      });
    });

    combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const totalRecords = combined.length;
    const totalPages = Math.ceil(totalRecords / limitNum);
    if (pageNum > totalPages) {
      return res.status(200).json({
        success: true,
        message: `Page ${pageNum} out of range (max ${totalPages})`,
        page: pageNum,
        limit: limitNum,
        data: [],
        totalRecords,
        totalPages,
        userStats,
      });
    }

    const data = combined.slice(skip, skip + limitNum);

    return res.status(200).json({
      success: true,
      message: `History + stats for user ${user.userName} (id: ${userId})`,
      page: pageNum,
      limit: limitNum,
      totalRecords,
      totalPages,
      data,
      userStats,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

const dashBoard = async (req, res) => {
  
  try {
    const usercount = await User.countDocuments({});
    const transactioncount = await Withdraw.countDocuments({});
    const gamescount = await GameHistory.countDocuments({});
    const totalTransferred=await Withdraw.countDocuments({status:"TRANSFERRED"})

    return res.status(200).json({
      message: "Data fetched Succesfully..",
      totalUsers: usercount,
      totalTransacions: transactioncount,
      totalGames: gamescount,
      totalTransferredCount: totalTransferred,
    });
  } catch (error) {
    console.error("Error in data fetching:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const referralCount = async (req, res) => {
  const chatId = req.params.chatId;

  try {
    const user = await User.findOne({ chatId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // console.log("User:", user);
    // console.log("User ID:", user._id);

    const usercount = await Referral.countDocuments({
      referringUser: user._id,
    });

    return res.status(200).json({
      message: "Data fetched successfully",
      totalReferrals: usercount,
      currentDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in data fetching:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getUserProfile = async (req, res) => {
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
        Stats: user.Stats,
        profilepic: user.profilepic, // Include additional fields as needed
      },
      // user
    });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    res.status(500).json({ message: "Unable to fetch profile" });
  }
};

module.exports = {
  Adminsignup,
  Usernotification,
  AdminGetReferralReward,
  Adminlogin,
  getAllUsers,
  EditProfile,
  AdmingetProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  approvewithdraw,
  transferwithdraw,
  withdrawLimits,
  rejectwithdraw,
  AdminSetReward,
  GetAllDailyReward,
  getAllWithdrawStatus,
  AdminLogout,
  addAd,
  getAds,
  getCompletedTasksByUser,
  getCompletedAdsByUser,
  getAllClaimHistory,
  AdminSetReferralReward,
  AdminGetReferralReward,
  dashBoard,
  searchRecords,
  getUserHistory,
  getUserProfile,
  referralCount,
};
