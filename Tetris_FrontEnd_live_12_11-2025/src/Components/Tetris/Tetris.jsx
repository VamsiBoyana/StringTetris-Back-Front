import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import ReactGA from 'react-ga';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField
} from '@mui/material';
import Color from 'color';
// import backgroundImg from "../../Assets/background6.jpg";
// import backgroundImg from "../../Assets/background.png";
import bgimage from "../../assets/bg.jpg";
import Confettieffect from "../Confettieffect/Confettieffect"
import { GameControlles, PlaceBet, UserProfile, encryptSecretKey } from "../../ApiConfig";
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import SquareLoader from '../SquareLoader/SquareLoader';
import stranger from "../../assets/stranger.mp3"
import sound from "../../assets/sound.mp3"
import tick from "../../assets/tick.mp3"
import { LogIn } from 'lucide-react';


// pps (pixels per screen) is the base unit for consistent scaling.
// It's calculated based on the viewport dimensions.
const usePps = () => {
  const [pps, setPps] = useState(1);

  useEffect(() => {
    const calculatePps = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      // This calculation determines the base size for all elements.
      // It uses the original code's logic for calculating 'pixelSize'.
      setPps(Math.min(
        isPortrait ? window.innerWidth / 12 : window.innerWidth / 32,
        isPortrait ? window.innerHeight / 26 : window.innerHeight / 20
      ));
    };

    calculatePps();
    window.addEventListener('resize', calculatePps);
    return () => window.removeEventListener('resize', calculatePps);
  }, []);

  return pps;
};


// Styled components
const GameContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'portrait'
})(({ portrait }) => ({
  width: '100vw',
  height: '100vh',
  position: "fixed",
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  // background: `url(${backgroundImg}) no-repeat center center`,
  background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bgimage}) no-repeat center center`,
  // backgroundColor :"black",
  backgroundSize: 'cover',
  overflow: 'hidden',
  padding: '20px 0' // Maintained from original
}));

const GameOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 100,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backdropFilter: 'blur(5px)'
});

const GameOverContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'pps'
})(({ pps }) => ({
  width: '90%',       // Always 90% width
  maxWidth: '90%',    // Prevent exceeding 90%
  boxSizing: 'border-box',
  border: '1px solid rgba(255,255,255,0.2)',
  backgroundColor: 'rgba(0,0,0,0.7)',
  borderRadius: '16px',
  padding: `${pps}px`,
  boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  color: 'white'
}));

const NextBlockContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'pps'
})(({ pps }) => ({
  borderRadius: '6px',
  width: `${pps * 2}px`,
  height: `${pps * 2}px`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: "10px"
}));

const Shockwave = styled(Box)({
  position: 'absolute',
  borderRadius: '50%',
  backgroundColor: 'rgba(255,255,255,0.2)',
  transform: 'scale(0)',
  animation: 'shockwave 1s ease-out infinite',
  pointerEvents: 'none',
  zIndex: 10
});

const countdownColors = {
  3: '#ff5555', // Red for 3
  2: '#ffaa00', // Orange for 2
  1: '#00ff44', // Green for 1
};

const CountdownText = styled(Typography)(({ countdowncolor }) => ({
  position: 'absolute',
  fontSize: '10rem',
  fontWeight: 'bold',
  color: countdowncolor || 'white',
  textShadow: '0 0 20px rgba(255,255,255,0.8)',
  animation: 'pulse 0.5s ease-out infinite alternate'
}));

// const CountdownText = styled(Typography)({
//   position: 'absolute',
//   fontSize: '10rem',
//   fontWeight: 'bold',
//   // color: 'white',
//   color: countdowncolor || 'white',
//   textShadow: '0 0 20px rgba(255,255,255,0.8)',
//   animation: 'pulse 0.5s ease-out infinite alternate'
// });

const ParticleExplosion = styled(Box)({
  position: 'absolute',
  borderRadius: '50%',
  pointerEvents: 'none',
  zIndex: 20,
  animation: 'particleExplode 0.8s ease-out forwards',
  opacity: 0,
  transformOrigin: 'center',
});

const LineClearFlash = styled(Box)({
  position: 'absolute',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 15,
  background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 80%)',
  opacity: 0,
  animation: 'flashFade 0.6s ease-out forwards',
});

const BlockBurstEffect = styled(Box)({
  position: 'absolute',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 25,
  background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
  opacity: 0,
  animation: 'burstExpand 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards',
});

const BlockBlastEffect = styled(Box)({
  position: 'absolute',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 25,
  background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
  opacity: 0,
  animation: 'blastExpand 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards',
});

const PaperPiece = styled(Box)({
  position: 'absolute',
  backgroundSize: 'cover',
  opacity: 0,
  animation: 'paperFloat 2s ease-out forwards',
  transformOrigin: 'center',
  zIndex: 30,
});

const PaperBurstContainer = styled(Box)({
  position: 'absolute',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 29,
});

// Update the SpeedLine styled component to accept color prop
const SpeedLine = styled(Box)({
  position: 'absolute',
  width: '2px',
  height: '100%',
  background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
  pointerEvents: 'none',
  zIndex: 35,
  animation: 'speedLineMove 0.3s linear infinite',
  opacity: 0.8,
});

// Update the TrailEffect styled component to accept color prop
const TrailEffect = styled(Box)(({ color }) => ({
  color: "#c6f",
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 30,
  background: `linear-gradient(to bottom, 
    ${color} 0%, 
    ${color}CC 20%, 
    ${color}99 40%, 
    ${color}66 60%, 
    ${color}33 80%, 
    transparent 100%)`,
  opacity: 1,
  animation: 'trailFade 0.8s ease-out forwards',
  boxShadow: `0 0 15px ${color}99, 0 0 30px ${color}4D`,
  borderRadius: '2px',
}));


// Update your global styles with these new animations
const globalStylesAddition = `
  @keyframes particleExplode {
    0% { 
      transform: translate(0, 0) scale(0); 
      opacity: 1; 
    }
    100% { 
      transform: translate(var(--tx), var(--ty)) scale(1); 
      opacity: 0; 
    }
  }
  
  @keyframes flashFade {
    0% { transform: scale(0.5); opacity: 0; }
    20% { opacity: 1; }
    100% { transform: scale(1.5); opacity: 0; }
  }
  
  @keyframes burstExpand {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(3); opacity: 0; }
  }
  
  @keyframes colorWave {
    0% { transform: scale(0.8); opacity: 0; }
    50% { opacity: 0.8; }
    100% { transform: scale(1.5); opacity: 0; }
  }
 @keyframes blastExpand {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(2); opacity: 0; }
  }
    @keyframes paperFloat {
    0% {
      transform: translate(0, 0) rotate(0deg) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(var(--paper-tx), var(--paper-ty)) rotate(var(--paper-rot)) scale(0.5);
      opacity: 0;
    }
  }

  @keyframes paperExplode {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }

  @keyframes speedLineMove {
    0% { transform: translateY(-100%); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(100%); opacity: 0; }
  }

  @keyframes trailFade {
    0% { 
      opacity: 1; 
      transform: scaleY(1);
      filter: brightness(1.2);
    }
    50% { 
      opacity: 0.8; 
      transform: scaleY(1);
      filter: brightness(1.1);
    }
    100% { 
      opacity: 0; 
      transform: scaleY(0.8);
      filter: brightness(0.8);
    }
  }

  @keyframes fastDropGlow {
    0% { box-shadow: 0 0 10px rgba(255,255,255,0.5); }
    50% { box-shadow: 0 0 20px rgba(255,255,255,0.8); }
    100% { box-shadow: 0 0 10px rgba(255,255,255,0.5); }
  }
`;


const globalStyles = `
  @keyframes shockwave {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(1); opacity: 0; }
  }
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1.2); opacity: 0.7; }
  }
  ${globalStylesAddition}
`;


const NextBlockDisplay = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'pps'
})(({ pps }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${pps / 3}px`,
  backgroundColor: 'rgba(0,0,0,0.3)',
  borderRadius: '3px'
}));

