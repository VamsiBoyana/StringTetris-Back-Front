import CryptoJS from "crypto-js";


// Function to encrypt the secret key with a timestamp
 export const encryptSecretKey = (key, timestamp) => {

  
  const payloadToEncrypt = `${key}&TimeStamp=${timestamp}`;
  const encrypted = CryptoJS.AES.encrypt(payloadToEncrypt, key).toString();
  return encrypted;
};



// Base URL
// export const Base_url = "http://localhost:3200/api/auth";
// export const Base_url = "https://tetrisbackend.bonzi.xyz/api/auth";  //TEST
export const Base_url = "https://stringtetris.com/backapi/api/auth"; // live



// API Endpoints
export const UserLogin = `${Base_url}/userlogin`;
export const AdminLogin = `${Base_url}/adminlogin`;
export const AddUser = `${Base_url}/admin`;
export const UserProfile = `${Base_url}/getprofile`;
export const UpdateUserProfile = `${Base_url}/updateprofile`;
export const AllTasks = `${Base_url}/getUserTasks`;
export const AllAds = `${Base_url}/getUserads`;
export const CompleteTask = `${Base_url}/completetask`;
export const CompleteAd = `${Base_url}/completeUserAD`;
export const DailyReward = `${Base_url}/claimdailyReward`;
export const PlaceBet = `${Base_url}/game`;
export const GameControlles = `${Base_url}/getusersinglegame`;
export const GetCompletedTasks = `${Base_url}/getCompletedTasks`;
export const GetReferralHistory = `${Base_url}/getreferralHistory`;
export const GetReferralReward = `${Base_url}/getReferralReward`;
export const WithdrawRequest = `${Base_url}/withdrawRequest`;
export const GetWithdrawHistory = `${Base_url}/getWithdrawStatus`;
export const WithdrawLimits = `${Base_url}/getUserWithdrawalLimits`;
export const TicketConvertion = `${Base_url}/getUserTicketConvertion`;
export const Leaderboard = `${Base_url}/getLeaderBoard`;
export const CompletedAds = `${Base_url}/getUserCompletedAds`;
export const GetDailyReward = `${Base_url}/GetDailyReward`;
export const GetClaimHistory =  `${Base_url}/getUserClaimHistory`;
export const GetDashBoardUser =  `${Base_url}/dashBoardUser`;
export const GetGameStats = `${Base_url}/getGameStats`;

// export const BOTNAME = `Tetris_Testt_Bot`;  //TEST
export const BOTNAME = `stringtetris_bot`; // live

// export const BANKBOTLINK = `https://t.me/stringtestbank_bot/withdraw`; //test
export const BANKBOTLINK = `https://t.me/stringwithdrawbank_bot/withdraw`; // LIVE

