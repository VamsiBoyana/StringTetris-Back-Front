import React, { useState, useEffect, useContext } from "react";
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ReactGA from 'react-ga';
// ReactGA.initialize('G-K9GJH23MN3');
import { MyContext } from "../../context/Mycontext";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Avatar,
  CircularProgress,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem,
  IconButton
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from '@mui/icons-material/Close';
import bgimage from "../../assets/bg.jpg";
import { BANKBOTLINK } from "../../ApiConfig";

import {
  UpdateUserProfile,
  UserProfile,
  WithdrawRequest,
  GetWithdrawHistory,
  TicketConvertion,
  WithdrawLimits,
  GetGameStats,
  encryptSecretKey
} from "../../ApiConfig";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import profileimg from "../../assets/profileimg.png";
import bg1 from "../../assets/bg.jpg";
// import bg1 from "../../assets/bg1.png";
import coin from "../../assets/coin.png";
// import { ToastContainer, toast } from "react-toastify";
import toast, { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { color } from "framer-motion";
import SquareLoader from "../SquareLoader/SquareLoader";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [withdraw, setWithdraw] = useState(false);
  const [network, setNetwork] = useState("");
  // const [choosenetwork, setChoosenetwork] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  // const [walletid, setWalletId] = useState("");
  const [dialogView, setDialogView] = useState("withdraw");
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [minWithdrawal, setMinWithdrawal] = useState(null);
  const [maxWithdrawal, setMaxWithdrawal] = useState(null);
  const [usdtAmount, setUsdtAmount] = useState(0);
  const [ticketQuantity, setTicketQuantity] = useState(0)
  const navigate = useNavigate();
  const { updateUserBalance } = useUser();
  const userId = localStorage.getItem("userId");
  const { data } = useContext(MyContext);
  const profileImage = window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url;



  useEffect(() => {
    // Initialize Google Analytics
    ReactGA.initialize('G-K9GJH23MN3');

    // Track page view
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []); // Empty dependency array ensures it runs only once (on mount)

  // Add effect to handle component mount and ensure profile is loaded
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("upToken");

    if (!userId || !token) {
      console.error("Missing authentication data");
      setError("Authentication required");
      setLoading(false);
      return;
    }

    // If profile is null and not loading, try to fetch it
    if (!profile && !loading) {
      // This will trigger the profile fetch useEffect
    }
  }, [profile, loading]);

  const resetWithdrawStates = () => {
    setNetwork("");
    setWithdrawAmount("");
    setWalletAddress("");
    setDialogView("withdraw");
  };

  const retryProfileFetch = () => {
    setError("");
    setLoading(true);
    setProfile(null);
    // The useEffect will automatically refetch due to the dependency change
  };

  const validateProfileData = (profileData) => {
    if (!profileData) return false;
    if (!profileData.id || !profileData.userName) return false;
    return true;
  };

  // Add this line to check if any dialog is open
  const isAnyDialogOpen = openEdit || withdraw;

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (!isMounted) return;

      setLoading(true);
      setError(""); // Clear any previous errors
      const userId = localStorage.getItem("userId");

      if (!userId) {
        console.error("No userId found in localStorage");
        if (isMounted) {
          setError("User not logged in.");
          setLoading(false);
        }
        return;
      }

      try {
        const token = localStorage.getItem("upToken");

        const response = await axios.get(`${UserProfile}/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
            WebApp: window.Telegram.WebApp.initData,
          },
        });

        if (!response.data.user) {
          console.error("No user data in response");
          if (isMounted) {
            setError("Invalid profile data received");
            setLoading(false);
          }
          return;
        }

        // Validate the profile data
        if (!validateProfileData(response.data.user)) {
          console.error("Invalid profile data structure");
          if (isMounted) {
            setError("Invalid profile data structure");
            setLoading(false);
          }
          return;
        }


        if (isMounted) {
          setProfile(response.data.user);
        }
      } catch (err) {
        console.error("Profile fetch error:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load profile.");
          setProfile(null); // Ensure profile is null on error
        }
      } finally {
        // await new Promise(resolve => setTimeout(resolve, 1000));
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [data]); // Add data as dependency to refetch when context changes


  useEffect(() => {
    let isMounted = true;

    const fetchGameStats = async () => {
      if (!isMounted) return;

      const userId = localStorage.getItem("userId");

      if (!userId) {
        console.error("No userId found in localStorage");
        return;
      }

      try {
        const token = localStorage.getItem("upToken");

        const response = await axios.get(`${GetGameStats}/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
            WebApp: window.Telegram.WebApp.initData,
          },
        });


        if (!response.data.userGameStats) {
          console.error("No game stats data in response");
          return;
        }

        if (isMounted) {
          setGames(response.data.userGameStats);
        }
      } catch (err) {
        console.error("Game stats fetch error:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        // Don't set error here as it's not critical for the main profile display
      }
    };

    fetchGameStats();
    fetchTicketConvertion()

    return () => {
      isMounted = false;
    };
  }, [])

  // Debug useEffect to track profile state changes
  useEffect(() => {
  }, [profile]);

  const fetchWithdrawLimits = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${WithdrawLimits}/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("upToken")}`,
          clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
          WebApp: window.Telegram.WebApp.initData,
        },
      });
      setMinWithdrawal(response.data.data.minWithdrawal);
      setMaxWithdrawal(response.data.data.maxWithdrawal);
    } catch (error) {
      console.error("Failed to fetch withdraw Limits:", {
        error: error,
        response: error.response?.data,
        status: error.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketConvertion = async () => {
    setLoading(true);
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.warn("User not logged in — skipping TicketConvertion fetch");
      return;
    }
    try {
      const response = await axios.get(`${TicketConvertion}/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("upToken")}`,
          clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
          WebApp: window.Telegram.WebApp.initData,
        },
      });


      setUsdtAmount(response.data.data.amountInToken);
      setTicketQuantity(response.data.data.ticketQuantity);

      // Update state if needed here
    } catch (error) {
      console.error("Fetch ticket conversion error:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleWithdraw = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        // console.error("User not logged in");
        toast.error("User not logged in.");
        return;
      }

      // Validate inputs
      if (!withdrawAmount) {
        console.error("Missing amount field");
        toast.error("Please enter amount");
        return;
      }

      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount)) {
        console.error("Invalid amount:", withdrawAmount);
        toast.error("Please enter a valid amount");
        return;
      }

      if (amount < minWithdrawal || amount > maxWithdrawal) {
        console.error(
          `Amount must be between ${minWithdrawal} and ${maxWithdrawal}`
        );
        toast.error(
          `Amount must be between ${minWithdrawal} and ${maxWithdrawal}`
        );
        return;
      }

      if (!profile?.ticketBalance || profile.ticketBalance < amount) {
        console.error("Insufficient balance:", {
          balance: profile?.ticketBalance || 0,
          amount,
        });
        toast.error("Insufficient balance");
        return;
      }

      const response = await axios.post(
        `${WithdrawRequest}/${userId}`,
        {
          amount: amount,
          token: network || "SOL",
          walletAddress: walletAddress || "random-wallet-id-12345",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("upToken")}`,
            WebApp: window.Telegram.WebApp.initData,
            clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
          },
        }
      );
      updateUserBalance(); // Update global balance state

      if (response.data.message) {
        toast.success("Withdrawal request sent successfully!");
        setWithdraw(false);
        setNetwork("");
        setWithdrawAmount("");
        setWalletAddress("");

        // Refresh profile data and update global balance
        const profileResponse = await axios.get(`${UserProfile}/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("upToken")}`,
            clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
            WebApp: window.Telegram.WebApp.initData,
          },
        });
        setProfile(profileResponse.data.user);
        updateUserBalance(); // Update global balance state
        // After successful withdrawal API call
        window.dispatchEvent(new CustomEvent("pointsUpdated", {
          detail: { points: -amount }
        }));

      } else {
        console.error("Unexpected response format:", response.data);
        toast.error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Withdrawal failed:", {
        error: error,
        response: error.response,
        message: error.message,
      });
      toast.error(
        error.response?.data?.message || "Failed to send withdrawal request"
      );
    }
  };


  const validateUsername = (username) => {
    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(username)) {
      return "Username cannot contain multiple spaces";
    }
    
    // Check for dots or other special characters if needed
    if (/[.]/.test(username)) {
      return "Username cannot contain dots";
    }
    
    // Check for empty or only spaces
    if (!username.trim()) {
      return "Username cannot be empty";
    }
    
    return null; // No error
  };
  
  const handleSaveUsername = async () => {
    // Validate the username
    const validationError = validateUsername(editedUsername);
    if (validationError) {
      toast.error(validationError);
      return;
    }
  
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
  
      const response = await axios.post(
        `${UpdateUserProfile}/${userId}`,
        { userName: editedUsername.trim() }, // Trim whitespace
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("upToken")}`,
            clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
            WebApp: window.Telegram.WebApp.initData,
          },
        }
      );
  
      if (response.data?.user) {
        setProfile(response.data.user);
        setOpenEdit(false);
        toast.success("Username updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update username:", error);
      toast.error(error.response?.data?.message || "Failed to update username. Please try again.");
    }
  };


  // const handleSaveUsername = async () => {
  //   try {
  //     const userId = localStorage.getItem("userId");
  //     if (!userId) return;

  //     const response = await axios.post(
  //       `${UpdateUserProfile}/${userId}`,
  //       { userName: editedUsername },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("upToken")}`,
  //           clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
  //           WebApp: window.Telegram.WebApp.initData,
  //         },
  //       }
  //     );

  //     if (response.data?.user) {
  //       setProfile(response.data.user);
  //       setOpenEdit(false);
  //     }
  //   } catch (error) {
  //     console.error("Failed to update username:", error);
  //     alert("Failed to update username. Please try again.");
  //   }
  // };



  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: 2,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bgimage}) no-repeat center center`,
          zIndex: 1000,
        }}
      >
        <SquareLoader />
      </Box>
    );
  }

  // Add null check for profile to prevent white background
  if (!loading && !profile && !error) {
    return (
      <Box sx={styles.errorContainer}>
        <Typography sx={{ color: "#53e0ff", fontSize: 16, textAlign: "center" }}>
          Loading profile data...
        </Typography>
      </Box>
    );
  }

  if (!loading && !profile && error) {
    return (
      <Box sx={styles.errorContainer}>
        <Typography sx={{ color: "#ff4b4b", fontSize: 16, textAlign: "center", mb: 2 }}>
          {error}
        </Typography>
        <Button
          variant="outlined"
          sx={{
            borderColor: "#53e0ff",
            color: "#53e0ff",
            "&:hover": { background: "#1a223a" }
          }}
          onClick={retryProfileFetch}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // Ensure profile is valid before rendering
  if (!profile || !validateProfileData(profile)) {
    return (
      <Box sx={styles.errorContainer}>
        <Typography sx={{ color: "#ff4b4b", fontSize: 16, textAlign: "center", mb: 2 }}>
          Profile data is invalid or corrupted
        </Typography>
        <Button
          variant="outlined"
          sx={{
            borderColor: "#53e0ff",
            color: "#53e0ff",
            "&:hover": { background: "#1a223a" }
          }}
          onClick={retryProfileFetch}
        >
          Retry
        </Button>
      </Box>
    );
  }



  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100vw",
        overflowY: "auto",
        overflowX: "hidden",
        padding: { xs: "15px 5px", sm: "20px 15px", md: "40px 20px" },
        boxSizing: "border-box",
        top: 0,
        left: 0,
        flexDirection: "column",
        background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bgimage}) no-repeat center center`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}>
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "5%",
        pt: 4,
        pb: 4,
      }}>
        <Box sx={{
          width: "90%",
          maxWidth: "100%",
          background: "rgba(20,20,30,0.95)",
          borderRadius: 2,
          boxShadow: "0 0 5px #53e0ff",
          animation: 'parallax-slide-left 0.5s ease-out forwards',
          mb: 2,
          p: 1,
          textAlign: "center",
          mt: 2
        }}>
          {/* <Avatar
            src=<span>{profileImage ? profile.profileImage : profileimg}</span>
            alt=<span>{profile?profile.userName : "Player One"}</span>
            sx={{ width: 60, height: 60, margin: "0 auto", border: "3px solid #53e0ff", boxShadow: "0 0 16px #53e0ff99" }}
          /> */}
          <Avatar
            src={
              window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url ||
              profileimg
            }
            alt={profile?.userName || "Player One"}
            sx={{
              width: 60,
              height: 60,
              margin: "0 auto",
              border: "3px solid #53e0ff",
              boxShadow: "0 0 16px #53e0ff99"
            }}
          />
          <Typography sx={{ color: "#53e0ff", fontWeight: 700, fontSize: 12, mt: 2, mb: 1, textShadow: "0 0 8px #53e0ff" }}>
            {profile?.userName || "Player One"}
          </Typography>
          {/* <Typography sx={{ color: "#b0b0b0", fontSize: 16, mb: 2 }}>
          Game Player
        </Typography> */}
          <Button
            variant="outlined"
            sx={{
              borderColor: "#53e0ff",
              color: "#53e0ff",
              fontSize: "10px",
              fontWeight: 300,
              boxShadow: "0 0 8px #53e0ff55",
              "&:hover": { background: "#1a223a" }
            }}
            startIcon={<CreateOutlinedIcon style={{ fontSize: "12px" }} />}
            onClick={() => {
              if (profile?.userName) {
                setEditedUsername(profile.userName);
                setOpenEdit(true);
              }
            }}
            disabled={!profile?.userName}
          >
            Edit Profile
          </Button>
        </Box>
        {/* Stats Card */}
        <Box sx={{
          width: "90%",
          maxWidth: "100%",
          background: "rgba(20,20,30,0.95)",
          borderRadius: 2,
          animation: 'parallax-slide-right 0.5s ease-out forwards',
          boxShadow: "0 0 16px #6c2eb7",
          mb: 2,
          p: 1,
          textAlign: "center"
        }}>

          <Typography sx={{ color: "#d47fff", fontWeight: 700, fontSize: 15, mb: 2, letterSpacing: 1 }}><EmojiEventsOutlinedIcon style={{ color: "gold", fontSize: "18" }} /> STATS</Typography>
          <Box sx={{ display: "flex", justifyContent: "space-around", mb: 1 }}>
            <Box>
              {/* <Typography sx={{ color: "#4be0ff", fontSize: 20, fontWeight: 400 }}>{games.losses || 0}</Typography> */}
              <Typography sx={{ color: "#4be0ff", fontSize: 20, fontWeight: 400 }}><span>{games ? games.totalGamesPlayed : 0}</span></Typography>
              <Typography sx={{ color: "#b0b0b0", fontSize: 15 }}>Games Played</Typography>
            </Box>
            <Box>
              <Typography sx={{ color: "#00ff00", fontSize: 20, fontWeight: 400 }}><span>{games ? games.wins : 0}</span></Typography>
              <Typography sx={{ color: "#b0b0b0", fontSize: 15 }}>Wins</Typography>
            </Box>
          </Box>
        </Box>

        {/* Wallet Card */}
        <Box sx={{
          width: "90%",
          maxWidth: "100%",
          background: "rgba(20,30,10,0.95)",
          borderRadius: 2,
          boxShadow: "0 0 16px #00ff6a55",
          marginBottom: "10%",
          p: 3,
          textAlign: "center",
          animation: 'parallax-slide-left 0.5s ease-out forwards',
        }}>
          <Typography sx={{ color: "#00ff6a", fontWeight: 700, fontSize: 15, mb: 1, letterSpacing: 1 }}>WALLET</Typography>
          <Typography sx={{ color: "#53e0ff", fontSize: 18, fontWeight: 900, textShadow: "0 0 8px #53e0ff" }}>
            {(profile?.ticketBalance || 0).toLocaleString()}
          </Typography>
          <Typography sx={{ color: "#fff", fontSize: 12, mb: 1 }}>Earned Points</Typography>
          <Typography sx={{ color: "#00ff6a", fontSize: 12, fontWeight: 700, mb: 2 }}>
            ≈ {(usdtAmount && ticketQuantity && profile?.ticketBalance)
              ? ((usdtAmount * profile.ticketBalance) / ticketQuantity).toFixed(4)
              : "0.0000"} USDT
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              borderColor: "#d47fff",
              color: "#d47fff",
              fontSize: 15,
              height: "30px",
              mt: 1,
              fontWeight: 700,
              boxShadow: "0 0 8px #d47fff55",
              "&:hover": { background: "#2a1a3a" }
            }}
            onClick={() => navigate("/referralhistory")}
          >
            Referral History
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              borderColor: "#ffb347",
              color: "#ffb347",
              mt: 1,
              fontSize: 15,
              fontWeight: 700,
              height: "30px",
              boxShadow: "0 0 8px #ffb34755",
              "&:hover": { background: "#3a2a1a" }
            }}
            onClick={() => navigate("/withdrawhistory")}
          >
            Withdraw History
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{
              background: "linear-gradient(90deg, #53e0ff 0%, #a259ff 100%)",
              color: "#fff",
              fontSize: 15,
              height: "32px",
              fontWeight: 700,
              boxShadow: "0 0 12px #53e0ff99",
              mt: 1,
              "&:hover": { background: "linear-gradient(90deg, #a259ff 0%, #53e0ff 100%)" }
            }}
            onClick={() => {
              // setWithdraw(true);
              // fetchWithdrawLimits();
              // fetchTicketConvertion();
              // Redirect to Telegram bot instead of opening withdraw dialog
              window.open(BANKBOTLINK, "_blank");
          
            }}
          >
            <span style={{ marginRight: 8, fontSize: 13 }}>⬇</span> Withdraw
          </Button>
        </Box>
        <Dialog
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          PaperProps={{
            sx: {
              background: "rgba(10,10,15,0.98)",
              borderRadius: 3,
              border: "1.5px solid #53e0ff",
              boxShadow: "0 0 24px #53e0ff55",
              width: "100%",
              p: 2,
            }
          }}
        >
          <DialogTitle
            sx={{
              color: "#53e0ff",
              fontWeight: 700,
              fontSize: 15,
              borderBottom: "1px solid #222b3a",
              display: "flex",
              alignItems: "center",
              gap: 1,
              pb: 1,
            }}
          >
            <CreateOutlinedIcon sx={{ color: "#53e0ff", fontSize: 15 }} />
            Edit Profile
            <Button
              onClick={() => setOpenEdit(false)}
              sx={{
                ml: "auto",
                minWidth: 0,
                color: "#fff",
                fontSize: 18,
                background: "none",
                "&:hover": { color: "#ff4b4b", background: "none" }
              }}
            >
              ×
            </Button>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography sx={{ color: "#00ff6a", fontSize: 14, mb: 1 }}>
              Name
            </Typography>
            <TextField
              value={editedUsername}
              // onChange={e => setEditedUsername(e.target.value)}
              onChange={e => {
                // Prevent multiple consecutive spaces
                let value = e.target.value;
                value = value.replace(/\s{2,}/g, ' ');
                
                // Prevent dots if needed
                value = value.replace(/[.]/g, '');
                
                setEditedUsername(value);
              }}
              fullWidth
              autoFocus
              variant="outlined"
              sx={{
                input: {
                  color: "#fff",
                  background: "transparent",
                  borderRadius: 1,
                  border: "1.5px solid #00ff6a",
                  boxShadow: "0 0 8px #00ff6a55",
                  px: 1.5,
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#00ff6a"
                  },
                  "&:hover fieldset": {
                    borderColor: "#53e0ff"
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#53e0ff"
                  }
                }
              }}
              InputProps={{
                style: {
                  color: "#fff",
                  fontSize: 10,
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: "flex-end", p: 2, pt: 1 }}>
            <Button
              onClick={() => setOpenEdit(false)}
              sx={{
                background: "#18181c",
                color: "#fff",
                border: "1.5px solid #222b3a",
                fontWeight: 500,
                fontSize: "12px",

                mr: 1,
                boxShadow: "0 0 8px #222b3a55",
                "&:hover": { background: "#23232a" }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveUsername}
              sx={{
                background: "linear-gradient(90deg, #53e0ff 0%, #a259ff 100%)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "12px",
                boxShadow: "0 0 10px #53e0ff99",
                "&:hover": { background: "linear-gradient(90deg, #a259ff 0%, #53e0ff 100%)" }
              }}
              variant="contained"
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Withdraw Dialog */}
        {/* <Dialog
          open={withdraw}
          onClose={(event, reason) => {
            if (reason === "backdropClick") return;
            setWithdraw(false);
            resetWithdrawStates();
            setDialogView("withdraw");
          }}
          disableEscapeKeyDown
          fullWidth
          maxWidth="xs"
          sx={{
            "& .MuiDialog-paper": {
              background: "linear-gradient(145deg, #0a0f1c 0%, #1a1f2e 100%)",
              border: "2px solid #00b7ffff",
              boxShadow:
                "0 0 30px 8px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)",
              borderRadius: "20px",
              minWidth: 350,
              maxWidth: 420,
              p: 0,
              overflow: "visible",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                background: "linear-gradient(45deg, #00ffff, #0099cc, #00ffff)",
                borderRadius: "22px",
                zIndex: -1,
                opacity: 0.7,
              },
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 3,
              pt: 3,
              pb: 2,
              background:
                "linear-gradient(90deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 153, 204, 0.1) 100%)",
              borderRadius: "20px 20px 0 0",
            }}
          >
            <Typography
              sx={{
                color: "#00ffff",
                fontWeight: 700,
                fontSize: 22,
                flex: 1,
                textAlign: "center",
                // textShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
                letterSpacing: "1px",
              }}
            >
              Withdraw Funds
            </Typography>
            <IconButton
              onClick={() => {
                setWithdraw(false);
                resetWithdrawStates();
                setDialogView("withdraw");
              }}
              sx={{
                color: "#00ffff",
                position: "absolute",
                right: 12,
                top: 12,
                background: "rgba(0, 255, 255, 0.1)",
                border: "1px solid rgba(0, 255, 255, 0.3)",
                width: 32,
                height: 32,
                "&:hover": {
                  background: "rgba(0, 255, 255, 0.2)",
                  boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <DialogContent sx={{ px: 3, pt: 1, pb: 0 }}>
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  color: "#00ffff",
                  fontWeight: 600,
                  mb: 1,
                  fontSize: 16,
                  // textShadow: "0 0 8px rgba(0, 255, 255, 0.6)",
                }}
              >
                Network
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  displayEmpty
                  sx={{
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "2px solid #00ffff",
                    boxShadow:
                      "0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.05)",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: 16,
                    height: 56,
                    "& .MuiSelect-icon": {
                      color: "#00ffff",
                      fontSize: 28,
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                      "&:hover": {
                      boxShadow: "0 0 20px #00ffff",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 0 25px #00ffff",
                    },
                    "& .MuiSelect-select": {
                      color: network ? "#00ffff" : "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(15px)",
                        border: "1px solid #00ffff",
                        boxShadow:  "0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.05)",
                        borderRadius: "8px",
                        mt: 1,
                        "& .MuiMenuItem-root": {
                          color: "#00ffff",
                          fontSize: 16,
                          fontWeight: 500,
                          "&:hover": {
                            background: "rgba(0, 255, 255, 0.2)",
                          },
                          "&.Mui-selected": {
                            background: "rgba(0, 255, 255, 0.3)",
                            "&:hover": {
                              background: "rgba(0, 255, 255, 0.4)",
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <Typography sx={{fontStyle: "italic", color: "#00ffff" }}>
                      Select Network
                    </Typography>
                  </MenuItem>
                  <MenuItem value="TON" sx={{ 
                    color: "#00ffff !important",
                    "&:hover": {
                      background: "rgba(0, 255, 255, 0.2)",
                      color: "#00ffff !important"
                    },
                    "&.Mui-selected": {
                      background: "rgba(0, 255, 255, 0.3)",
                      color: "#00ffff !important",
                      "&:hover": {
                        background: "rgba(0, 255, 255, 0.4)",
                        color: "#00ffff !important"
                      },
                    },
                  }}>SOL</MenuItem>

                </Select>
              </FormControl>
            </Box>

            <Box sx={{ marginBottom: "20px" }}>
              <Typography
                sx={{
                  color: "#00ff88",
                  fontWeight: 600,
                  mb: 1,
                  fontSize: 16,
                  // textShadow: "0 0 8px rgba(0, 255, 136, 0.6)",
                }}
              >
                Amount
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={withdrawAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value) || value === "") {
                    setWithdrawAmount(value);
                  }
                }}
                inputProps={{
                  inputMode: "decimal",
                  pattern: "[0-9]*\\.?[0-9]*",
                  style: { fontSize: "16px" },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    background:
                      "linear-gradient(145deg, #0f1419 0%, #1a1f2e 100%)",
                    border: "2px solid #00ff88",
                    boxShadow:
                      "0 0 15px rgba(0, 255, 136, 0.4), inset 0 0 10px rgba(0, 255, 136, 0.1)",
                    borderRadius: "12px",
                    height: 56,
                    fontSize: 16,
                    color: "#ffffff",
                    fontWeight: 600,
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover": {
                      boxShadow: "0 0 20px rgba(0, 255, 136, 0.6)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 0 25px rgba(0, 255, 136, 0.8)",
                    },
                  },
                  "& .MuiInputBase-input": {
                    padding: "12px 14px",
                    color: "#ffffff",
                    fontWeight: 600,
                    "&::placeholder": {
                      color: "rgba(255, 255, 255, 0.5)",
                      opacity: 1,
                    },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography
                        sx={{
                          color: "#00ffff",
                          fontSize: "14px",
                          fontWeight: 600,
                          background: "rgba(0, 255, 255, 0.1)",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          border: "1px solid rgba(0, 255, 255, 0.3)",
                        }}
                      >
                        ≈
                        {ticketQuantity && withdrawAmount
                          ? (
                            (usdtAmount * parseFloat(withdrawAmount)) /
                            ticketQuantity
                          ).toFixed(4)
                          : "0.0000"}{" "}
                        USDT
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  color: "#ffaa44",
                  fontWeight: 600,
                  mb: 1,
                  fontSize: 16,
                  // textShadow: "0 0 8px rgba(255, 170, 68, 0.6)",
                }}
              >
                Wallet Address
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    background:
                      "linear-gradient(145deg, #0f1419 0%, #1a1f2e 100%)",
                    border: "2px solid #ffaa44",
                    boxShadow:
                      "0 0 15px rgba(255, 170, 68, 0.4), inset 0 0 10px rgba(255, 170, 68, 0.1)",
                    borderRadius: "12px",
                    height: 56,
                    fontSize: 16,
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover": {
                      boxShadow: "0 0 20px rgba(255, 170, 68, 0.6)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 0 25px rgba(255, 170, 68, 0.8)",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "#ffffff",
                    fontWeight: 600,
                    "&::placeholder": {
                      color: "rgba(255, 255, 255, 0.5)",
                      opacity: 1,
                    },
                  },
                }}
                InputProps={{ style: { fontSize: 16 } }}
              />
            </Box>

            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "8px",
                  textShadow: "0 0 8px rgba(255, 255, 255, 0.5)",
                }}
              >
                Platform charge 25%
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#00ffff",
                  fontSize: "14px",
                  fontWeight: 600,
                  display: "block",
                  textShadow: "0 0 8px rgba(0, 255, 255, 0.6)",
                }}
              >
                Min:{" "}
                {minWithdrawal !== null ? `${minWithdrawal}` : "Loading..."}{" "}
                Max:{" "}
                {maxWithdrawal !== null ? `${maxWithdrawal}` : "Loading..."}
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              pb: 3,
              pt: 1,
              justifyContent: "space-between",
              background:
                "linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0%, rgba(26, 31, 46, 0.3) 100%)",
            }}
          >
            <Button
              onClick={() => {
                setWithdraw(false);
                resetWithdrawStates();
                setDialogView("withdraw");
              }}
              sx={{
                color: "#fff",
                background: "#181828",
                border: "1.5px solid #222b3a",
                boxShadow: "0 0 8px #00ffff33",
                borderRadius: "8px",
                px: 3,
                fontWeight: 600,
                "&:hover": { background: "#222b3a" },
              }}
            >
              Close
            </Button>
            <Button
              onClick={handleWithdraw}
              sx={{
                color: "#fff",
                background: "linear-gradient(90deg, #00b4f5 0%, #d47fff 100%)",
                boxShadow: "0 0 16px #00b4f5cc",
                borderRadius: "8px",
                px: 3,
                fontWeight: 600,
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #00b4f5 0%, #d47fff 100%)",
                  opacity: 0.9,
                },
              }}
            >
              Withdraw
            </Button>
          </DialogActions>
        </Dialog> */}

      </Box>

    </Box>

  );
};