const StageContainer = styled(Box)(({ pps }) => ({
  border: '2px solid #333',
  borderRadius: '4px',
  boxShadow: '0 0 20px rgba(0,0,0,0.5)',
  // background: "#374151", //#112655
  position: 'relative',
  overflow: 'hidden',
  // background: "#4871aa",
  background: "rgba(0,0,0,0.3)",
  backdropFilter: 'blur(10px)',
  // position: 'relative', // Add this for proper stacking context
  // overflow: 'hidden', // Ensure blur doesn't leak outside
  // '&::before': {
  //   content: '""',
  //   position: 'absolute',
  //   top: 0,
  //   left: 0,
  //   right: 0,
  //   bottom: 0,
  //   background: `url(${backgroundImg}) no-repeat center center`,
  //   backgroundSize: 'cover',
  //   zIndex: -1,
  //   filter: 'blur(10px)',
  // }
}));

const ControlsContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'marginbottom'
})(({ marginbottom }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: '20px',
  marginTop: '5px',
  marginBottom: marginbottom || '60px',
}));

const ControlButton = styled(Button)({
  minWidth: '50px',
  height: '50px',
  fontSize: '24px',
  backgroundColor: 'rgba(0,0,0,0.7)', //'rgba(179, 117, 117, 0.1)'
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.7)' //'rgba(255,255,255,0.2)'
  }
});

// Shared popup style for all popups
const popupStyle = {
  background: 'rgba(10, 10, 20, 0.95)',
  border: '1.5px solid #00bfff',
  boxShadow: '0 0 16px #00bfff55',
  width: '90%',       // Force 90% width
  maxWidth: '90%',    // Prevent exceeding 90%
  padding: '32px 28px 24px 28px',
  position: 'relative',
  borderRadius: '16px',
  color: 'white',
};

const Pixel = styled(Box, {
  shouldForwardProp: (prop) =>
    !['pps', 'fill', 'color', 'hint', 'stage', 'playerColor', 'topBloco', 'next', 'fastDrop'].includes(prop)
})(({ pps, fill, color, hint, stage, playerColor, topBloco, next, fastDrop }) => ({
  width: `${pps}px`,
  height: `${pps}px`,
  backgroundColor: fill
    ? color // Use the color directly without transparency when dragging
    : hint
      ? Color(playerColor).alpha(0.1).string() // More transparent hint
      : 'rgba(0,0,0,0.1)', // Slightly visible empty cells
  border: next
    ? '2px solid #0a0606'
    : stage
      ? `1px solid ${fill ? Color(color).darken(0.3).string() : 'rgba(255,255,255,0.1)'}` // Lighter border
      : 'none',
  boxSizing: 'border-box',
  boxShadow: topBloco
    ? `0 -2px 0 ${Color(color).darken(0.2).string()} inset`
    : 'none',
  backdropFilter: fill ? 'blur(8px)' : 'none', // Subtle blur for filled pixels
  // Add fast drop glow effect
  animation: fastDrop && fill ? 'fastDropGlow 0.3s ease-in-out infinite' : 'none',
}));




