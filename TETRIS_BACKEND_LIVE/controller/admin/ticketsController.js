const mongoose = require("mongoose");
const TicketConvertion = require("../../models/TicketConvertion");

const Tickets = async (req, res) => {
  try {
    const { ticketId, ticketQuantity, status, amountInToken, defaultAdminWallet } = req.body;

    if (ticketId) {
      // Update existing document
      const updatedConvertion = await TicketConvertion.findByIdAndUpdate(
        ticketId,
        { ticketQuantity, status, amountInToken, defaultAdminWallet },
        { new: true }
      );

      if (!updatedConvertion) {
        return res.status(404).json({
          success: false,
          message: "TicketConvertion not found for update.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "TicketConvertion updated successfully.",
        data: updatedConvertion,
      });
    } else {
      // Create new document
          await TicketConvertion.updateMany({}, { $set: { status: "INACTIVE" } });
      

      const convertion = new TicketConvertion({
        ticketQuantity,
        status,
        amountInToken,
        defaultAdminWallet,
      });

      const savedConvertion = await convertion.save();

      return res.status(201).json({
        success: true,
        message: "TicketConvertion added successfully.",
        data: savedConvertion,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create or update TicketConvertion.",
      error: error.message,
    });
  }
};


const getTicketConvertion = async(req,res)=>{
  const userId = req.params.id; 
  try {
    const TicketValue = await TicketConvertion.findOne({status:"ACTIVE"});
   return res.status(200).json({
      success: true,
      message: "TicketConvertion  fetched successfully.",
      data: TicketValue,
    });
  } catch (error) {
    console.error("Error fetching TicketConvertion :", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch TicketConvertion ",
    });
  }
};



module.exports = {Tickets,getTicketConvertion};
