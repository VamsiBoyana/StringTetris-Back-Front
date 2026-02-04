import * as React from "react";
import ReactGA from 'react-ga';
ReactGA.initialize('G-K9GJH23MN3');
import { MyContext } from "../../context/Mycontext";
import axios from "axios";
import { UserProfile, TicketConvertion, encryptSecretKey } from "../../ApiConfig";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useState, useEffect, useCallback, useContext } from "react";
import { useLocation } from "react-router-dom";
import coin from "../../assets/coin.png";
import Tether from "../../assets/Tether.png";

export default function ButtonAppBar() {
  const [ticketBalance, setTicketBalance] = useState(0);
  const [usdtAmount, setUsdtAmount] = useState(0);
  const [ticketQuantity, setTicketQuantity] = useState(0);
  const [defaultAdminWallet, setDefaultAdminWallet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const location = useLocation();
  const { data } = useContext(MyContext);

  const fetchTicketConvertion = useCallback(async () => {
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
    } catch (error) {
      console.error("Fetch ticket conversion error:", error);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.warn("User not logged in — skipping TicketConvertion fetch");
      return;
    }
    
    try {
      const response = await axios.get(`${UserProfile}/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("upToken")}`,
          clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
          WebApp: window.Telegram.WebApp.initData,
        },
      });
      const points = response.data.user.ticketBalance;
      setTicketBalance(points);
      setError("");
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError(error.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const refreshBalance = () => {
      fetchProfile();
      fetchTicketConvertion();
    };
    window.addEventListener("userLoggedIn", refreshBalance);
    return () => {
      window.removeEventListener("userLoggedIn", refreshBalance);
    };
  }, [fetchProfile, fetchTicketConvertion]);

  useEffect(() => {
    const handlePointsUpdate = (event) => {
      if (event.detail?.points) {
        setTicketBalance((prev) => prev + event.detail.points);
      } else {
        fetchProfile();
        fetchTicketConvertion();
      }
    };
    window.addEventListener("pointsUpdated", handlePointsUpdate);
    return () => window.removeEventListener("pointsUpdated", handlePointsUpdate);
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchTicketConvertion();
  }, [location.pathname, fetchProfile, fetchTicketConvertion]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        mx: 1,
        mt: 1,
        borderRadius: 3,
        background: "rgba(17, 16, 35, 0.6)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
      }}
    >
      <AppBar position="static" sx={{ 
        background: "transparent", 
        boxShadow: "none",
        height: '45px', // Reduced header height
      }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            minHeight: '45px !important', // Force height
            height: '45px',
            padding: '0 16px !important', // Reduce padding
          }}
        >
          <Box sx={{ 
            display: "flex", 
            alignItems: "center",
            height: '100%',
          }}>
            <img
              src={coin}
              alt="coin"
              style={{ width: "15px", marginRight: "8px" }}
            />
            <Typography
  variant="body2"
  sx={{
    color: "#0bf",
    fontSize: "16px",
    fontWeight: "bold",
    textShadow: `
      0 0 2px #0bf,
      0 0 4px #0bf
    `,
    animation: "glow-pulse 2s infinite alternate",
    '@keyframes glow-pulse': {
      '0%': { textShadow: '0 0 2px #0bf' },
      '100%': { textShadow: '0 0 4px #0bf' }
    }
  }}
>
  {ticketBalance.toFixed(0)}
</Typography>
          </Box>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center",
            height: '100%',
          }}>
            <img
              src={Tether}
              alt="coin"
              style={{ width: "18px", marginRight: "8px" }}
            />
            <Typography
              variant="body2"
              sx={{
                color: "#00ff6a",
                fontSize: "16px", // Slightly larger font
                fontWeight: "bold",
                textShadow: `
                 0 0 2px #00ff6a,
                 0 0 4px #00ff6a,
                `,
                animation: "glow-pulse-green 2s infinite alternate",
                '@keyframes glow-pulse-green': {
                  '0%': { textShadow: '0 0 2px #00ff6a' },
                  '100%': { textShadow: '0 0 4px #00ff6a' }
                }
              }}
            >
              {ticketQuantity && ticketBalance
                ? ((usdtAmount * ticketBalance) / ticketQuantity).toFixed(2)
                : "0.00"}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}