const Game = () => {


  useEffect(() => {
    ReactGA.initialize('G-K9GJH23MN3');
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []); 


  const pps = usePps(); // Our new dynamic unit, replaces 'pixelSize'
  const { width, height } = { width: window.innerWidth, height: window.innerHeight };
  const portrait = height > width;

  // Constants
  // Note: MAX_LEVEL is now dynamically set from API response (maxLevel state)
  // Removed hardcoded MAX_LEVEL = 5 to use actual configured levels
  const STAGE_HEIGHT = 18;
  const STAGE_WIDTH = 10;

  const createEmptyMap = useCallback(() => {
    return Array.from({ length: STAGE_HEIGHT }, () =>
      Array.from({ length: STAGE_WIDTH }, () => ({ fill: 0, color: [] }))
    );
  }, []);

  const SHAPES = {
    I: { bloco: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]] },
    O: { bloco: [[1, 1], [1, 1]] },
    T: { bloco: [[0, 0, 0], [1, 1, 1], [0, 1, 0]] },
    J: { bloco: [[0, 1, 0], [0, 1, 0], [1, 1, 0]] },
    L: { bloco: [[0, 1, 0], [0, 1, 0], [0, 1, 1]] },
    S: { bloco: [[0, 1, 1], [1, 1, 0], [0, 0, 0]] },
    Z: { bloco: [[1, 1, 0], [0, 1, 1], [0, 0, 0]] }
  };
  // const COLORS = ["#e54b4b", "#9a031e", "#fcdc4d", "#005397", "#0bbcd6", "#20ad65", "#f8ebee"];
  // const COLORS = ["#39FF14", "#b266ff", "#ffb347", "#ff55e0", "#1faeff", "#af73ff", "#fc0808"];
  const COLORS = ["#c6f"];


  const [gameState, setGameState] = useState('betting');
  const [map, setMap] = useState(() => createEmptyMap());
  const [player, setPlayer] = useState(null);
  const [nextBlock, setNextBlock] = useState(null);
  const [hintPlayer, setHintPlayer] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fastDrop, setFastDrop] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // New state for touch dragging
  const [spaceReleased, setSpaceReleased] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showBetPopup, setShowBetPopup] = useState(true);
  const [betAmount, setBetAmount] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [shockwave, setShockwave] = useState(false);
  const [status, setStatus] = useState({ score: 0, level: 1, lines: 0 });
  const [showWonPopup, setShowWonPopup] = useState(false); // <-- Add this state
  const [prevLevelScore, setPrevLevelScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // Add this new state for total lines cleared
  const [totalLinesCleared, setTotalLinesCleared] = useState(0);

  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [lastTap, setLastTap] = useState(null);
  const [tapTimer, setTapTimer] = useState(null);

  // Add this new state to your component
  const [explosions, setExplosions] = useState([]);
  const [lineClears, setLineClears] = useState([]);

  const [particleExplosions, setParticleExplosions] = useState([]);
  const [blockBursts, setBlockBursts] = useState([]);
  const [lineFlashes, setLineFlashes] = useState([]);
  const [paperPieces, setPaperPieces] = useState([]);

  // Fast drop effect states
  const [speedLines, setSpeedLines] = useState([]);
  const [trailEffects, setTrailEffects] = useState([]);
  const [ticketBalance, setTicketBalance] = useState(0);
  const [minBet, setMinBet] = useState(100);
  const [maxBet, setMaxBet] = useState(100);
  const [maxLevel, setMaxLevel] = useState(0);
  const [gameHistoryId, setGameHistoryId] = useState(null);
  const gameHistoryIdRef = useRef(null);
  const currentScoreRef = useRef(0);
  const [nextShapeDelay, setNextShapeDelay] = useState(false);
  const [moved, setMoved] = useState(false);
  const movedRef = useRef(false);
  const highestLevelRef = useRef(0);

  // Replace your GAME_LEVELS constant with this state
  const [gameLevels, setGameLevels] = useState([]);

  const [isPausedByVisibility, setIsPausedByVisibility] = useState(false);
  const pauseTimeoutRef = useRef(null);
  const gameStateRef = useRef({
    gameRunning: false,
  });
  const navigate = useNavigate();

  // Add audio ref for background music
  const audioRef = useRef(null);

  const lineClearAudioRef = useRef(null);
  const tickAudioRef = useRef(null); // Add this line

  // Add this useEffect to fetch game levels when component mounts
  useEffect(() => {
    const fetchGameLevels = async () => {
      const userId = localStorage.getItem("userId");
      setLoading(true);
      try {
        const upToken = localStorage.getItem("upToken");
        if (!upToken) {
          toast.error("Unauthorized: No authentication token found.");
          return;
        }

        const response = await axios.get(`${GameControlles}/${userId}`, {
          headers: {
            Authorization: `Bearer ${upToken}`,
            clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
            WebApp: window.Telegram.WebApp.initData,
          },
        });

        if (response.data && response.data.data) {
          const { level, min, max } = response.data.data;
          setGameLevels(response.data.data.level);
          setMinBet(min);
          setMaxBet(max);
          setMaxLevel(response.data.data.level.length);
          console.log("Max Level:", response.data.data.level.length);
        }
      } catch (error) {
        console.error("Error fetching game levels:", error);
        toast.error("Failed to load game settings");
      } finally {
        setLoading(false);
      }
    };

    fetchGameLevels();
  }, []);

  // fetch user balance
  //Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const userId = localStorage.getItem("userId"); // ✅ Fetch stored user ID

      if (!userId) {
        setError("User not logged in.");
        setLoading(false);
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

        setTicketBalance(response.data.user.ticketBalance);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Modify your handleBetSubmit function to call placeBet API
  const handleBetSubmit = async () => {
    if (!currentLevelConfig) {
      toast.error("Game configuration is still loading. Please wait.");
      return;
    }
    
    const bet = parseInt(betAmount);
    if (isNaN(bet) || bet < minBet || bet > maxBet) {
      toast.error(`Please enter a bet between ${minBet} and ${maxBet}`);
      return;
    }

    try {
      const upToken = localStorage.getItem("upToken");
      if (!upToken) {
        toast.error("Unauthorized: No authentication token found.");
        return;
      }

      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("Unauthorized: No user ID found.");
        return;
      }

      const response = await axios.post(
        `${PlaceBet}/${userId}`,
        {
          gameId: "tetris", // or whatever your game ID is
          betAmount: bet,
        },
        {
          headers: {
            Authorization: `Bearer ${upToken}`,
            WebApp: window.Telegram.WebApp.initData,
            clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
          },
        }
      );

      if (response.status === 200) {
        setGameHistoryId(response.data.data.gameHistoryId);
        gameHistoryIdRef.current = response.data.data.gameHistoryId;
        localStorage.setItem("gameHistoryId", response.data.data.gameHistoryId);

        setShowBetPopup(false);
        setGameState('countdown');
        let counter = 3;
        setCountdown(counter);
        const countdownInterval = setInterval(() => {
          counter--;
          setCountdown(counter);
          setShockwave(true);
          setTimeout(() => setShockwave(false), 500);
          if (counter <= 0) {
            clearInterval(countdownInterval);
            setCountdown(null);
            startGame();
          }
        }, 1000);
      } else {
        toast.error(response.data?.message || "Failed to place bet");
      }
    } catch (error) {
      console.error("Error placing bet:", error);
      toast.error(error.response?.data?.message || "Failed to place bet");
    }
  };

  // Add this function to update game result
  const updateGameResult = async (playedStatus, newScore) => {
    const historyId = gameHistoryIdRef.current || localStorage.getItem("gameHistoryId");

    const winAmount = currentScoreRef.current;
    // const winAmount = status.score;
  
    // Determine the level to send based on game status
    // Cap the level at maxLevel to prevent displaying levels that don't exist
    const levelToSend = Math.min(status.level, maxLevel);
    
    // if (playedStatus === 'WON' && totalLinesCleared >= maxLevel) {
    //   // User completed all levels - send total level count
    //   levelToSend = maxLevel;
    // } else if (playedStatus === 'WON' || playedStatus === 'LOSE' || playedStatus === 'EXPIRED') {
    //   // User quit or lost - send current level
    //   levelToSend = status.level;
    // }

    if (!historyId) {
      console.error("No game history ID found");
      return;
    }

    try {
      const upToken = localStorage.getItem("upToken");
      if (!upToken) {
        toast.error("Unauthorized: No authentication token found.");
        return;
      }

      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("Unauthorized: No user ID found.");
        return;
      }

      const payload = {
        gameHistoryId: historyId,
        playedStatus,
        winAmount,
        level: levelToSend, // Add level to the request
      };

      if (playedStatus === 'WON') {
        console.log('Game Won - Result being sent:', payload);
      }

      const response = await axios.post(
        `${PlaceBet}/${userId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${upToken}`,
            WebApp: window.Telegram.WebApp.initData,
            clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
          },
        }
      );


    } catch (error) {
      console.error("Error updating game result:", error);
      toast.error(error.response?.data?.message || "Failed to update game result");
    }
  };

  // Function to create fast drop effects
  const createFastDropEffects = useCallback(() => {
    if (!player) return;

    // Create speed lines around the falling block
    const newSpeedLines = [];
    const blockWidth = player.block.bloco[0].length;
    const blockHeight = player.block.bloco.length;

    // Create multiple speed lines around the block
    for (let i = 0; i < 6; i++) {
      const offsetX = (Math.random() - 0.5) * (blockWidth + 4);
      newSpeedLines.push({
        id: `speed-line-${i}-${Date.now()}`,
        x: player.pos[1] + offsetX,
        delay: Math.random() * 0.2,
        // color: player.block.color // Use the color of the block being dragged
        color: "#c6f" // Use the color of the block being dragged
      });
    }
    // Create trail effect for the current block position
    const newTrailEffect = {
      id: `trail-${Date.now()}`,
      x: player.pos[1],
      y: player.pos[0],
      width: blockWidth,
      height: blockHeight,
      // color: player.block.color // Use the color of the block being dragged
      color: "#c6f" // Use the color of the block being dragged
    };


    setSpeedLines(newSpeedLines);
    setTrailEffects([newTrailEffect]);

    // Clean up effects after animation
    setTimeout(() => {
      setSpeedLines([]);
      setTrailEffects([]);
    }, 500);
  }, [player]);

  // Function to clear fast drop effects
  const clearFastDropEffects = useCallback(() => {
    setSpeedLines([]);
    setTrailEffects([]);
  }, []);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = globalStyles;
    document.head.appendChild(styleElement);
    return () => { document.head.removeChild(styleElement); };
  }, []);

  // Use useMemo to ensure currentLevelConfig updates correctly when level changes
  const currentLevelConfig = useMemo(() => {
    if (!gameLevels || gameLevels.length === 0) return null;
    
    // Try to find level config by matching level as string or number
    const levelConfig = gameLevels.find(l => 
      l.level === status.level.toString() || 
      l.level === status.level || 
      Number(l.level) === status.level
    );
    
    // If not found, try to get level by index (status.level - 1 since levels are 1-indexed)
    if (!levelConfig && status.level > 0 && status.level <= gameLevels.length) {
      return gameLevels[status.level - 1];
    }
    
    // Fallback to first level if still not found
    return levelConfig || gameLevels[0] || null;
  }, [gameLevels, status.level]);

