import React, { useState, useEffect, useRef } from "react";
import ReactGA from 'react-ga';
// ReactGA.initialize('G-K9GJH23MN3');
import {
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
// import banner from "../../assets/banner.png";
import bg1 from "../../assets/bg.jpg";
import bgimage from "../../assets/bg.jpg";
import banner from "../../assets/banner.jpg";
import { useNavigate } from "react-router-dom";
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import SquareLoader from "../SquareLoader/SquareLoader";

const steps = [
  {
    step: 1,
    title: "Steer the Whip ",
    description: "Tap and hold the car, then drag left or right to swerve past enemy rides, potholes, and whatever else tries to wreck your vibe.",
    borderColor: "rgba(88, 233, 248, 0.25)",
  },
  {
    step: 2,
    title: "Snag Those Coins ",
    description: "Zoom through coins on the road to rack up points. More coins = more flex.",
    borderColor: "rgba(88, 233, 248, 0.25)"
  },
  {
    step: 3,
    title: "Stay Alive, Fam ",
    description: "Dodge everything and keep cruising. The longer you survive, the higher you climb. Go break that leaderboard ",
    borderColor: "rgba(88, 233, 248, 0.25)"
  },
];

function GameInfo() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  localStorage.removeItem("mountCount");
  localStorage.removeItem("gamehistoryid");

  const handlePlayNow = () => {
    navigate('/games/tetris', { state: { fromPlayNow: true } });
  };

  useEffect(() => {
    ReactGA.initialize('G-K9GJH23MN3');
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setError("");
  };

  const handlePlayGame = () => {
    if (!amount || parseInt(amount) < 200) {
      setError("Minimum amount to play is 200");
      return;
    }
    if (parseInt(amount) <= 5000) {
      navigate("/games/tetris");
    } else {
      setError("Insufficient balance");
    }
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    if (error) setError("");
  };

  const stepRefs = useRef([]);
  const [inView, setInView] = useState(Array(steps.length).fill(false));

  useEffect(() => {
    const observers = stepRefs.current.map((ref, idx) => {
      if (!ref) return null;
      return new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView((prev) => {
              if (prev[idx]) return prev;
              const updated = [...prev];
              updated[idx] = true;
              return updated;
            });
          }
        },
        { threshold: 0.2 }
      );
    });

    stepRefs.current.forEach((ref, idx) => {
      if (ref && observers[idx]) observers[idx].observe(ref);
    });

    return () => {
      observers.forEach((observer, idx) => {
        if (observer && stepRefs.current[idx]) observer.disconnect();
      });
    };
  }, []);


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
    <>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundImage: `url(${bg1})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          width: "100vw",
          overflowY: "auto",
          top: 0,
          left: 0,
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Dark overlay for background */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.79)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* Game Banner - 90% width for all devices */}
        <Box
          sx={{
            width: "90%",
            maxWidth: 600,
            mx: "auto",
            mt: { xs: 4, md: 4 },
            zIndex: 2,
            position: "relative",
          }}
        >
          <Paper
            elevation={6}
            sx={{
              width: "100%",
              borderRadius: 4,
              background: "rgba(20, 20, 40, 0.7)",
              backdropFilter: "blur(8px)",
              border: "2px solid rgba(88, 233, 248, 0.25)",
              overflow: "hidden",
              animation: "parallax-slide-down 1s cubic-bezier(.4,2,.6,1) both",
            }}
          >
            <Box sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
              <Box
                component="img"
                src={banner}
                alt="Car Game"
                sx={{
                  width: "100%",
                  height: { xs: 120, sm: 150, md: 180 },
                  objectFit: "cover",
                  borderRadius: 3,
                  mb: 3,
                  boxShadow: "0 0 24px #1faeff55",
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  color: "#a1a1aa",
                  fontWeight: "bold",
                  fontFamily: "Inter",
                  fontSize: "12px",
                  mb: 2,
                }}
              >
                Falling Blocks, Rising Challenge — The Next Evolution of Tetris.
              </Typography>
              <Button
                onClick={handlePlayNow}
                sx={{
                  background: "linear-gradient(90deg, #1faeff 0%, #af73ff 100%)",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "12px",
                  px: 6,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: "0 0 16px #58E9F8",
                  textShadow: "0 0 8px #af73ff",
                  animation: "pulse 1s infinite",
                  "&:hover": {
                    background: "linear-gradient(90deg, #af73ff 0%, #1faeff 100%)",
                    boxShadow: "0 0 32px #af73ff",
                    transform: "scale(1.05)",
                    animation: "none", // Optional: stop animation on hover
                  },
                  "@keyframes pulse": {
                    "0%": {
                      transform: "scale(1)",
                    },
                    "50%": {
                      transform: "scale(1.05)",
                    },
                    "100%": {
                      transform: "scale(1)",
                    },
                  },
                }}
              >
                <PlayArrowOutlinedIcon sx={{ mr: 1, fontSize: 20 }} />
                Play Now
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* How to Play Box - 90% width for all devices */}
        <Box
          sx={{
            width: "90%",
            maxWidth: 600,
            mx: "auto",
            height: "40vh",
            minHeight: "300px",
            maxHeight: "400px",
            zIndex: 2,
            position: "relative",
            mb: "100px",
            mt: "10px"
          }}
        >
          <Paper
            elevation={6}
            sx={{
              width: "100%",
              borderRadius: 4,
              background: "rgba(20, 20, 40, 0.85)",
              border: "1.5px solid #3a2a4d",
              boxShadow: "0 0 24px #1faeff33",
              animation: "parallax-slide-up 1s cubic-bezier(.4,2,.6,1) both",
              p: 3,
              color: "#fff",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <SportsEsportsIcon sx={{ color: "#c6f", mr: 1, fontSize: 28 }} />
              <Typography
                variant="h6"
                sx={{
                  color: "#c6f",
                  fontWeight: "bold",
                  fontFamily: "Inter",
                  fontSize: { xs: "14px", sm: "14px" },
                }}
              >
                How to Play
              </Typography>
            </Box>
            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
              <li style={{ color: "#58e9f8", marginBottom: 4 }}>
                <span style={{ color: "#ccc", fontSize: "12px" }}>Use arrow keys to move and rotate blocks</span>
              </li>
              <li style={{ color: "#58e9f8", marginBottom: 4 }}>
                <span style={{ color: "#ccc",fontSize: "12px" }}>Stack blocks to form complete lines</span>
              </li>
              <li style={{ color: "#58e9f8", marginBottom: 4 }}>
                <span style={{ color: "#ccc", fontSize: "12px" }}>Complete lines disappear and earn points</span>
              </li>
              <li style={{ color: "#58e9f8" }}>
                <span style={{ color: "#ccc", fontSize: "12px" }}>Game speeds up as you progress</span>
              </li>
            </Box>
          </Paper>
        </Box>

        {/* Steps (commented out as per original) */}
        {/* <Box sx={{ width: "90%", maxWidth: 600, mx: "auto", mb: 4 }}>
          {steps.map((step, idx) => (
            <Box
              ref={el => stepRefs.current[idx] = el}
              key={step.step}
              sx={{
                backgroundColor: "#1f1f1f",
                border: `2px solid ${step.borderColor}`,
                borderRadius: 3,
                p: 3,
                width: "100%",
                mb: 2,
                position: "relative",
                color: "white",
                opacity: inView[idx] ? 1 : 0,
                animation: inView[idx]
                  ? `${idx % 2 === 0 ? "parallax-slide-left" : "parallax-slide-right"} 0.5s ease-out forwards`
                  : "none",
                animationDelay: `${idx * 0.1}s`,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                align="center"
                fontFamily="Inter"
                sx={{
                  color: "#c6f",
                  fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                }}
              >
                {step.title}
              </Typography>
              <Typography
                variant="body2"
                align="center"
                color="#ccc"
                mt={1}
                fontFamily="Inter"
              >
                {step.description}
              </Typography>
            </Box>
          ))}
        </Box> */}
      </Box>
    </>
  );
}

export default GameInfo;