import React, { useState, useEffect, useCallback, useContext } from "react";
import ReactGA from 'react-ga';
import { useNavigate } from "react-router-dom";
import { MyContext } from "../../context/Mycontext";
import {
  Box,
  Typography,
  Grid,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  CardContent,
} from "@mui/material";
// import { ToastContainer, toast } from "react-toastify";
import toast, { Toaster } from "react-hot-toast";
import banner from "../../assets/banner.jpg";
import bgimage from "../../assets/bg.jpg";

import { DailyReward, UserLogin, GetDailyReward, encryptSecretKey, GetClaimHistory,GetDashBoardUser } from "../../ApiConfig";
import axios from "axios";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import coin from "../../assets/coin.png";
import bg1 from "../../assets/bg.jpg";
import GiftIcon from '@mui/icons-material/CardGiftcard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SquareLoader from "../SquareLoader/SquareLoader";



function Games() {

  const navigate = useNavigate();

  // Auth state
  const [isLoginLoading, setIsLoginLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [loading, setLoading] = useState(true);
  // Reward state
  const [open, setOpen] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [activeRewardPoints, setActiveRewardPoints] = useState(0);
  const { data, setData } = useContext(MyContext);
  const [reward, setReward] = useState("");
  const [claimed, setClaimed] = useState(false);
  const [dashBoardUser, setDashBoardUser] = useState({});
  const handleCheckIn = () => {
    // Your logic to claim the reward
    setClaimed(true);
    // Optionally close the dialog or show a toast
  };

  //google analytics
  useEffect(() => {
    // Initialize Google Analytics
    ReactGA.initialize('G-K9GJH23MN3');

    // Track page view
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);


  const games = [{ id: 1, title: "Tetris", players: "1M+ players" }];

  const url = window.location.href;
  const urlObj = new URL(url);


  // Get Telegram user info
  // const first_name = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name;
  // const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  // const photo_url = window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url;
  const referalId = urlObj.searchParams.get("tgWebAppStartParam");



  // Uncomment for testing
  // const first_name = "Thirupathi";
  // const id = 8098953494;
  // const photo_url =
  //   "https://t.me/i/userpic/320/iz6lI6dEqbVuiGYhAu0L_-K3a0th5f5WsCOeHD4UsUg.svg";
  // const referalId = 557110797

  // Add global error handlers
  useEffect(() => {
    const handleError = (event) => {
      console.error("Window Error:", event.error);
    };

    const handleUnhandledRejection = (event) => {
      console.error("Unhandled Promise Rejection:", event.reason);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  useEffect(() => {
    setLoading(false);
    const inputs = document.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        setTimeout(() => {
          input.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300); // Delay slightly to wait for keyboard
      });
    });
  }, []);


  const userId = localStorage.getItem("userId");
  useEffect(() => {
    const fetchGetDailyReward = async () => {
      if (!localStorage.getItem("upToken")) {
        return;
      }
      setLoading(false);
      try {
        const response = await axios.get(`${GetDailyReward}/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("upToken")}`,
            clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
            WebApp: window.Telegram.WebApp.initData,
          },
        });
        setReward(response.data.data.points); // Ensure you're setting the correct part of the response
      } catch (error) {
        console.error("Error in Get Daily Reward:", error.message);
      }
      finally {
        setLoading(false);
      }
    };

const fetchDashBoardUser = async () => {
  if (!localStorage.getItem("upToken")) {
    return;
  }

  const response = await axios.get(`${GetDashBoardUser}/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("upToken")}`,
      clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
      WebApp: window.Telegram.WebApp.initData,
    },
  });
  
  setDashBoardUser(response.data); // Ensure you're setting the correct part of the response
};


    if (userId) {
      fetchGetDailyReward();
      fetchDashBoardUser();
    }
  }, [userId]);
 
  // Handle login

  const handleLogin = useCallback(async () => {
    setLoading(true);
    try {
      
      // 2. Build your payload
      const payload = {
        referalId: referalId,
      };
      const response = await axios.post(
        UserLogin,
        payload,
        {
          headers: {
            // you can name this whatever you like; 'x-init-data' is pretty standard
            WebApp: window.Telegram.WebApp.initData,
            // WebApp: `query_id=AAEWObxiAwAAABY5vGI0QVG8&user=%7B%22id%22%3A8098953494%2C%22first_name%22%3A%22Thirupathi%22%2C%22last_name%22%3A%22%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F3aG0-Jn3G0xJ1jc0V2rH06jnPBmAXhv1P_2o67wpI0e8RDVPEWeQ9aSaq4gQlaVW.svg%22%7D&auth_date=1762752976&signature=d-EAU2v1fL7uYMprxXqdhrSGNfp9dFJXNKMMSaKfxGbwgHyd3WJP6eZxQkH9Kl701vuL_WMp-SPnPjoBuE89CQ&hash=f1fabbd7e4624061fab5b0c9e973b5cff15b9a79df3a74a3260c84b4154c047c`,
            clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
          },
        }
      );
 
      if (response.status === 200) {
        const receivedToken = response.data.token;
        setData(receivedToken)
        localStorage.setItem("upToken", receivedToken);
        localStorage.setItem("userId", response.data.user.id);

        // Store initial balance
        const initialBalance = response.data.user.points || 0;
        // localStorage.setItem("userBalance", initialBalance.toString());

        // Create and dispatch login success event with balance
        const loginEvent = new CustomEvent("userLoggedIn", {
          detail: {
            points: initialBalance,
            totalPoints: initialBalance,
          },
        });

        // Dispatch events to ensure instant update
        window.dispatchEvent(loginEvent);

        // Force a re-render by dispatching a storage event
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "userBalance",
            newValue: initialBalance.toString(),
            oldValue: "0",
            storageArea: localStorage,
          })
        );

        // Additional event dispatch after a small delay
        setTimeout(() => {
          window.dispatchEvent(loginEvent);
        }, 5);

        setIsAuthenticated(true);
        setIsLoginLoading(false);
        // toast.success("Login successful!");
      } else {
        console.error("Unexpected login status:", response.status);
        toast.error("Unexpected login response");
        setIsLoginLoading(false);
      }
    } catch (error) {
      localStorage.clear();
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Login failed. Please try again.");
      localStorage.clear();
      setIsLoginLoading(false);
    }
    finally {
      setLoading(false);
    }
  }, [
    referalId
  ]);


  useEffect(() => {
    const fetchLastClaimed = async () => {
      if (!userId) {
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(`${GetClaimHistory}/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("upToken")}`,
            clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
            WebApp: window.Telegram.WebApp.initData,
          },
        });
        setShowCheckIn(response.data.claimedToday)
        // setReward(response.data.data.points); // Ensure you're setting the correct part of the response
      } catch (error) {
        console.log("Error in Get Daily Reward:", error.message); // Log the error message for better debugging
      } finally {
        setLoading(false);
      }
    };


    fetchLastClaimed();

  }, [userId])




  // Check authentication on mount
  useEffect(() => {
    const storedToken = data;
    // const storedToken = localStorage.getItem("upToken");
    if (storedToken) {
      setIsAuthenticated(true);
      setIsLoginLoading(false);
    } else {
      handleLogin();
    }
  }, [handleLogin]);

  // Navigation
  const handlePlayNow = () => {
    if (!isAuthenticated) {
      toast.error("Please wait while logging in...");
      return;
    }
    navigate("/gameinfo");
  };

  // Daily reward handlers
  const handleDailyRewardClick = () => {
    if (!isAuthenticated) {
      toast.error("Please wait while logging in...");
      return;
    }
    setOpen(true);
  };


  const handleClaimReward = async () => {
    if (!localStorage.getItem("upToken")) {
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please wait while logging in...");
      return;
    }
    if (rewardClaimed) {
      toast.info("You already claimed today's reward!");
      return;
    }
    try {
      const userId = localStorage.getItem("userId");

      const token = data.token;

      const response = await axios.post(`${DailyReward}/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${data}`,
            clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
            WebApp: window.Telegram.WebApp.initData,
          }
        }
      );

      if (response.data) {
        const pointsEarned = response.data.points || 0;
        setActiveRewardPoints(pointsEarned);
        toast.success("Reward claimed successfully!");
        setRewardClaimed(true);
        setShowCheckIn(false)

        // Get the current balance from the API response or localStorage
        const currentBalance =
          response.data.totalPoints ||
          parseInt(localStorage.getItem("userBalance") || "0");
        const newBalance = currentBalance + pointsEarned;

        // Update localStorage with the new balance
        // localStorage.setItem("userBalance", newBalance.toString());

        // Create and dispatch the points update event
        const pointsUpdateEvent = new CustomEvent("pointsUpdated", {
          detail: {
            points: newBalance,
            totalPoints: newBalance,
          },
        });

        // Dispatch the event multiple times to ensure it's caught
        window.dispatchEvent(pointsUpdateEvent);

        // Force a re-render by dispatching a storage event
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "userBalance",
            newValue: newBalance.toString(),
            oldValue: currentBalance.toString(),
            storageArea: localStorage,
          })
        );

        // Additional event dispatch after a small delay
        setTimeout(() => {
          window.dispatchEvent(pointsUpdateEvent);
        }, 5);
      }
      setOpen(false);
    } catch (error) {
      console.error("Reward claim error:", error.response || error);
      const msg = error.response?.data?.message || "Failed to claim reward";
      toast.error("Already claimed");
      setOpen(false);
    }
  };



  const handleDialogClose = () => setOpen(false);

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
  // Main UI
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        backgroundImage: `url(${bg1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backdropFilter: "blur(12px)",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100vw",
        overflowY: "auto",
        overflowX: "hidden",
        padding: { xs: "20px 5px", md: "40px 20px" },
        boxSizing: "border-box",
        top: 0,
        left: 0,
        gap: "20px",
      }}
    >
      {/* Add this overlay as the first child */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.79)", // adjust opacity as needed
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      {/* Neon Glass Card Section */}
      <Box
        sx={{
          maxWidth: 600,
          mx: "auto",
          mt: { xs: 7, md: 7 },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          zIndex: 2,
        }}
      >
        <Card
          sx={{
            width: "90%",
            height: "50%",
            borderRadius: 4,
            background: "rgba(20, 20, 40, 0.7)",
            backdropFilter: "blur(8px)",
            border: "2px solid rgba(88, 233, 248, 0.25)",
            overflow: "hidden",
            animation: "parallax-slide-up 1s cubic-bezier(.4,2,.6,1) both",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 6 } }}>
            <Box sx={{ textAlign: "center" }}>
              <Box
                component="img"
                src={banner}
                alt="Tetris Game"
                sx={{
                  width: "100%",
                  height: 100, // 192
                  objectFit: "cover",
                  borderRadius: 3,
                  mb: 1,
                  boxShadow: "0 0 24px #1faeff55",
                }}
              />
              {/* <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                  color: "#af73ff",
                  textShadow: "0 0 8px #af73ff, 0 0 16px #1faeff",
                  fontFamily: "Drag Racing, TechnoRaceItalic, sans-serif",
                }}
              >
                Cyberpunk Tetris
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  color: "#b0b0c3",
                  fontSize: "1.1rem",
                  fontFamily: "TechnoRaceItalic, sans-serif",
                }}
              >
                Stack blocks in the neon-lit cyberspace and earn rewards!
              </Typography> */}
              <Button
                onClick={handlePlayNow}
                sx={{
                  background:
                    "linear-gradient(90deg, #1faeff 0%, #af73ff 100%)",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "14px",
                  px: 6,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: "0 0 16px #58E9F8",
                  textShadow: "0 0 8px #af73ff",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #af73ff 0%, #1faeff 100%)",
                    boxShadow: "0 0 32px #af73ff",
                    transform: "scale(1.05)",
                  },
                }}
              >
                Start Game
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          mb: 8,
          zIndex: 3,
          width: "100%",
          maxWidth: "100%",
        }}
      >
        {/* Card 1: Active Players */}
        <Card
          sx={{
            width: "90%",
            maxWidth: "100%",
            height: 80,
            background: "#111114",
            borderRadius: 3,
            boxShadow: "0 0 16px #1faeff55",
            border: "2px solid rgba(88, 233, 248, 0.25)",
            animation: "parallax-slide-left 0.5s ease-out forwards",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CardContent sx={{
            textAlign: "center",
            width: '100%',
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            '&:last-child': { pb: 0 } // Remove default padding-bottom
          }}>
            <Typography
              variant="h4"
              sx={{
                color: "#39FF14",
                fontWeight: "bold",
                fontFamily: "TechnoRaceItalic, sans-serif",
                fontSize: "20px",
                lineHeight: 1.2,
                wordWrap: "break-word"
              }}
            >
              {dashBoardUser.totalUsers}+
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#b0b0c3",
                fontSize: "14px",
                lineHeight: 1.2,
                wordWrap: "break-word"
              }}
            >
              Active Players
            </Typography>
          </CardContent>
        </Card>

        {/* Card 2: Games Played */}
        <Card
          sx={{
            width: "90%",
            maxWidth: "100%",
            height: 80,
            background: "#111114",
            borderRadius: 3,
            boxShadow: "0 0 16px #ffb34755",
            border: "2px solid rgba(88, 233, 248, 0.25)",
            animation: "parallax-slide-right 0.5s ease-out forwards",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CardContent sx={{
            textAlign: "center",
            width: '100%',
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            '&:last-child': { pb: 0 }
          }}>
            <Typography
              variant="h4"
              sx={{
                color: "#ffb347",
                fontWeight: "bold",
                fontFamily: "TechnoRaceItalic, sans-serif",
                fontSize: "20px",
                lineHeight: 1.2,
                wordWrap: "break-word"
              }}
            >
              {dashBoardUser.totalGames}+
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#b0b0c3",
                fontSize: "14px",
                lineHeight: 1.2,
                wordWrap: "break-word"
              }}
            >
              Games Played
            </Typography>
          </CardContent>
        </Card>

        {/* Card 3: USDT Rewards */}
        <Card
          sx={{
            width: "90%",
            maxWidth: "100%",
            height: 80,
            background: "#111114",
            borderRadius: 3,
            boxShadow: "0 0 16px #ff55e055",
            border: "2px solid rgba(88, 233, 248, 0.25)",
            animation: "parallax-slide-left 0.5s ease-out forwards",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CardContent sx={{
            textAlign: "center",
            width: '100%',
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            '&:last-child': { pb: 0 }
          }}>
            <Typography
              variant="h4"
              sx={{
                color: "#ff55e0",
                fontWeight: "bold",
                fontFamily: "TechnoRaceItalic, sans-serif",
                fontSize: "20px",
                lineHeight: 1.2,
                wordWrap: "break-word"
              }}
            >
              {Number(dashBoardUser.totalTransferredAmount ?? 0).toFixed(2)}K
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#b0b0c3",
                fontSize: "14px",
                lineHeight: 1.2,
                wordWrap: "break-word"
              }}
            >
              USDT Rewards
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Box
        sx={{
          bgcolor: "#09090b"
        }}
      >
        {/* Daily Check-in Modal */}
        <Dialog
          open={showCheckIn}
          onClose={() => setShowCheckIn(false)}
          PaperProps={{
            sx: {
              bgcolor: '#09090b',
              width: "90%",
              color: '#fff',
              borderRadius: 3,
              border: '1px solid #00bbff'
            }
          }}
        >

          <DialogTitle
            sx={{
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: "600",
              color: '#00bbff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <GiftIcon sx={{ width: 32, height: 32 }} />
            Daily Check-in
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', p: 6 }}>
            {!claimed ? (
              <>
                <CalendarMonthIcon sx={{ width: 64, height: 64, color: '#39FF14', mb: 2 }} />
                <Typography sx={{ fontSize: '13px', mb: 3 }}>
                  Claim your daily reward
                </Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 'bold', color: '#00bbff', mb: 3 }}>
                  +{reward} Points
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleClaimReward}
                  sx={{
                    background: 'linear-gradient(90deg, #1faeff 0%, #af73ff 100%)',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: "12px",
                    boxShadow: '0 0 10px #58E9F8',
                  }}
                >
                  Claim Reward
                </Button>
              </>
            ) : (
              <>
                <CheckCircleIcon sx={{ width: 64, height: 64, color: '#39FF14', mb: 2 }} />
                <Typography sx={{ fontSize: '1.25rem', color: '#39FF14' }}>
                  Reward Claimed Successfully!
                </Typography>
              </>
            )}
          </DialogContent>
        </Dialog>
      </Box>
      {/* Parallax animation keyframes */}
      <style>
        {`
            @keyframes parallax-slide-up {
              0% {
                opacity: 0;
                transform: translateY(60px) scale(0.98);
              }
              100% {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
          `}
      </style>
    </Box>
  );
}

export default Games;