// get random block
  const getRandomBlock = useCallback(() => {
    const blocks = Object.values(SHAPES);
    const block = blocks[Math.floor(Math.random() * blocks.length)];
    return { ...block, color: COLORS[Math.floor(Math.random() * COLORS.length)] };
  }, [SHAPES, COLORS]);

  const getNewPlayer = useCallback((currentPlayer) => {
    const block = currentPlayer?.next ? JSON.parse(JSON.stringify(currentPlayer.next)) : getRandomBlock();
    const next = getRandomBlock();
    const pos = [0, Math.floor(STAGE_WIDTH / 2 - block.bloco[0].length / 2)];
    return { pos, block, next };
  }, [getRandomBlock]);

  const printPlayerInMap = useCallback((player, map) => {
    const newMap = map.map(row => [...row]);
    player.block.bloco.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel === 1) {
          const pixelY = player.pos[0] + y;
          const pixelX = player.pos[1] + x;
          if (pixelY >= 0 && pixelY < STAGE_HEIGHT && pixelX >= 0 && pixelX < STAGE_WIDTH) {
            newMap[pixelY][pixelX] = { fill: 1, color: player.block.color };
          }
        }
      });
    });
    return newMap;
  }, []);

  const getTrimmedBlock = useCallback((block) => {
    let trimRowBlock = [];
    let sumColumn = {};
    block.forEach(row => {
      if (row.reduce((a, b) => a + b, 0) > 0) trimRowBlock.push(row);
      row.forEach((pixel, x) => { sumColumn[x] = (sumColumn[x] || 0) + pixel; });
    });
    return trimRowBlock.map(row => row.filter((_, x) => sumColumn[x] > 0));
  }, []);

  const validatePosition = useCallback((pos, block) => {
    for (let y = 0; y < block.bloco.length; y++) {
      for (let x = 0; x < block.bloco[y].length; x++) {
        if (block.bloco[y][x] === 1) {
          const mapY = pos[0] + y;
          const mapX = pos[1] + x;
          if (mapY >= STAGE_HEIGHT || mapX < 0 || mapX >= STAGE_WIDTH || (mapY >= 0 && map[mapY][mapX].fill === 1)) {
            return false;
          }
        }
      }
    }
    return true;
  }, [map]);

  const calculateHintPlayer = useCallback((player) => {
    if (!player) return null;
    const hintBlock = JSON.parse(JSON.stringify(player.block));
    let hintPosition = [...player.pos];
    while (validatePosition([hintPosition[0] + 1, hintPosition[1]], hintBlock)) {
      hintPosition[0] += 1;
    }
    return { pos: hintPosition, block: hintBlock };
  }, [validatePosition]);

  const getNewPlayerPos = useCallback((movement) => {
    if (!player) return [0, 0];
    let newPos = [...player.pos];
    if (movement === 'down') newPos[0] += 1;
    if (movement === 'left') newPos[1] -= 1;
    if (movement === 'right') newPos[1] += 1;
    return validatePosition(newPos, player.block) ? newPos : player.pos;
  }, [player, validatePosition]);

  const rotatePlayer = useCallback(() => {
    if (!player) return;
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    const matrix = clonedPlayer.block.bloco[0].map((_, i) => clonedPlayer.block.bloco.map(row => row[i])).map(row => row.reverse());
    if (validatePosition(player.pos, { bloco: matrix })) {
      setPlayer(p => ({ ...p, block: { ...p.block, bloco: matrix } }));
    }
  }, [player, validatePosition]);

  // Update your checkMap function to trigger the new effects
  const checkMap = useCallback((currentMap) => {
    const rowsToClear = currentMap.reduce((acc, row, y) =>
      (row.every(p => p.fill === 1) ? [...acc, y] : acc), []);

    let linesCleared = 0;
    let newMap = currentMap;
    let newParticles = [];
    let newBursts = [];
    let newFlashes = [];
    let newBlasts = [];
    let newPapers = [];

    if (rowsToClear.length > 0) {
      linesCleared = rowsToClear.length;

      // Play line clear sound
      if (lineClearAudioRef.current) {
        lineClearAudioRef.current.currentTime = 0;
        lineClearAudioRef.current.play().catch(() => { });
      }

      // Create effects for each cleared line
      rowsToClear.forEach(rowY => {
        const lineColor = currentMap[rowY][Math.floor(STAGE_WIDTH / 2)].color ||
          COLORS[Math.floor(Math.random() * COLORS.length)];

        // Add line flash effect
        newFlashes.push({
          id: `flash-${rowY}-${Date.now()}`,
          y: rowY,
          color: lineColor
        });

        // Add block burst effect for the center of the line
        newBursts.push({
          id: `burst-${rowY}-${Date.now()}`,
          y: rowY,
          x: Math.floor(STAGE_WIDTH / 2),
          color: lineColor
        });

        // Create block blast effect for each block in the line
        for (let x = 0; x < STAGE_WIDTH; x++) {
          if (currentMap[rowY][x].fill) {
            newBlasts.push({
              id: `blast-${x}-${rowY}-${Date.now()}`,
              x,
              y: rowY,
              color: currentMap[rowY][x].color
            });
          }
        }

        // Create particle explosions for each block in the line
        for (let x = 0; x < STAGE_WIDTH; x++) {
          if (currentMap[rowY][x].fill) {
            const particleCount = 8 + Math.floor(Math.random() * 8);
            for (let i = 0; i < particleCount; i++) {
              const angle = Math.random() * Math.PI * 2;
              const distance = 0.5 + Math.random() * 2;
              newParticles.push({
                id: `particle-${x}-${rowY}-${i}-${Date.now()}`,
                x,
                y: rowY,
                color: currentMap[rowY][x].color,
                tx: Math.cos(angle) * distance,
                ty: Math.sin(angle) * distance
              });
            }
          }
        }

        // Create paper burst effect for each cleared line
        const paperCount = 10 + Math.floor(Math.random() * 5);
        for (let i = 0; i < paperCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = 2 + Math.random() * 3;
          const rotation = Math.random() * 360;
          const size = 0.5 + Math.random() * 0.5;
          const paperColor = COLORS[Math.floor(Math.random() * COLORS.length)];

          newPapers.push({
            id: `paper-${rowY}-${i}-${Date.now()}`,
            x: Math.random() * STAGE_WIDTH,
            y: rowY,
            color: paperColor,
            tx: Math.cos(angle) * distance,
            ty: Math.sin(angle) * distance,
            rot: rotation,
            size: size
          });
        }
      });

      newMap = currentMap.filter((_, y) => !rowsToClear.includes(y));
      const emptyRows = Array.from({ length: linesCleared }, () =>
        Array(STAGE_WIDTH).fill({ fill: 0, color: [] }));

      newMap.unshift(...emptyRows);

      // Set all effects
      setParticleExplosions(prev => [...prev, ...newParticles]);
      setBlockBursts(prev => [...prev, ...newBursts]);
      setLineFlashes(prev => [...prev, ...newFlashes]);
      setExplosions(prev => [...prev, ...newBlasts]);
      setPaperPieces(prev => [...prev, ...newPapers]);

      // Clear effects after animation completes
      setTimeout(() => {
        setParticleExplosions(prev => prev.filter(p => !newParticles.includes(p)));
        setBlockBursts(prev => prev.filter(b => !newBursts.includes(b)));
        setLineFlashes(prev => prev.filter(f => !newFlashes.includes(f)));
        setExplosions(prev => prev.filter(e => !newBlasts.includes(e)));
        setPaperPieces(prev => prev.filter(p => !newPapers.includes(p)));
      }, 2000);
    }

    return { newMap, linesCleared };
  }, [COLORS, STAGE_WIDTH]);



  const advancingLevelRef = useRef(false);
  
  const advanceLevel = () => {
    // Prevent multiple calls to advanceLevel
    if (advancingLevelRef.current) {
      return;
    }
    
    if (status.level < maxLevel) {
      advancingLevelRef.current = true;
      const nextLevel = status.level + 1;
      
      setStatus(prev => ({
        ...prev,
        // Ensure level increments by exactly 1 and never exceeds maxLevel
        level: Math.min(nextLevel, maxLevel),
        lines: 0 // Reset lines counter for new level
      }));
      setPlayer(getNewPlayer(player));
      
      // Reset the flag after state update
      setTimeout(() => {
        advancingLevelRef.current = false;
      }, 100);
    } else {
      // Send total level count when all levels are completed
      updateGameResult('WON', currentScoreRef.current);
      setShowWonPopup(true);
      setGameState('won');
      setGameOver(false);
    }
  };

  
  const dropAction = useCallback((finalPosition) => {
    if (!currentLevelConfig) return; // Don't proceed if backend data isn't loaded
    
    const playerToDrop = JSON.parse(JSON.stringify(player));
    playerToDrop.pos = finalPosition;
    const mapWithPlayer = printPlayerInMap(playerToDrop, map);
    const { newMap, linesCleared } = checkMap(mapWithPlayer);
  
    let newScore = status.score;
    let newLines = status.lines;
  
    if (linesCleared > 0) {
      const bet = Number(betAmount) || 0;
      const perLineScore = Number(currentLevelConfig?.perLinescore);
      const multiplier = Number(currentLevelConfig?.multiplier);

      // Calculate score for current level based on the formula
      const levelScore = (perLineScore * linesCleared * multiplier * bet) / 100;

      // For level 1, add the bet amount. For higher levels, accumulate on previous score
      newScore = status.level === 1
        ? Math.round(bet + levelScore)
        : Math.round(status.score + levelScore);

      newLines += linesCleared;
      const newTotalLines = totalLinesCleared + linesCleared;
      setTotalLinesCleared(newTotalLines);

      // Update the ref with the current score
      currentScoreRef.current = newScore;

      // Check if total lines cleared reaches max level requirement
      // if (newTotalLines >= maxLevel) {
      //   setShowWonPopup(true);
      //   setGameState('won');
      //   setGameOver(false);
      //   setShowWithdraw(false);
      //   setPaused(false);
      //   // Send total level count when all levels are completed
      //   updateGameResult('WON', newScore);
      //   return;
      // }
    }
  
    setMap(newMap);
    setStatus(prev => ({ ...prev, score: newScore, lines: newLines }));
  
    // Check level completion - use current level's config to avoid skipping levels
    // Only check if we have a valid level config and lines match the requirement
    if (currentLevelConfig && newLines >= currentLevelConfig.linesPerLevel && status.level <= maxLevel) {
      // if (newLines === maxLevel) {
      //   // Final level completed
      //   setShowWonPopup(true);
      //   setGameState('won');
      //   setGameOver(false);
      //   setShowWithdraw(false);
      //   setPaused(false);
      //   // Send total level count when final level is completed
      //   updateGameResult('WON', newScore); // Pass the actual current score
      //   return;
      // }

      if (currentLevelConfig?.quitPopUp === "1" || currentLevelConfig?.quitPopUp === 1) {
        setShowWithdraw(true);
        setPaused(true);
        setGameState('paused');
        return;
      } else {
        advanceLevel();
        return;
      }
    }
  
    // Set delay before next shape appears
    setNextShapeDelay(true);
    setTimeout(() => {
      const newPlayerObj = getNewPlayer(player);
      if (!validatePosition(newPlayerObj.pos, newPlayerObj.block)) {
        // Send current level when game is lost
        updateGameResult("LOSE", newScore);
        setGameOver(true);
        setGameState('gameOver');
      } else {
        setPlayer(newPlayerObj);
      }
      setNextShapeDelay(false);
      if (tickAudioRef.current) {
        tickAudioRef.current.currentTime = 0;
        tickAudioRef.current.play().catch(() => { });
      }
    }, 1000); // 1 second delay before next shape appears
  
  }, [player, map, checkMap, validatePosition, status, currentLevelConfig, getNewPlayer, betAmount, maxLevel, totalLinesCleared]);


  // Function to drop the player
  const dropPlayer = useCallback(() => {
    if (!player) {
      setPlayer(getNewPlayer());
      return;
    }

    const newPos = getNewPlayerPos('down');
    if (player.pos[0] === newPos[0]) {
      dropAction(player.pos);
    } else {
      setPlayer(p => ({ ...p, pos: newPos }));
    }
  }, [player, getNewPlayerPos, dropAction, getNewPlayer]);

  // const fastDropPlayer = useCallback(() => {
  //   if (!player || !hintPlayer) {
  //     return;
  //   }
  //   dropAction(hintPlayer.pos);
  // }, [player, hintPlayer, dropAction]);
  const fastDropPlayer = useCallback(() => {
    if (!player || !hintPlayer || nextShapeDelay) {
      return;
    }
    
    // Ensure we're not already processing a drop
    if (gameState !== 'playing' || paused || gameOver) {
      return;
    }
    
    // Immediately update player position to hint position to prevent ghost shape
    setPlayer(p => ({ ...p, pos: hintPlayer.pos }));
    
    // Then trigger the drop action
    dropAction(hintPlayer.pos);
  }, [player, hintPlayer, dropAction, nextShapeDelay, gameState, paused, gameOver]);
  
  const handleKeyDown = useCallback((e) => {
    if (gameState !== 'playing' || paused || gameOver) {
      return;
    }

    const keyAction = {
      37: () => {
        setPlayer(p => ({ ...p, pos: getNewPlayerPos('left') }));
      },
      38: () => {
        rotatePlayer();
      },
      39: () => {
        setPlayer(p => ({ ...p, pos: getNewPlayerPos('right') }));
      },
      40: () => {
        setFastDrop(true);
        // Do not create fast drop effects for the down arrow key
      },
      32: () => {
        if (spaceReleased) {
          setSpaceReleased(false);
          createFastDropEffects(); // Create effects for space bar fast drop
          fastDropPlayer();
        }
      },
      80: () => {
        setPaused(p => !p);
        setGameState(gs => gs === 'playing' ? 'paused' : 'playing');
      }
    }[e.keyCode];

    keyAction?.();
  }, [gameState, paused, gameOver, getNewPlayerPos, rotatePlayer, fastDropPlayer, spaceReleased, createFastDropEffects]);

  const handleKeyUp = useCallback((e) => {
    if (gameState !== 'playing' || paused || gameOver) return;

    if (e.keyCode === 40) {
      setFastDrop(false);
      // Clear effects when the down arrow key is released
      clearFastDropEffects();
    }

    if (e.keyCode === 32) {
      setSpaceReleased(true);
    }
  }, [gameState, paused, gameOver, clearFastDropEffects]);


 
  
