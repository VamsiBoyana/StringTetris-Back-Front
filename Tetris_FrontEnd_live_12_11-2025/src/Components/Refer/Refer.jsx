import React, { useState, useEffect, useContext, useRef } from "react";
import ReactGA from 'react-ga';
import { MyContext } from "../../context/Mycontext";
import { Box, Typography, Button, Avatar, Grid } from "@mui/material";
import { Group, ContentCopy } from "@mui/icons-material"; 
import axios from "axios"; // Added axios import which was missing
import { UserProfile, GetReferralReward, BOTNAME, encryptSecretKey, GetReferralHistory } from "../../ApiConfig";
import bgimage from "../../assets/bg.jpg";
// import { ToastContainer, toast } from "react-toastify";
// import { Toaster } from "react-hot-toast";
import toast, { Toaster } from "react-hot-toast";
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import SquareLoader from "../SquareLoader/SquareLoader";

export default function InvitePage() {
  const [referralLink, setReferralLink] = useState("");
  const [referralReward, setReferralReward] = useState([]);
  const [error, setError] = useState("");
  const [totalBonus, setTotalBonus] = useState(0);
  const [totalUsdt, setTotalUsdt] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const { data } = useContext(MyContext);
  const userId = localStorage.getItem("userId");
  
  // Add necessary state variables for telegram sharing
  // const [botname] = useState("your_bot_name"); // Replace with your actual bot name
  // const [chatId] = useState(userId);

  // google analytics
  useEffect(() => {
    // Initialize Google Analytics
    ReactGA.initialize('G-K9GJH23MN3');

    // Track page view
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);


  const [referralNote] = useState("Join me in this exciting game!"); // Customize your referral message
  const [referralTicketBalance, setReferralTicketBalance] = useState(""); // Default ticket balance
  const chatId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

  const onReward = () => {
    // Add any reward logic specific to Refer.jsx here
  };

  const onError = (error) => {
    console.error("Ad error in Refer.jsx:", error);
    // Add any error handling logic specific to Refer.jsx here
  };


  // Fetch referral history data
  useEffect(() => {
    const fetchReferralHistory = async () => {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `${GetReferralHistory}/${userId}?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("upToken")}`,
              clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
              WebApp: window.Telegram.WebApp.initData,
            },
          }
        );


        setTotalBonus(response.data.totalreferralMoney || 0);
        setTotalUsdt(response.data.totalreferralMoneyInUsdt);
        setTotalReferrals(response.data.totalReferralsCount)
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load referral history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReferralHistory();
  }, [page, limit]);

  // Fetch referral link from API
  useEffect(() => {
    const fetchReferralLink = async () => {
      setLoading(true);
      try {

        const userId = localStorage.getItem("userId");
        const response = await axios.get(`${UserProfile}/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("upToken")}`,
            clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
            WebApp: window.Telegram.WebApp.initData,
          },
        });
        
        if (response.status === 200) {
          setReferralLink(response.data.user.referralLink);
        }
      } catch (error) {
        console.error("Error fetching referral link:", error);
      }
      finally {
        setLoading(false)
      }
    };

    const fetchReferralReward = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem("userId");
        const referralresponse = await axios.get(
          `${GetReferralReward}/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("upToken")}`,
              clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
              WebApp: window.Telegram.WebApp.initData,
            },
          }
        );

        if (referralresponse.status === 200) {

          setReferralReward(referralresponse.data.referralSettings.referralAmount);

        }
      }
      catch (error) {
        console.error("Error fetching referral Reward:", error);
      }
      finally {
        setLoading(false)
      }
    };

    fetchReferralLink();
    fetchReferralReward();
  }, [userId]);



  // Generate Invite Link for Telegram sharing
  const generateInviteLink = () => {
    // return `https://t.me/share/url?url=${referralLink}`;
    return `https://t.me/share/url?url=https://t.me/${BOTNAME}/play?startapp=${chatId}`;
  };

  // Handle copy function for copying the referral link
  // const handleCopy = () => {
  //   navigator.clipboard
  //     .writeText(`https://t.me/${BOTNAME}/play?startapp=${chatId}`)
  //     .then(() => {
  //       toast.success("Link copied!");
  //     })
  //     .catch((err) => {
  //       console.error("Failed to copy:", err);
  //       toast.error("Failed to copy link");
  //     });
  // };
  const handleCopy = () => {
    const textToCopy = `https://t.me/${BOTNAME}/play?startapp=${chatId}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          toast.success("Link copied!");
        })
        .catch((err) => {
          // Fallback to execCommand
          fallbackCopyTextToClipboard(textToCopy);
        });
    } else {
      // Fallback to execCommand
      fallbackCopyTextToClipboard(textToCopy);
    }
  };
  
  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // Avoid scrolling to bottom
    textArea.style.position = "fixed";
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = 0;
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast.success("Link copied!");
      } else {
        toast.error("Failed to copy link");
      }
    } catch (err) {
      toast.error("Failed to copy link");
    }
  
    document.body.removeChild(textArea);
  }

  // Function to handle sharing via Telegram
  const handleShare = () => {
    const inviteLink = generateInviteLink();
    window.open(inviteLink, "_blank");
  };

 

  const spotId = 6052371;
  const showAdFunctions = useRef({});

  useEffect(() => {
    // Initialize show function for the hardcoded spotId
    const initializeShowFunction = async () => {
      try {
        const show = await window.initCdTma?.({ id: spotId.toString() }); // Initialize using the hardcoded spotId
        if (show) {
          showAdFunctions.current[spotId] = show; // Store the show function
        } else {
          console.warn(`❌ No show function returned for AdSDK ${spotId}`);
        }
      } catch (error) {
        console.error(`❌ Error initializing ad with AdSDK ${spotId}:`, error);
      }
    };

    initializeShowFunction();
  }, [spotId]); // Dependency array to run effect once


  const handleShowAd = async () => {
    const showAd = showAdFunctions.current[spotId];
    if (showAd) {
      try {
        await showAd(); // Trigger the ad show for the hardcoded spotId
      } catch (error) {
        console.error(`Error triggering ad for Spot ID ${spotId}:`, error);
      }
    } else {
      console.warn(`❌ No show function found for Spot ID ${spotId}`);
    }
  };


  const Adhandler = () => {
    try {
      AdController.show()
    } catch (error) {
      console.error("Error in Adhandler:", error);
    }

    // No actual ad logic here while debugging
  };

  // Dummy function for videoAd button if showAd1 is commented out
  const VideoAdhandler = () => {
    // No actual ad logic here while debugging
  };

  // Calculate referral points and USDT value (replace with your logic if needed)
  const referralPoints = 9000; // Example value, replace with your dynamic value
  const referralUSDT = 0.09; // Example value, replace with your dynamic value
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

  return (
    <Box
      sx={{
        position: "relative",
        top: 0,
        left: 0,
        width: "100%",
        maxWidth: "100vw",
        minHeight: "100vh",
        paddingBottom: "100px",
        background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bgimage}) no-repeat center center`,
        backgroundSize: "cover",
        color: "#fff",
        padding: { xs: "20px 5px", md: "40px 20px" },
        boxSizing: "border-box",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {loading && (
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
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 1000,
          }}
        >
          {[...Array(3)].map((_, i) => (
            <Box
              key={i}
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: "#41B3C8",
                animation: "bounce 1.4s infinite ease-in-out",
                animationDelay: `${i * 0.16}s`,
                "@keyframes bounce": {
                  "0%, 100%": {
                    transform: "translateY(0)",
                  },
                  "50%": {
                    transform: "translateY(-20px)",
                  },
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* Referral Rewards Card */}
      <Box
        sx={{
          width: "90%",
          mx: "auto",
          background: "rgba(10,10,15,0.98)",
          borderRadius: 3,
          border: "1.5px solidrgb(7, 44, 60)",
          boxShadow: "0 0 16px #00ff6a33",
          animation: 'parallax-slide-right 0.5s ease-out forwards',
          p: { xs: 2, md: 4 },
          mb: 1,
          mt: 7,
          // textAlign: "center",
        }}
      >
        <Box sx={{ display: 'flex', mb: 2 }}>
          <CardGiftcardIcon sx={{ color: '#00ff6a', mr: 1, fontSize: 15 }} />
          <Typography sx={{ color: '#00ff6a', fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>
            Your Referral Rewards
          </Typography>
        </Box>
        <Typography
          sx={{
            color: "#53e0ff",
            fontWeight: 600,
            fontSize: 22,
            textShadow: "0 0 16px #53e0ff, 0 0 32px #53e0ff55",
            justifyContent: "center",
            // marginLeft: "38%",
            textAlign: "center",
            alignItems: "center",
            mb: 0.5,
          }}
        >
          {totalBonus.toLocaleString()}
        </Typography>
        <Typography sx={{
          color: '#b0b0b0',
          fontSize: 12,
          // marginLeft: "31%",
          textAlign: "center",
          mb: 1
        }}>
          Total Points Earned
        </Typography>
        <Typography sx={{
          color: '#00ff6a',
          // marginLeft: "33%",
          textAlign: "center",
          fontSize: 12, fontWeight: 700
        }}>
          ≈ {totalUsdt} USDT
        </Typography>
      </Box>

      <Box
        sx={{
          width: "90%",
          mx: "auto",
          background: "rgba(10,10,15,0.98)",
          borderRadius: 3,
          // border: "1.5px solid #53e0ff",
          boxShadow: "0 0 16px #53e0ff33",
          justifyContent: "space-between",
          animation: 'parallax-slide-left 0.5s ease-out forwards',
          p: { xs: 2, md: 4 },
          mb: 1,
          // textAlign: "center",
        }}
      >
        <Typography
          sx={{
            color: "#d47fff",
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: 1,
            mb: 2,
          }}
        >
          Your Referral Link
        </Typography>
        <Box sx={{ mb: 2 }}>
          <input
            value={referralLink}
            readOnly
            style={{
              width: "100%",
              maxWidth: "100%",
              background: "transparent",
              border: "1.5px solid #53e0ff",
              display: "flex",
              borderRadius: 6,
              color: "#fff",
              fontSize: 12,
              padding: "8px 12px ",
              outline: "none",
              marginRight: 12,
              boxShadow: "0 0 8px #53e0ff55",
              boxSizing: "border-box",
            }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 1,
              fontWeight: 700,
              fontSize: "10px",
              marginTop: "18px"
            }}
          >
            <Button
              onClick={handleCopy}
              sx={{
                background: "linear-gradient(90deg, #53e0ff 0%, #a259ff 100%)",
                color: "#fff",
                fontWeight: 700,
                flex: 1,
                fontSize: "10px",
                boxShadow: "0 0 12px #53e0ff99",
                "&:hover": { background: "linear-gradient(90deg, #a259ff 0%, #53e0ff 100%)" }
              }}
              startIcon={<ContentCopy />}
            >
              Copy
            </Button>
            <Button
              onClick={handleShare}
              sx={{
                background: "linear-gradient(90deg, #a259ff 0%, #53e0ff 100%)",
                color: "#fff",
                fontWeight: 700,
                flex: 1,
                fontSize: "10px",
                boxShadow: "0 0 12px #a259ff99",
                "&:hover": { background: "linear-gradient(90deg, #53e0ff 0%, #a259ff 100%)" }
              }}
              startIcon={<span style={{ fontSize: 15 }}>🔗</span>}
            >
              Share
            </Button>
          </Box>

        </Box>
        <Typography sx={{ color: "#ffb347", marginLeft: "10px", fontWeight: 700, fontSize: 12, wordWrap: "break-word" }}>
          Your Referral Code : <span style={{ color: "#53e0ff", marginLeft: "10px", fontWeight: 900, fontSize: 14, letterSpacing: 1, mt: 1, textShadow: "0 0 8px #53e0ff" }}>{chatId}</span>
        </Typography>

      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "row", md: "row" },
          justifyContent: "center",
          alignItems: "stretch",
          gap: 1,
          width: "90%",
          maxWidth: "100%",
          mx: "auto",
          mb: 5,
        }}
      >
        {/* Card 1 */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            background: "rgba(10,10,15,0.98)",
            borderRadius: 3,
            border: "1.5px solid #222b3a",
            boxShadow: "0 0 12px #53e0ff22",
            p: 1,
            textAlign: "center",
            animation: 'parallax-slide-right 0.5s ease-out forwards',
          }}
        >
          <CardGiftcardIcon sx={{ color: "#ffb347", fontSize: 20, mb: 1 }} />
          <Typography sx={{ color: "#00bfff", fontWeight: 700, fontSize: 12 }}>
            Instant Rewards
          </Typography>
          <Typography sx={{ color: "#b0b0b0", fontSize: 12, mt: 1, wordWrap: "break-word" }}>
            Receive {referralReward} points for each referral
          </Typography>
        </Box>
        {/* Card 2 */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            background: "rgba(10,10,15,0.98)",
            borderRadius: 3,
            border: "1.5px solid #222b3a",
            boxShadow: "0 0 12px #53e0ff22",
            p: 1,
            textAlign: "center",
            animation: 'parallax-slide-left 0.5s ease-out forwards',
          }}
        >
          <WhatshotIcon sx={{ color: "#ff9800", fontSize: 20, mb: 1 }} />
          <Typography sx={{ color: "#00bfff", fontWeight: 700, fontSize: 12 }}>
            No Limits
          </Typography>
          <Typography sx={{ color: "#b0b0b0", fontSize: 12, mt: 1, wordWrap: "break-word" }}>
            Refer unlimited friends<br />and family
          </Typography>
        </Box>
        {/* Card 3 */}
        {/* <Box
    sx={{
      flex: 1,
      background: "rgba(10,10,15,0.98)",
      borderRadius: 3,
      border: "1.5px solid #222b3a",
      boxShadow: "0 0 12px #53e0ff22",
      p: 3,
      textAlign: "center",
      minWidth: 220,
    }}
  >
    <FlashOnIcon sx={{ color: "#ffe600", fontSize: 38, mb: 1 }} />
    <Typography sx={{ color: "#00bfff", fontWeight: 700, fontSize: 18 }}>
      Fast Payouts
    </Typography>
    <Typography sx={{ color: "#b0b0b0", fontSize: 15, mt: 1 }}>
      Rewards credited<br />immediately
    </Typography>
  </Box> */}
      </Box>
      {/* <Box
        sx={{
          display: "flex",
          alignItems: "center",
          margin: "10px",
          padding: "10px",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontFamily: "Inter",
            fontSize: "17px",
            color: "white",
            fontWeight: "600",
          }}
        >
          REFERRAL REWARDS {activeReferralAmount}
        </Typography>
        <img
          src={coin}
          alt="coin"
          style={{
            marginLeft: "15px",
            height: "25px",
            width: "25px",
          }}
        />
        
      </Box> */}

      {/* <Button
          onClick={Adhandler}
          variant="contained"
          sx={{
            backgroundColor: "#03415D",
            fontWeight: "600",
            fontSize: "1rem",
            color: "white",
            margin: "10px",
            border: "4px solid #29A4BF",
            "&:hover": {
              backgroundColor: "#1976d2",
            },
            width: "45%", // Adjust width as needed
          }}
          >
          BannerAd
        </Button> */}

      {/* <Button 
        onClick={Adhandler}
          variant="contained"
          sx={{
            backgroundColor: "#03415D",
            fontWeight: "600",
            fontSize: "1rem",
            color: "white",
            margin: "10px",
            border: "4px solid #29A4BF",
            "&:hover": {
              backgroundColor: "#1976d2",
            },
            width: "45%", // Adjust width as needed
          }}
      >
          Adhandler
        </Button> */}
    </Box>
  );
}
