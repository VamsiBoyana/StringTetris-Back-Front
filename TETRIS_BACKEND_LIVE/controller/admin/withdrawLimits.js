const mongoose = require("mongoose");
const withdrawLimits = require("../../models/WithdrawalLimitsSchema");

const updateOrCreateWithdrawLimits = async (req, res) => {
  try {
    // const limitId = req.params._id;
    const { limitId, minWithdrawal, maxWithdrawal, fee_Wallet, fixed_Charge, status, token_Mint, percentage_Charge, symbol, withdraw_Note, withdrawalCount  } = req.body;
 
    if (limitId) {
      const updatedLimits = await withdrawLimits.findByIdAndUpdate(
        limitId,
        { minWithdrawal, maxWithdrawal, fee_Wallet, fixed_Charge, status, token_Mint,withdraw_Note, percentage_Charge, symbol, withdrawalCount },
        { new: true } // return updated doc
      );

      // console.log(updatedLimits, "id");
      

      if (!updatedLimits) {
        return res.status(404).json({
          success: false,
          message: "Withdrawal limits not found to update",
        });
      }

      const saveupdatedlimits = await updatedLimits.save();



      return res.status(200).json({
        success: true,
        message: "Withdrawal limits updated successfully.",
        data: saveupdatedlimits,
        
      });
    }

    // If no ID, create new limits

    await withdrawLimits.updateMany({}, { $set: { status: "INACTIVE" } });
    

    const newLimits = new withdrawLimits({
      minWithdrawal,
      maxWithdrawal,
      fee_Wallet,
      fixed_Charge,
      status : "ACTIVE",
      token_Mint,
      percentage_Charge,
      withdrawalCount,
      symbol,
      withdraw_Note
    });

    const savedLimits = await newLimits.save();

    return res.status(201).json({
      success: true,
      message: "Withdrawal limits added successfully.",
      data: savedLimits,
    });
  } catch (error) {
    console.error("Error in adding or updating withdrawal limits:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to add or update withdrawal limits",
    });
  }
};


const getWithdrawalLimits = async (req, res) => {
  
  try {
    const limits = await withdrawLimits.findOne({status:"ACTIVE"});
    // console.log(limits);
    

    return res.status(200).json({
      success: true,
      message: "Withdrawal limits fetched successfully.",
      data: limits,
    });
  } catch (error) {
    console.error("Error fetching withdrawal limits:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch withdrawal limits",
    });
  }
};

module.exports = { updateOrCreateWithdrawLimits, getWithdrawalLimits,};