//handle Touch Start
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
  
    setTouchStartX(startX);
    setTouchStartY(startY);
  
    setMoved(false);
    movedRef.current = false;
  
    // Start a timer but don’t use it to trigger rotation here
    // We'll rotate on touchend if no movement detected
    if (tapTimer) {
      clearTimeout(tapTimer);
      setTapTimer(null);
    }
  }, [rotatePlayer]);

  // handle Touch Move
  const handleTouchMove = useCallback((e) => {
    if (gameState !== 'playing' || paused || gameOver || nextShapeDelay) return;
    if (touchStartX === null || touchStartY === null) return;
   
    const touch = e.touches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
   
    const moveThreshold = 10;
    const hardDropThreshold = 50; // Increased threshold for hard drop
   
    // Only set moved flag if there's significant movement
    if (Math.abs(dx) > moveThreshold || Math.abs(dy) > moveThreshold) {
      setMoved(true);
      movedRef.current = true;
    }
   
    // Determine primary movement direction
    const isHorizontalMove = Math.abs(dx) > Math.abs(dy);
    const isVerticalMove = Math.abs(dy) > Math.abs(dx);
   
    if (isHorizontalMove) {
      // Horizontal move - only handle left/right, never trigger drop
      if (dx > moveThreshold) {
        setPlayer(p => ({ ...p, pos: getNewPlayerPos('right') }));
        setTouchStartX(touchEndX);
      } else if (dx < -moveThreshold) {
        setPlayer(p => ({ ...p, pos: getNewPlayerPos('left') }));
        setTouchStartX(touchEndX);
      }
    } else if (isVerticalMove && dy > moveThreshold) {
      // Vertical move (down only) - handle drop logic
      if (dy > hardDropThreshold) {
        // Hard drop - instantly fall to bottom
        if (!isDragging) {
          setIsDragging(true);
          
          // Create trail effect for the entire fall path with correct color
          const fallDistance = hintPlayer ? hintPlayer.pos[0] - player.pos[0] : 0;
          if (fallDistance > 0) {
            const newTrailEffect = {
              id: `trail-${Date.now()}`,
              x: player.pos[1],
              y: player.pos[0],
              width: player.block.bloco[0].length,
              height: fallDistance + player.block.bloco.length,
              color: player.block.color
            };
            setTrailEffects([newTrailEffect]);
          }
          
          // Trigger hard drop immediately
          fastDropPlayer();
        }
      } else {
        // Regular downward movement - just move down one step
        const newPos = [player.pos[0] + 1, player.pos[1]];
        if (validatePosition(newPos, player.block)) {
          setPlayer(p => ({ ...p, pos: newPos }));
          setTouchStartY(touchEndY);
        }
      }
    }
  }, [gameState, paused, gameOver, nextShapeDelay, touchStartX, touchStartY, getNewPlayerPos, isDragging, player, validatePosition, hintPlayer, fastDropPlayer]);

  // handle TouchEnd
  const handleTouchEnd = useCallback(() => {
    // Rotate if no drag
    if (!movedRef.current) {
      rotatePlayer();
      setShockwave(true);
      setTimeout(() => setShockwave(false), 300);
    }
  
    // Clear dragging & effects with delay to allow animation to complete
    if (isDragging) {
      setTimeout(() => {
        setIsDragging(false);
        setTrailEffects([]);
      }, 800); // Match the trailFade animation duration
    }
  
    setMoved(false);
    movedRef.current = false;
    setTouchStartX(null);
    setTouchStartY(null);
  
    if (tapTimer) {
      clearTimeout(tapTimer);
      setTapTimer(null);
    }
  }, [rotatePlayer, isDragging]);
  
  const startGame = () => {
    setGameState('playing');
    setMap(createEmptyMap());
    setStatus({ score: 0, level: 1, lines: 0 });
    setPlayer(getNewPlayer());
    setGameOver(false);
    setPaused(false);
    setFastDrop(false);
    setIsDragging(false); // Reset dragging state
    setPrevLevelScore(0); // Reset previous level score at the start of a new game
    setTotalLinesCleared(0); // Reset total lines cleared at the start of a new game
  };

  const restartGame = () => {
    // setGameState('betting');
    navigate("/gameinfo");
    setMap(createEmptyMap());
    setStatus({ score: 0, level: 1, lines: 0 });
    setPlayer(null);
    setGameOver(false);
    setPaused(false);
    setShowBetPopup(true);
    setBetAmount('');
    setCountdown(null);
    setFastDrop(false);
    setIsDragging(false);
    setPrevLevelScore(0);
    setTotalLinesCleared(0);
  };

  const handleRiskIt = () => {
    setShowWithdraw(false);
    setFastDrop(false);
    setIsDragging(false);

    if (status.level === maxLevel) {
      setShowWonPopup(true);
      setGameState('won');
      // Send total level count when all levels are completed
      updateGameResult("WON", currentScoreRef.current);
      setGameOver(false);
      setPaused(false);
      return;
    }

    advanceLevel();
    setPaused(false);
    setGameState('playing');
  };

  // Modify your handleQuit function to call updateGameResult
  const handleQuit = () => {
    setShowWithdraw(false);
    // Send current level when user quits
    updateGameResult("WON", currentScoreRef.current);
    setShowWonPopup(true);
    setGameState('won');
    setGameOver(false);
    setPaused(false);
    return;
    // setGameState('gameOver');
  };

  const handleExitWon = () => {
    navigate("/gameinfo");
    setShowWonPopup(false);
    setGameState('betting');
    setMap(createEmptyMap());
    setStatus({ score: 0, level: 1, lines: 0 });
    setPlayer(null);
    setGameOver(false);
    setPaused(false);
    setShowBetPopup(true);
    setBetAmount('');
    setCountdown(null);
    setFastDrop(false);
    setIsDragging(false); // Reset dragging state
    setPrevLevelScore(0); // Reset previous level score on exit won
  };

  const useInterval = (callback, delay) => {
    const savedCallback = useRef();
    useEffect(() => { savedCallback.current = callback; }, [callback]);
    useEffect(() => {
      function tick() { savedCallback.current(); }
      if (delay !== null) {
        const id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  };


  // const intervalDelay = gameState === 'playing' && !paused && !gameOver ? (fastDrop ? 50 : currentLevelConfig.speedPerLevel) : null;
  const intervalDelay = gameState === 'playing' && !paused && !gameOver && !nextShapeDelay && currentLevelConfig
  ? (fastDrop ? 50 : currentLevelConfig.speedPerLevel) 
  : null;

  useInterval(dropPlayer, intervalDelay);

  useEffect(() => {
    if (player) {
      setHintPlayer(calculateHintPlayer(player));
      setNextBlock(getTrimmedBlock(player.next.bloco));
    }
  }, [player, calculateHintPlayer, getTrimmedBlock]);

  useEffect(() => {
    if (gameState === "playing") {
      // Log only once when a new level starts
      // You can log more data here if needed:
    }
    // Only runs when status.level or gameState changes
  }, [status.level, gameState]);

  // Safety check: Ensure status.level never exceeds maxLevel
  useEffect(() => {
    if (maxLevel > 0 && status.level > maxLevel) {
      setStatus(prev => ({
        ...prev,
        level: maxLevel
      }));
    }
  }, [status.level, maxLevel]);

  useEffect(() => {
    gameStateRef.current.gameRunning = gameState === "playing" && !paused && !gameOver;
  }, [gameState, paused, gameOver]);

  useEffect(() => {
    const VISIBILITY_EXPIRE_TIMEOUT = 10000; // 10 seconds
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (gameState === "won" || !gameStateRef.current.gameRunning) {
          return;
        }
        // Assume not watching ad for now
        const isWatchingAd = false;
        if (!isWatchingAd) {
          updateGameResult("EXPIRED");
          navigate("/gameinfo");
        } else {
          setIsPausedByVisibility(true);
          gameStateRef.current.gameRunning = false;
          setPaused(true);
          pauseTimeoutRef.current = setTimeout(() => {
            setIsPausedByVisibility(false);
            updateGameResult("EXPIRED");
            navigate("/gameinfo");
          }, VISIBILITY_EXPIRE_TIMEOUT);
        }
      } else {
        if (isPausedByVisibility) {
          if (pauseTimeoutRef.current) {
            clearTimeout(pauseTimeoutRef.current);
            pauseTimeoutRef.current = null;
          }
          setIsPausedByVisibility(false);
          setPaused(false);
          gameStateRef.current.gameRunning = true;
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [gameState, isPausedByVisibility, navigate, updateGameResult, paused, gameOver]);

  // On reload/refresh, check if we need to redirect and send EXPIRED result
  useEffect(() => {
    // If the flag is set in localStorage, send EXPIRED result and redirect
    if (localStorage.getItem("redirectToGameInfo") === "true") {
      localStorage.removeItem("redirectToGameInfo");
      updateGameResult("EXPIRED");
      navigate("/gameinfo");
    }
  }, [navigate]);

  useEffect(() => {
    // On page unload (refresh/close), set a flag and send EXPIRED result
    const handleBeforeUnload = (e) => {
      if (gameStateRef.current.gameRunning) {
        // Set a flag so that after reload, we know to redirect
        localStorage.setItem("redirectToGameInfo", "true");
        // Send EXPIRED result
        updateGameResult("EXPIRED");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);


  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    // Add these for global touch support:
    

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
    };
  }, [handleKeyDown, handleKeyUp, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Add useEffect to control background music
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(stranger);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5; 
    }

    if (gameState === "playing" && !paused && !gameOver) {
      audioRef.current.play().catch(() => { });
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; 
    }

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [gameState, paused, gameOver]);

  useEffect(() => {
    lineClearAudioRef.current = new Audio(sound);
    lineClearAudioRef.current.volume = 0.7; // Optional: set volume
    tickAudioRef.current = new Audio(tick); // Add this line
    tickAudioRef.current.volume = 0.7; // Optional: set volume
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
    <GameContainer portrait={portrait}>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 20px', boxSizing: 'border-box', marginTop: "4px" }}>
        <NextBlockContainer pps={pps}>
          <Typography variant="h6" color="white" align="center" sx={{ mb: 1 }}>Next</Typography>
          <NextBlockDisplay pps={pps}>
            {nextBlock && nextBlock.map((row, y) => (
              <Box key={`next-row-${y}`} sx={{ display: 'flex' }}>
                {row.map((pixel, x) => (
                  <Pixel key={`next-pixel-${x}`} pps={pps * 0.6} fill={pixel} color={player?.next?.color} topBloco={pixel && (!nextBlock[y - 1] || !nextBlock[y - 1][x])} next />
                ))}
              </Box>
            ))}
          </NextBlockDisplay>
        </NextBlockContainer>
        <Box sx={{justifyContent: "center", alignItems: "center", mt: "10px"}}>
        <Typography  variant='h6' sx={{color: "#0bf", textAlign: "center",fontSize: { xs: "25px", sm: "30px" },fontFamily: "Techno Race Italic"}}>Target</Typography>
        <Typography  variant='h6' sx={{color: "#0bf", textAlign: "center",fontSize: { xs: "18px", sm: "18px" },fontFamily: "Techno Race Italic", margin: "2px"}}> <span style={{fontFamily: "Techno Race Italic", color: "#c6f" }}>Clear </span>{currentLevelConfig?.linesPerLevel || "0" || 0}<span style={{fontFamily: "Techno Race Italic", color: "#c6f"}}> Lines</span></Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end',}}>
          <Typography variant="h6" color="white">Score: {currentScoreRef.current}</Typography>
          <Typography variant="h6" color="white">Level: {Math.min(status.level, maxLevel)}</Typography>
          <Typography variant="h6" color="white" >Lines: {status.lines}</Typography>
          {/* <Typography variant="h6" color="white">Total Lines: {totalLinesCleared}</Typography> */}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, width: '100%' }}>
        <StageContainer
          pps={pps}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Fast Drop Speed Lines - Only show when fast dropping or dragging */}
          {(fastDrop || isDragging) && speedLines.map((line) => (
            <SpeedLine
              key={line.id}
              sx={{
                left: `${line.x * pps}px`,
                animationDelay: `${line.delay}s`,
                // background: `linear-gradient(to bottom, transparent 0%, ${line.color} 50%, transparent 100%)` // Use the color of the block
                background: `linear-gradient(to bottom, transparent 0%, #c6f 50%, transparent 100%)` // Use the color of the block
              }}
            />
          ))}

          {isDragging && trailEffects.map((trail) => (
            <TrailEffect
              key={trail.id}
              color={trail.color}
              sx={{
                left: `${trail.x * pps}px`,
                top: `${trail.y * pps}px`,
                width: `${trail.width * pps}px`,
                height: `${trail.height * pps}px`,
                background: `linear-gradient(to bottom, transparent 0%, #c6f 50%, transparent 100%)` // Use the color of the block
              }}
            />
          ))}
          {/* Particle explosions */}
          {particleExplosions.map((particle) => (
            <ParticleExplosion
              key={particle.id}
              sx={{
                left: `${particle.x * pps}px`,
                top: `${particle.y * pps}px`,
                width: `${pps * 0.5}px`,
                height: `${pps * 0.5}px`,
                backgroundColor: particle.color,
                boxShadow: `0 0 ${pps * 0.8}px ${particle.color}`,
                '--tx': `${particle.tx * pps}px`,
                '--ty': `${particle.ty * pps}px`
              }}
            />
          ))}

          {/* Block bursts */}
          {blockBursts.map((burst) => (
            <BlockBurstEffect
              key={burst.id}
              sx={{
                left: `${burst.x * pps}px`,
                top: `${burst.y * pps}px`,
                width: `${pps * 2}px`,
                height: `${pps * 2}px`,
                marginLeft: `${-pps}px`,
                marginTop: `${-pps}px`,
                background: `radial-gradient(circle, ${burst.color} 0%, rgba(255,255,255,0) 70%)`
              }}
            />
          ))}

          {/* Line flashes */}
          {lineFlashes.map((flash) => (
            <LineClearFlash
              key={flash.id}
              sx={{
                top: `${flash.y * pps}px`,
                height: `${pps}px`,
                background: `radial-gradient(circle, ${flash.color} 0%, rgba(255,255,255,0) 80%)`,
                boxShadow: `0 0 ${pps * 8}px ${flash.color}`
              }}
            />
          ))}

          {/* Block blasts */}
          {explosions.map((blast) => (
            <BlockBlastEffect
              key={blast.id}
              sx={{
                left: `${blast.x * pps}px`,
                top: `${blast.y * pps}px`,
                width: `${pps * 2}px`,
                height: `${pps * 2}px`,
                marginLeft: `${-pps}px`,
                marginTop: `${-pps}px`,
                background: `radial-gradient(circle, ${blast.color} 0%, rgba(255,255,255,0) 70%)`
              }}
            />
          ))}

          {/* Paper burst effect */}
          <PaperBurstContainer>
            {paperPieces.map((paper) => (
              <PaperPiece
                key={paper.id}
                sx={{
                  left: `${paper.x * pps}px`,
                  top: `${paper.y * pps}px`,
                  width: `${pps * paper.size}px`,
                  height: `${pps * paper.size}px`,
                  backgroundColor: paper.color,
                  '--paper-tx': `${paper.tx * pps}px`,
                  '--paper-ty': `${paper.ty * pps}px`,
                  '--paper-rot': `${paper.rot}deg`,
                  borderRadius: '10%',
                  transform: 'rotate(45deg)',
                  boxShadow: `0 0 5px ${Color(paper.color).lighten(0.3).string()}`
                }}
              />
            ))}
          </PaperBurstContainer>

          {/* Game map */}
          {map.map((row, y) => (
            <Box key={`map-row-${y}`} sx={{ display: 'flex' }}>
              {row.map((pixel, x) => {
                const playerFill = player?.block.bloco[y - player.pos[0]]?.[x - player.pos[1]];
                const playerHint = hintPlayer?.block.bloco[y - hintPlayer.pos[0]]?.[x - hintPlayer.pos[1]];
                const topBloco = (playerFill || pixel.fill) && (!player?.block.bloco[y - player.pos[0] - 1]?.[x - player.pos[1]]) && (!map[y - 1] || !map[y - 1][x].fill);
                return (
                  <Pixel
                    key={`map-pixel-${x}`}
                    pps={pps}
                    stage
                    fill={pixel.fill || playerFill}
                    color={playerFill ? player.block.color : pixel.color}
                    hint={!pixel.fill && !playerFill && playerHint}
                    playerColor={player?.block.color}
                    topBloco={topBloco}
                    fastDrop={(fastDrop || isDragging) && playerFill} 
                  />
                );
              })}
            </Box>
          ))}
        </StageContainer>

      </Box>

      {portrait && gameState === 'playing' && (
        <ControlsContainer marginbottom={portrait ? `${Math.max(100, pps * 6)}px` : '60px'}>
          <ControlButton onClick={() => setPlayer(p => ({ ...p, pos: getNewPlayerPos('left') }))}>←</ControlButton>
          <ControlButton onClick={rotatePlayer}>↻</ControlButton>
          <ControlButton onClick={() => setPlayer(p => ({ ...p, pos: getNewPlayerPos('right') }))}>→</ControlButton>
          <ControlButton onClick={() => setPlayer(p => ({ ...p, pos: getNewPlayerPos('down') }))}>↓</ControlButton>
        </ControlsContainer>
      )}

      {showBetPopup && gameState === 'betting' && (
        <GameOverlay>
          <GameOverContainer pps={pps} sx={popupStyle}>  
            {/* <Box sx={{ position: 'absolute', top: 12, right: 16, color: '#fff', fontSize: 24, cursor: 'pointer' }} onClick={() => setShowBetPopup(false)}>×</Box> */}
            <Typography variant="h5" align="center" sx={{ color: '#00bfff', fontWeight: 700, fontSize: "20px", mb: 1, letterSpacing: 1 }}>
              Place Your Bet
            </Typography>
            {!currentLevelConfig && (
              <Typography align="center" sx={{ color: '#ffaa00', fontWeight: 500, fontSize: 12, mb: 1 }}>
                Loading game configuration...
              </Typography>
            )}
            <Typography align="center" sx={{ color: '#00ff44', fontWeight: 500, fontSize: 12, mb: 0.5 }}>
              Your Ticket Balance: <span style={{ color: '#00ff44', fontWeight: 900 }}>{ticketBalance.toFixed(2)}</span>
            </Typography>
            <Typography align="center" sx={{ color: '#ccc', fontSize: 15, mb: 2 }}>
              {minBet === maxBet
                ? `Enter bet amount: ${minBet}`
                : `Enter bet amount between ${minBet} to ${maxBet}`}
            </Typography>
            <Box sx={{ width: '100%', mb: 1.5 }}>
              <Typography sx={{ color: '#b266ff', fontWeight: 600, mb: 0.5, fontSize: 15 }}>
                Bet Amount
              </Typography>
              <TextField
                variant="outlined"
                label={
                  minBet === maxBet
                    ? `Enter bet amount ${minBet}`
                    : `Enter bet amount between ${minBet} and ${maxBet}`
                }
                type="number"
                inputProps={{
                  min: minBet,  
                  max: maxBet,  
                  style: {
                    color: '#ffffff' 
                  }
                }}
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                sx={{
                  width: '100%',
                  background: '#181828',
                  borderRadius: '6px',
                  // Label styling
                  '& .MuiInputLabel-root': {
                    color: '#b266ff', // Purple label color
                    '&.Mui-focused': {
                      color: '#00bfff', // Blue when focused
                    },
                  },
                  // Input text styling
                  '& .MuiInputBase-input': {
                    color: '#ffffff', // White text color
                    fontSize: 18,
                    padding: '12px',
                  },
                  // Border styling
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#00bfff',
                      borderWidth: 2,
                    },
                    '&:hover fieldset': {
                      borderColor: '#b266ff',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#b266ff',
                    },
                  },
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, width: '100%',}}>
              <Button variant="contained" onClick={() => navigate("/gameinfo")}
                sx={{
                  width: '100%',
                  padding: '5px',
                  fontSize: '15px',
                  fontWeight: 500,
                  background: 'linear-gradient(90deg, #00bfff 0%, #b266ff 100%)',
                  color: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 12px #00bfff44',
                  mt: 2,
                  textTransform: 'none',
                  letterSpacing: 1.2,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #0099cc 0%, #8f3fff 100%)'
                  }
                }}
              >
                No
              </Button>
              <Button
                variant="contained"
                disabled={!currentLevelConfig}
                sx={{
                  width: '100%',
                  padding: '5px',
                  fontSize: '15px',
                  fontWeight: 500,
                  background: currentLevelConfig ? 'linear-gradient(90deg, #00bfff 0%, #b266ff 100%)' : 'rgba(128,128,128,0.5)',
                  color: '#fff',
                  borderRadius: '8px',
                  boxShadow: currentLevelConfig ? '0 2px 12px #00bfff44' : 'none',
                  mt: 2,
                  textTransform: 'none',
                  letterSpacing: 1.2,
                  '&:hover': {
                    background: currentLevelConfig ? 'linear-gradient(90deg, #0099cc 0%, #8f3fff 100%)' : 'rgba(128,128,128,0.5)'
                  }
                }}
                onClick={handleBetSubmit}
              >
                {currentLevelConfig ? 'Submit Bet' : 'Loading...'}
              </Button>
            </Box>


          </GameOverContainer>
        </GameOverlay>
      )}

      {gameOver && gameState === 'gameOver' && (
        <GameOverlay>
          <GameOverContainer pps={pps} wide sx={popupStyle}>
            <Typography variant="h4" align="center" sx={{ color: '#00bfff', fontSize: "20px", fontWeight: 700, mb: 1, letterSpacing: 1 }}>Game Over</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', mb: 3, width: '100%', textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontSize: "15px" }}>SCORE: {currentScoreRef.current}</Typography>
              <Typography variant="h6" sx={{ fontSize: "15px" }}>LEVEL: {Math.min(status.level, maxLevel)}</Typography>
              {/* <Typography variant="h6">LINES: {status.lines}</Typography> */}
              <Typography variant="h6" sx={{ fontSize: "15px" }}>TOTAL LINES: {totalLinesCleared}</Typography>
            </Box>
            <Button variant="contained" sx={{
              width: '80%',
              padding: '5px',
              fontSize: '15px',
              fontWeight: 500,
              background: 'linear-gradient(90deg, #00bfff 0%, #b266ff 100%)',
              color: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 12px #00bfff44',
              mt: 2,
              textTransform: 'none',
              letterSpacing: 1.2,
              '&:hover': {
                background: 'linear-gradient(90deg, #0099cc 0%, #8f3fff 100%)'
              }
            }}
              onClick={restartGame}>Restart</Button>
          </GameOverContainer>
        </GameOverlay>
      )}

      {showWithdraw && (
        <Dialog open={true} maxWidth="sm" fullWidth PaperProps={{ 
          sx: { 
            ...popupStyle, 
            width: '90%',
            maxWidth: '90% !important'
          } 
        }}>
          <DialogTitle sx={{ color: '#00bfff', fontWeight: 700, mb: 1, fontSize: "20px", letterSpacing: 1 }}>Level Complete!</DialogTitle>
          <DialogContent sx={{ color: 'white' }}>
            <Typography variant="h6" sx={{ mb: 1, fontSize: "15px" }}>You scored: {currentScoreRef.current}</Typography>
            <Typography variant="h6" sx={{ fontSize: "15px" }}>Total Lines: {totalLinesCleared}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleQuit} sx={{
              width: '100%',
              padding: '5px',
              fontSize: '15px',
              fontWeight: 500,
              background: 'linear-gradient(90deg, #00bfff 0%, #b266ff 100%)',
              color: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 12px #00bfff44',
              mt: 2,
              textTransform: 'none',
              letterSpacing: 1.2,
              '&:hover': {
                background: 'linear-gradient(90deg, #0099cc 0%, #8f3fff 100%)'
              }
            }}>Quit</Button>
            <Button onClick={handleRiskIt} variant="contained" sx={{
              width: '100%',
              padding: '5px',
              fontSize: '15px',
              fontWeight: 500,
              background: 'linear-gradient(90deg, #00bfff 0%, #b266ff 100%)',
              color: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 12px #00bfff44',
              mt: 2,
              textTransform: 'none',
              letterSpacing: 1.2,
              '&:hover': {
                background: 'linear-gradient(90deg, #0099cc 0%, #8f3fff 100%)'
              }
            }}>Risk It</Button>
          </DialogActions>
        </Dialog>
      )}

      {paused && !gameOver && !showWithdraw && gameState === 'paused' && (
        <GameOverlay>
          <Typography variant="h2" sx={{ color: 'white' }}>PAUSED</Typography>
        </GameOverlay>
      )}

      {countdown !== null && countdown > 0 && gameState === 'countdown' && (
        <GameOverlay>
          <CountdownText countdowncolor={countdownColors[countdown] || 'white'}>{countdown}</CountdownText>
          {/* <CountdownText>{countdown}</CountdownText> */}
          {shockwave && <Shockwave sx={{ width: '200px', height: '200px', left: '50%', top: '50%', marginLeft: '-100px', marginTop: '-100px' }} />}
        </GameOverlay>
      )}

      {showWonPopup && gameState === 'won' && (
        <>
          <GameOverlay>
          <GameOverContainer pps={pps} wide sx={{ ...popupStyle, width: '90%', maxWidth: '90%' }}>
              <Typography variant="h4" align="center" sx={{ color: '#00bfff', fontWeight: 700, mb: 1, fontSize: "20px", letterSpacing: 1 }}>You have completed all levels!</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', mb: 3, width: '100%', textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontSize: "15px" }}>SCORE: {currentScoreRef.current}</Typography>
                <Typography variant="h6" sx={{ fontSize: "15px" }}>Total Lines Cleared: {totalLinesCleared}</Typography>
              </Box>
              <Button variant="contained" sx={{
                width: '100%',
                padding: '5px',
                fontSize: '15px',
                fontWeight: 500,
                background: 'linear-gradient(90deg, #00bfff 0%, #b266ff 100%)',
                color: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 12px #00bfff44',
                mt: 2,
                textTransform: 'none',
                letterSpacing: 1.2,
                '&:hover': {
                  background: 'linear-gradient(90deg, #0099cc 0%, #8f3fff 100%)'
                }
              }} onClick={handleExitWon}>Exit</Button>
            </GameOverContainer>
          </GameOverlay>
          <Confettieffect />
        </>
      )}
    </GameContainer>
  );
};

export default Game;
