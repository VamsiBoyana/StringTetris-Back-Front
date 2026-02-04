import React, { useState, useEffect, useContext } from "react";
import ReactGA from 'react-ga';
import { MyContext } from "../../context/Mycontext";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
  Pagination,
  Stack,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from "react-router-dom";
import bg1 from "../../assets/bg.jpg";
import { Leaderboard, encryptSecretKey } from "../../ApiConfig";

const Leaderboardd = () => {

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data } = useContext(MyContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    // Initialize Google Analytics
    ReactGA.initialize('G-K9GJH23MN3');
 
    // Track page view
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);


  const fetchLeaderboardData = async () => {
    const upToken = localStorage.getItem("upToken");
    try {
      const response = await axios.get(`${Leaderboard}/${currentUserId}`, {
        headers: {
            Authorization: `Bearer ${upToken}`,
            clientid:encryptSecretKey(import.meta.env.VITE_SECRET_KEY,  new Date().getTime()),
            WebApp: window.Telegram.WebApp.initData,
        },
      });
      if (response.data && response.data.users && Array.isArray(response.data.users)) {
        // Sort data by ticketBalance in descending order
        const sortedData = response.data.users.sort((a, b) => (b.ticketBalance || 0) - (a.ticketBalance || 0));
        // Add rank to each item after sorting
        const rankedData = sortedData.map((item, index) => ({
          ...item,
          rank: index + 1,
          isCurrentUser: item._id === currentUserId
        }));
        setLeaderboardData(rankedData);
      } else {
        console.error("Invalid response format from API");
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard data:", error);
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "#FFD700"; // Gold
      case 2:
        return "#FFD700"; // Silver
      case 3:
        return "#FFD700"; // Bronze
      default:
        return "#00ffff";
    }
  };

  return (
    <Box sx={styles.mainContainer}>
      <Container maxWidth="lg" sx={{ paddingTop: '20px', width: '100%', padding: { xs: '10px', md: '20px' } }}>
        <Box sx={styles.header}>
          <IconButton 
            onClick={() => navigate("/profile")} 
            sx={styles.backButton}
          >
            <ArrowBackIcon sx={{ color: '#00ffff' }} />
          </IconButton>
          <Typography variant="h5" sx={styles.title}>
            Leaderboard
          </Typography>
          <Box sx={{ width: '40px' }} />
        </Box>

        {loading ? (
          <Box sx={styles.loadingContainer}>
            <CircularProgress sx={{ color: "#00ffff" }} />
          </Box>
        ) : (
          <>
            <TableContainer 
              component={Paper} 
              sx={{
                ...styles.tableContainer,
                maxHeight: '70vh',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0, 15, 63, 0.3)',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#00ffff',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#00cccc',
                },
              }}
              elevation={0}
            >
              <Table sx={{ width: '100%' }} aria-label="leaderboard table">
                <TableHead>
                  <TableRow sx={styles.tableHeaderRow}>
                    <TableCell sx={styles.headerCell} align="center">Rank</TableCell>
                    <TableCell sx={styles.headerCell} align="center">Player</TableCell>
                    <TableCell sx={styles.headerCell} align="center">Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(leaderboardData) && leaderboardData.length > 0 ? (
                    leaderboardData.map((item) => (
                      <TableRow 
                        key={item._id} 
                        sx={{
                          ...styles.tableRow,
                          backgroundColor: item.isCurrentUser ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                          borderLeft: item.isCurrentUser ? '4px solid #00ffff' : 'none',
                          '&:hover': {
                            backgroundColor: item.isCurrentUser 
                              ? 'rgba(0, 255, 255, 0.15)' 
                              : 'rgba(0, 255, 255, 0.05)',
                          },
                        }}
                      >
                        <TableCell sx={styles.bodyCell} align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.rank <= 3 ? (
                              <EmojiEventsIcon sx={{ color: getRankColor(item.rank), mr: 1 }} />
                            ) : null}
                            {item.rank}
                          </Box>
                        </TableCell>
                        <TableCell sx={styles.bodyCell} align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.username || 'Guest'}
                            {item.isCurrentUser && (
                              <Typography 
                                component="span" 
                                sx={{ 
                                  ml: 1, 
                                  fontSize: '0.8rem', 
                                  color: '#00ffff',
                                  fontStyle: 'italic'
                                }}
                              >
                                (You)
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={styles.bodyCell} align="center">
                          {item.ticketBalance || 0}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} sx={styles.noHistoryCell} align="center">
                        No leaderboard data found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Container>
    </Box>
  );
};

const styles = {
  mainContainer: {
    background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bg1}) no-repeat center center`,
    backgroundSize: "cover",
    minHeight: "100vh",
    color: "#fff",
    width: "100%",
    overflowX: "hidden",
    display: "flex",
    alignItems: "flex-start",
    paddingTop: "80px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    position: "relative",
    width: "100%",
    "@media (max-width: 600px)": {
      padding: "0 10px",
    },
  },
  title: {
    color: "#00ffff",
    fontWeight: "bold",
    textAlign: "center",
    flexGrow: 1,
    "@media (max-width: 600px)": {
      fontSize: "1.2rem",
    },
  },
  backButton: {
    color: "#00ffff",
    border: "1px solid #00ffff",
    borderRadius: "50%",
    padding: "8px",
    "&:hover": {
      backgroundColor: "rgba(0, 255, 255, 0.1)",
    },
    "@media (max-width: 600px)": {
      padding: "6px",
    },
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
    width: "100%",
  },
  tableContainer: {
    backgroundColor: "rgba(0, 15, 63, 0.3)",
    backdropFilter: "blur(12px)",
    borderRadius: "12px",
    border: "1px solid rgba(0, 255, 255, 0.2)",
    borderLeft: "none",
    borderRight: "none",
    overflow: "hidden",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    "&::-webkit-scrollbar": {
      display: "none"
    },
    msOverflowStyle: "none",
    scrollbarWidth: "none",
    width: "100%"
  },
  tableHeaderRow: {
    backgroundColor: "rgba(0, 31, 63, 0.5)",
    backdropFilter: "blur(4px)",
  },
  headerCell: {
    color: "#00ffff",
    fontWeight: "bold",
    fontSize: "13px",
    fontFamily: "Inter",
    padding: "16px",
    textAlign: "center",
    "@media (max-width: 600px)": {
      padding: "8px 4px",
      fontSize: "12px",
    },
  },
  tableRow: {
    "&:hover": {
      backgroundColor: "rgba(0, 255, 255, 0.05)",
    },
  },
  bodyCell: {
    color: "white",
    fontSize: "13px",
    fontFamily: "Inter",
    padding: "16px",
    textAlign: "center",
    "@media (max-width: 600px)": {
      padding: "8px 4px",
      fontSize: "12px",
    },
  },
  noHistoryCell: {
    color: "white",
    textAlign: "center",
    padding: "20px",
    fontFamily: "Inter",
  },
};

export default Leaderboardd;