const styles = {
  loadingContainer: {
    display: "flex",
    background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bg1}) no-repeat center center`,
    // backgroundColor: '#000000',
    backdropFilter: "blur(12px)",
    alignItems: "center",
    minHeight: "100vh",
    width: "100vw",
    overflow: "auto",
    padding: { xs: "20px 10px", md: "40px 20px" },
    boxSizing: "border-box",
    position: "fixed",
    top: 0,
    left: 0,
    flexDirection: "column",
    justifyContent: "center",
  },
  errorContainer: {
    background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bg1}) no-repeat center center`,
    // backgroundColor: '#000000',
    height: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    color: "white",
  },
  mainContainer: {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bg1}) no-repeat center center`,
    // backgroundColor: '#000000',
    backgroundAttachment: "fixed",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    color: "#fff",
    padding: { xs: "20px 10px", md: "40px 20px" },
    boxSizing: "border-box",
    overflowY: "auto",
    paddingBottom: "100px", // Add padding at the bottom for footer
  },
  profileHeader: {
    mb: 3,
    marginTop: { xs: "60px", md: "80px" },
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    gap: 1,
  },
  avatar: {
    width: 65,
    height: 65,
  },
  username: {
    color: "#58E9F8",
    // fontWeight: "400",
    fontSize: "1.25rem",
    textAlign: "center",
    fontFamily: "Drag Racing",

  },
  sectionTitle: {
    fontWeight: "400",
    marginBottom: { xs: "20px", md: "30px" },
    fontSize: "1.30rem",
    fontFamily: "Inter",
    textAlign: "center",
    mb: 2,
  },
  statsContainer: {
    width: "94%",
    height: "200px",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    margin: "0 auto",
  },
  statCard: {
    width: { xs: "94%", sm: "365px" },
    height: "73px",
    backgroundColor: "#031A27",
    padding: "10px",
    color: "#CFDADF",
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
    borderRadius: "10px 3px 10px 3px",
    border: "2px solid #074258",
  },
  statText: {
    fontSize: { xs: "1rem", sm: "1.25rem" },
    fontFamily: "Inter",
    fontWeight: "600",
    marginLeft: "10px",
  },
  statValue: {
    fontSize: { xs: "1rem", sm: "1.25rem" },
    fontFamily: "Inter",
    fontWeight: "600",
    display: 'flex',
    alignItems: 'center',
  },
  walletTitle: {
    width: { xs: "100%", sm: "143px" },
    height: "42px",
    fontSize: "1.30rem",
    fontFamily: "Inter",
    fontWeight: "600",
    display: "flex",
    justifyContent: "center",
  },
  coinIcon: {
    width: "20px",
    height: "20px",
    display: 'flex',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: "#03415D",
    fontWeight: "600",
    fontSize: { xs: "1rem", sm: "1.30rem" },
    color: "white",
    margin: "10px",
    border: "4px solid #29A4BF",
    "&:hover": {
      backgroundColor: "#1976d2",
    },
    width: { xs: "95%", sm: "365px" },
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: { xs: "row", sm: "row" },
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
  },
  depositButton: {
    backgroundColor: "#03415D",
    fontWeight: "600",
    fontSize: { xs: "1rem", sm: "1.30rem" },
    color: "white",
    margin: "10px",
    border: "4px solid #29A4BF",
    "&:hover": {
      backgroundColor: "#1976d2",
    },
    width: { xs: "100%", sm: "45%" },
  },
  withdrawButton: {
    backgroundColor: "#03415D",
    fontWeight: "600",
    fontSize: { xs: "1rem", sm: "1.30rem" },
    color: "white",
    margin: "10px",
    border: "4px solid #29A4BF",
    "&:hover": {
      backgroundColor: "#1976d2",
    },
    width: { xs: "95%", sm: "365px" },
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default ProfilePage;
