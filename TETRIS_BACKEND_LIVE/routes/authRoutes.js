const express = require("express");
const router = express.Router();
//admin controller
const { Adminsignup,AdminSetReferralReward,Usernotification, Adminlogin, getAllUsers, EditProfile, AdmingetProfile, AdminSetReward,
     GetAllDailyReward, approvewithdraw,transferwithdraw, getAllWithdrawStatus, withdrawLimits, rejectwithdraw, changePassword,
      forgotPassword, resetPassword, AdminLogout, addAd, getAds, getCompletedTasksByUser, getCompletedAdsByUser, getAllClaimHistory,
       AdminGetReferralReward,getUserHistory,searchRecords,getUserProfile, dashBoard,referralCount  } = require("../controller/admin/adminController");
const { validateToken,validateClientIdAdmin,validateClientId,validateReferralCount, isAdmin, isuser,validateTelegramHash } = require("../middleware/token")
//user controller
const { signup, UserClaimReward,GetUserClaimHistory,getuserads, login, withdrawrequest,getGameStats, getProfile, updateProfile, getWithdrawStatus ,dashBoardUser,getreferralHistory,UserGetReferralReward,GetDailyReward} = require("../controller/user/userController")
//task controller
const { Addtask, Tasks } = require("../controller/admin/taskController")
//booster controller


const { Totalgamehistory, gameController, getAllGames, getSingleGame, createOrUpdateGame } = require("../controller/admin/gameController")

const { placeBet, gameHistory,getUserSingleGame } = require("../controller/user/gameController")

const { getUserTask, CompleteUserTask, getUserCompletedTasks, getUserTasksWithStatus, CompleteUserAd,getUserCompletedAds} = require('../controller/user/taskController');
const { updateOrCreateWithdrawLimits, getWithdrawalLimits} = require("../controller/admin/withdrawLimits");
const { getUserWithdrawalLimits,getUserTicketConvertion} = require("../controller/user/userwithdrawLimits");
const {Tickets,getTicketConvertion} = require("../controller/admin/ticketsController");
// const { validate } = require("../models/rewardSettingSchema");


//Admin Routes
router.post("/adminsignup", Adminsignup);    
router.post("/adminlogin", Adminlogin);    
router.get("/admingetallusers",
       validateToken,
       validateClientIdAdmin,
        isAdmin,
        getAllUsers);    
router.put("/admineditprofile/:_id",
         validateToken, validateClientIdAdmin, isAdmin,
        EditProfile);   
router.get("/admingetprofile/:_id",
         validateToken, validateClientIdAdmin, isAdmin,
        AdmingetProfile);    
router.post("/setdailyReward", 
         validateToken, validateClientIdAdmin, isAdmin,
       AdminSetReward)   
router.get("/getalldailyreward",
         validateToken, validateClientIdAdmin, isAdmin,
        GetAllDailyReward);  //✅
router.post("/approveWithdraw",
         validateToken,
          validateClientIdAdmin, isAdmin,
approvewithdraw);    //✅
router.post("/transferWithdraw",
         validateToken,
        //   validateClientIdAdmin,
           isAdmin,
       transferwithdraw);    //✅
router.post("/rejectWithdraw",
         validateToken, validateClientIdAdmin, isAdmin,
        rejectwithdraw);   //✅
router.get("/getallwithdrawstatus",
        validateToken,
        //   validateClientIdAdmin,
           isAdmin,
       getAllWithdrawStatus);   //✅
router.post("/addtask",
         validateToken, validateClientIdAdmin, isAdmin,
         Addtask);   //✅
router.post("/updatetask/admin",
         validateToken, validateClientIdAdmin, isAdmin,
       Addtask);   //✅
router.get("/getsingletask/admin/:id",
         validateToken, validateClientIdAdmin, isAdmin,
        Tasks);   //✅
router.get("/gettasks/admin",
         validateToken, validateClientIdAdmin, isAdmin,
        Tasks);   //✅
router.post("/changepassword", changePassword);  //✅
router.post("/forgotPassword", forgotPassword);  //✅
router.post("/resetPassword", resetPassword);   //✅
router.post("/adminLogout", AdminLogout);  //✅
router.get("/totalgamehistory",
         validateToken, validateClientIdAdmin, isAdmin,
        Totalgamehistory);  //✅
router.post("/addAdUpdateAd",
         validateToken, validateClientIdAdmin, isAdmin,
         addAd)  //✅-
router.get("/getads/:AdId",
         validateToken, validateClientIdAdmin, isAdmin,
         getAds)  //✅-
router.get("/getads",
         validateToken, validateClientIdAdmin, isAdmin,
         getAds)   //✅-
router.get('/getCompletedTasksByUser/:_id',
         validateToken, validateClientIdAdmin, isAdmin,
       getCompletedTasksByUser);  //✅-
router.get('/getCompletedTasksByUser',
         validateToken, validateClientIdAdmin, isAdmin,
       getCompletedTasksByUser);  //✅-
router.get('/getCompletedAdsByUser/:_id',
         validateToken, validateClientIdAdmin, isAdmin,
         getCompletedAdsByUser)  //✅-
router.get('/getCompletedAdsByUser',
         validateToken, validateClientIdAdmin, isAdmin,
         getCompletedAdsByUser)  //✅-
router.get('/getAllClaimHistory',
         validateToken, validateClientIdAdmin, isAdmin,
         getAllClaimHistory)  //✅-
router.post("/game",
        validateToken,validateClientIdAdmin, isAdmin,
         createOrUpdateGame)  //✅-
router.post("/gameUpdate/:_id",
        validateToken,
        validateClientIdAdmin,
         isAdmin,
         createOrUpdateGame);  //✅-
