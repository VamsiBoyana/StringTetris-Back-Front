import React, { useEffect } from "react";
// import "./App.css";
import ReactGA from 'react-ga';
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import TelegramIcon from "@mui/icons-material/Telegram";
import { Box, Button, Typography, Paper, CssBaseline } from "@mui/material";
import { UserProvider } from "./context/UserContext";
import { MyProvider } from "./context/Mycontext";
import { useTelegram } from "./Components/Hooks/useTelegram";
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";
import Games from "./Components/Games/Games";
import Task from "./Components/Task/Task";
import Cargame from "./Components/Tetris/Tetris";
import Gameinfo from "./Components/Gameinfo/Gameinfo";
import Refer from "./Components/Refer/Refer";
import Referalhistory from "./Components/Referalhistory/Referalhistory";
import Boosters from "./Components/Boosters/Boosters";
import Profile from "./Components/Profile/Profile";
import Withdrawhistory from "./Components/Withdrawhistory/Withdrawhistory";
import Leaderboard from "./Components/Leaderboard/Leaderboard";
import ToastPortal from "./Components/ToastPortal/ToastPortal";
import tg from "./Components/telgramExpand/Telegramwebapp";
import { useAdBlockerDetector } from "./Components/Hooks/useAdBlockerDetector";
import AdBlockerPopup from "./Components/AdBlockerPopup/AdBlockerPopup";
import { useAdAndTelegramControl } from "./Components/Hooks/useAdAndTelegramControl";
import { BOTNAME } from "./ApiConfig";


function AppContent() {
   const { showPopup, setShowPopup, checkAdBlocker } = useAdBlockerDetector();

  const handleRetry = async () => {
    setShowPopup(false);
    await checkAdBlocker(); // Re-check when user clicks retry
  };

  const location = useLocation();

  //google analytics
  useEffect(() => {
    // Initialize Google Analytics
    ReactGA.initialize('G-K9GJH23MN3');
 
    // Track page view
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  useAdAndTelegramControl();


  // const { isValidTelegram } = useTelegram();
  const { isValidTelegram } = useTelegram();
  // debug
  // where to hide header/footer
  const hideHeaderOn = ["/games/tetris", "/gameinfo"];
  const hideFooterOn = ["/games/tetris"];
  const showHeader = !hideHeaderOn.includes(location.pathname);
  const showFooter = !hideFooterOn.includes(location.pathname);

  // Telegram WebApp init
  useEffect(() => {
    tg.ready();
    tg.BackButton.onClick(() => window.history.back());
    location.pathname !== "/" ? tg.BackButton.show() : tg.BackButton.hide();
    return () => { tg.BackButton.offClick(); };
  }, [location]);

  const renderNotMobileDevice = () => {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          p: 2,
        }}
      >
        <Paper elevation={4} sx={{ p: 4, textAlign: "center", maxWidth: 320, width: "100%" }}>
          <TelegramIcon sx={{ fontSize: 64, color: "primary.main", mb: 1 }} />
          <Typography variant="h5" color="primary" gutterBottom>
            🚀 Play on Telegram App
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Open this in the Telegram mobile app to unlock the full experience.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            href={`https://t.me/${BOTNAME}`}
            target="_blank"
            rel="noopener"
            sx={{ mt: 3 }}
            startIcon={<TelegramIcon />}
          >
            Open in Telegram
          </Button>
        </Paper>
      </Box>
    );
  };

  if (!isValidTelegram) {
    return renderNotMobileDevice();
  }

  return (
    <>
      <CssBaseline />
      {showPopup && <AdBlockerPopup onClose={handleRetry} />}
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Games />} />
        <Route path="/task" element={<Task />} />
        <Route path="/games/tetris" element={<Cargame />} />
        <Route path="/gameinfo" element={<Gameinfo />} />
        <Route path="/refer" element={<Refer />} />
        <Route path="/referralhistory" element={<Referalhistory />} />
        <Route path="/boosters" element={<Boosters />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/withdrawhistory" element={<Withdrawhistory />} />
        <Route path="/ranks" element={<Leaderboard />} />
      </Routes>
      {showFooter && <Footer />}
      <ToastPortal />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <UserProvider>
        <MyProvider>
          <AppContent />
        </MyProvider>
      </UserProvider>
    </Router>
  );
}