router.get("/gettotalgames",
         validateToken, validateClientIdAdmin, isAdmin,
         getAllGames);  //✅-
router.get("/getsinglegame", 
         validateToken, validateClientIdAdmin, isAdmin,
        getSingleGame);  //✅-
router.post('/sendNotificationToAllUsers',
         validateToken, validateClientIdAdmin, isAdmin,
         Usernotification);   //✅-
router.post('/set-referral-reward',
         validateToken, validateClientIdAdmin, isAdmin,
         AdminSetReferralReward);    //✅-
router.post('/set-referral-rewardByID/:id', 
         validateToken, validateClientIdAdmin, isAdmin,
       AdminSetReferralReward);    //✅-
router.get('/admin/referral-reward/:id',
         validateToken, validateClientIdAdmin, isAdmin,
         AdminGetReferralReward);   //✅-
router.get('/admin/referral-rewards',
         validateToken, validateClientIdAdmin, isAdmin,
       AdminGetReferralReward);  //✅-
router.get("/getreferralHistory", 
         validateToken, validateClientIdAdmin, isAdmin,
        getreferralHistory);    //✅-
router.post("/CreateWithdrawLimits",
         validateToken, validateClientIdAdmin, isAdmin,
        updateOrCreateWithdrawLimits);    //✅-
router.post("/updateWithdrawLimits",
         validateToken, validateClientIdAdmin, isAdmin,
         updateOrCreateWithdrawLimits);    //✅-
router.get("/getWithdrawLimits",
        validateToken,
        //   validateClientIdAdmin,
           isAdmin,
         getWithdrawalLimits);    //✅-
router.post("/createTickets" ,
         validateToken, validateClientIdAdmin, isAdmin,
         Tickets);    //✅-
router.post("/updateTickets",
         validateToken, validateClientIdAdmin, isAdmin,
         Tickets);    //✅-
router.get("/getTicketConvertion", 
         validateToken, validateClientIdAdmin, isAdmin,
        getTicketConvertion);    //✅-
router.get("/searchRecords",
         validateToken, validateClientIdAdmin, isAdmin,
       searchRecords);    //✅-


router.get('/dashboard',
         validateToken, validateClientIdAdmin, isAdmin,
         dashBoard);  //--
router.get('/user/history',
         validateToken, validateClientIdAdmin, isAdmin,
              getUserHistory);
router.get("/getUserProfile/:_id",
         validateToken, validateClientIdAdmin, isAdmin,
         getUserProfile); 

router.get("/referralCount/:chatId",
       validateReferralCount,
         referralCount);


router.post("/swlogin",validateTelegramHash, login);    //✅-
router.get("/getprofile/:_id",
     validateToken,validateClientId, isuser,
     getProfile);   //✅-
router.post("/withdrawRequest/:_id",
     validateToken,validateClientId, isuser,
     withdrawrequest);    //✅-
router.get("/getUserTicketConvertion/:_id",
     validateToken,validateClientId, isuser,
     getUserTicketConvertion);
router.get('/getWithdrawStatus/:_id',
     validateToken,
     validateClientId,
      isuser,
     getWithdrawStatus);
// router.get('/withdrawallimits/:_id',validateToken,validateClientId, isuser,withdrawLimits);   //✅
router.get("/getUserWithdrawalLimits/:_id",
     validateToken,validateClientId, isuser,
     getUserWithdrawalLimits);
 



// user Routes
// router.post("/usersignup", signup);   //✅
router.post("/userlogin",
        validateTelegramHash,validateClientId,
         login);    //✅-
router.get("/getprofile/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
         getProfile);   //✅-
router.post("/updateprofile/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
         updateProfile);  //✅-
router.post("/claimdailyReward/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
        UserClaimReward);    //✅-
router.post("/withdrawRequest/:_id", 
        validateToken,validateClientId, isuser,validateTelegramHash,
         withdrawrequest);    //✅-
router.get('/getWithdrawStatus/:_id',
        validateToken,validateClientId, isuser,validateTelegramHash,
         getWithdrawStatus);
router.get("/getusersinglegame/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
        getUserSingleGame);  //✅-
router.post("/game/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
         placeBet);  //✅-
router.get("/gamehistory/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
         gameHistory);  //✅-
router.post("/completetask/:_id", 
        validateToken,validateClientId, isuser,validateTelegramHash,
         CompleteUserTask);  //✅-
router.get("/getUserTasks/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
         getUserTask );  //✅-
router.get("/getCompletedTasks/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
         getUserCompletedTasks);   //✅-
router.get("/getUserTasksWithStatus/:_id", 
        validateToken,validateClientId, isuser,validateTelegramHash,
         getUserTasksWithStatus);   //✅-
router.get('/withdrawallimits/:_id',
        validateToken,validateClientId, isuser,validateTelegramHash,
         withdrawLimits);   //✅
router.get('/getUserads/:_id', 
        validateToken,validateClientId, isuser,validateTelegramHash,
         getuserads);  //✅-
router.post("/completeUserAD/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
        CompleteUserAd);
router.get("/getreferralHistory/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
        getreferralHistory);    //✅-
router.get("/getReferralReward/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
        UserGetReferralReward);
router.get("/getUserWithdrawalLimits/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
        getUserWithdrawalLimits);
router.get("/getUserTicketConvertion/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
        getUserTicketConvertion);
router.get("/getUserCompletedAds/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
        getUserCompletedAds);
router.get("/GetDailyReward/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
        GetDailyReward);
router.get("/getUserClaimHistory/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
        GetUserClaimHistory);
router.get("/dashBoardUser/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
        dashBoardUser);
router.get("/getGameStats/:_id",
        validateToken,validateClientId, isuser,validateTelegramHash,
        getGameStats);







module.exports = router;
 