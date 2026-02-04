import React, { useState, useEffect, useContext } from "react";
import ReactGA from 'react-ga';
import { MyContext } from "../../context/Mycontext";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
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
import SaveAltOutlinedIcon from '@mui/icons-material/SaveAltOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import RequestPageOutlinedIcon from '@mui/icons-material/RequestPageOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { GetWithdrawHistory, encryptSecretKey } from "../../ApiConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import bgimage from "../../assets/bg.jpg";
import SquareLoader from "../SquareLoader/SquareLoader";


const Withdrawhistory = () => {
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data } = useContext(MyContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [count, setCount] = useState();
  // right above your return (inside component):
const startIndex = (page - 1) * Number(limit);


  // google analytics
  useEffect(() => {
    ReactGA.initialize('G-K9GJH23MN3');
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  const fetchWithdrawHistory = async () => {
    setLoading(true);
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(
        `${GetWithdrawHistory}/${userId}?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("upToken")}`,
            clientid: encryptSecretKey(import.meta.env.VITE_SECRET_KEY, new Date().getTime()),
            WebApp: window.Telegram.WebApp.initData,
          },
        }
      );
      if (response.data.withdrawals) {
        const sortedWithdrawals = response.data.withdrawals.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setWithdrawHistory(sortedWithdrawals);
        setTotalPages(response.data.totalPages || 1);
        setLimit(response.data.limit || 10);
        setTotalPending(response.data.AmountToTransfer);
        setTotalWithdrawn(response.data.transferredAmount)
        setCount(response.data.count)
      } else {
        setWithdrawHistory([]);
        setTotalPages(1);
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch withdraw history"
      );
      toast.error(
        error.response?.data?.message || "Failed to fetch withdraw history"
      );
      setWithdrawHistory([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawHistory();
  }, [page, limit]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

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
        position: "relative"
      }}>
      <Box
        sx={{
          marginTop: "12%",
          p: { xs: 2, md: 4 },
        }}
      >
        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          sx={{
            color: "#53e0ff",
            border: "2px solid #53e0ff",
            borderRadius: 2,
            fontWeight: 700,
            fontSize: 10,
            mb: 3,
            px: 2,
            py: 0.5,
            boxShadow: "0 0 8px #53e0ff55",
            "&:hover": { background: "#1a223a" }
          }}
        >
          Back to Profile
        </Button>

        {/* Summary Cards */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 1,
            mb: 1,
          }}
        >
          {/* Card 1 */}
          <Box sx={{
            flex: 1,
            minWidth: 0,
            background: "rgba(10,10,15,0.98)",
            borderRadius: 3,
            border: "1.5px solid #222b3a",
            boxShadow: "0 0 12px #53e0ff22",
            p: 1,
            textAlign: "center",
            animation: 'parallax-slide-left 0.5s ease-out forwards',
          }}>
            <SaveAltOutlinedIcon sx={{ color: "#53e0ff", fontSize: 32, mb: "1px" }} />
            <Typography sx={{ color: "#53e0ff", fontWeight: 700, fontSize: 18 }}>
              {totalWithdrawn}
            </Typography>
            <Typography sx={{ color: "#b0b0b0", fontSize: 12 }}>
              Total Withdrawn
            </Typography>
          </Box>
          {/* Card 2 */}
          <Box sx={{
            flex: 1,
            minWidth: 0,
            background: "rgba(10,10,15,0.98)",
            borderRadius: 3,
            border: "1.5px solid #222b3a",
            boxShadow: "0 0 12px #00ff6a22",
            p: 1,
            textAlign: "center",
            animation: 'parallax-slide-right 0.5s ease-out forwards',
          }}>
            <AccessTimeOutlinedIcon sx={{ color: "#00ff6a", fontSize: 32, mb: "1px" }} />
            <Typography sx={{ color: "#00ff6a", fontWeight: 700, fontSize: 18 }}>
              {totalPending}
            </Typography>
            <Typography sx={{ color: "#b0b0b0", fontSize: 12 }}>
              Pending Amount
            </Typography>
          </Box>
          {/* Card 3 */}
          <Box sx={{
            flex: 1,
            minWidth: 0,
            background: "rgba(10,10,15,0.98)",
            borderRadius: 3,
            border: "1.5px solid #222b3a",
            boxShadow: "0 0 12px #d47fff22",
            p: 1,
            textAlign: "center",
            animation: 'parallax-slide-left 0.5s ease-out forwards',
          }}>
            <RequestPageOutlinedIcon sx={{ color: "#d47fff", fontSize: 32, mb: "1px" }} />
            <Typography sx={{ color: "#d47fff", fontWeight: 700, fontSize: 18 }}>
              {count}
            </Typography>
            <Typography sx={{ color: "#b0b0b0", fontSize: 12 }}>
              Total Requests
            </Typography>
          </Box>
        </Box>

        {/* Withdrawal Records Table */}
        <Box
          sx={{
            background: "rgba(10,10,15,0.98)",
            borderRadius: 3,
            // border: "1.5px solid #53e0ff",
            boxShadow: "0 0 16px #53e0ff33",
            animation: 'parallax-slide-right 0.5s ease-out forwards',
            p: 2,
            mt: 1,
            mb: "100px",
          }}
        >
          <Typography
            sx={{
              color: "#d47fff",
              fontWeight: 700,
              fontSize: 14,
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <RequestPageOutlinedIcon sx={{ color: "#d47fff", fontSize: 22 }} />
            Withdrawal Records
          </Typography>
          <TableContainer component={Paper} sx={{ background: "transparent", boxShadow: "none" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#00b4f5", fontWeight: 600, fontSize: 12, }}>S.No</TableCell>
                  <TableCell sx={{ color: "#00b4f5", fontWeight: 600, fontSize: 12, }}>Date</TableCell>
                  <TableCell sx={{ color: "#00b4f5", fontWeight: 600, fontSize: 12, }}>Amount</TableCell>
                  <TableCell sx={{ color: "#00b4f5", fontWeight: 600, fontSize: 12, }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {withdrawHistory.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={styles.noHistoryCell}
                      align="center"
                    >
                      No Withdrawal history found
                    </TableCell>
                  </TableRow>
                )}
                {withdrawHistory.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ color: "#fff", fontWeight: 500, fontSize: 12, }}>{startIndex + idx + 1}</TableCell>
                    <TableCell sx={{ color: "#b0b0b0", fontWeight: 500, fontSize: 12, }}> {new Date(row.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ color: "#00ff6a", fontWeight: 500, fontSize: 12, }}>{row.amount}</TableCell>
                    <TableCell sx={{ color: "#ffb347", fontWeight: 500, fontSize: 12, }}>
                      {row.status}
                    </TableCell>
                    {/* <TableCell sx={{ color: "#b0b0b0" }}>{row.createdAt}</TableCell> */}
                    {/* <TableCell sx={{ color: "#b0b0b0" }}> {new Date(row.createdAt).toLocaleDateString()}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {withdrawHistory.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 1, mb: 4 }}>
              <Stack spacing={2}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  variant="outlined"
                  shape="rounded"
                  siblingCount={0}
                  boundaryCount={1}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      color: "white",
                      borderColor: "#00ffff",
                      "&.Mui-selected": {
                        backgroundColor: "#041821",
                        color: "white",
                        borderColor: "#00ffff",
                        "&:hover": {
                          backgroundColor: "#041821",
                        },
                      },
                      "&:hover": {
                        backgroundColor: "rgba(0, 255, 255, 0.08)",
                        borderColor: "#00ffff",
                      },
                    },
                    "& .MuiPaginationItem-ellipsis": {
                      color: "white",
                    },
                  }}
                />
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
    </Box>



  );
};

const styles = {
  mainContainer: {
    background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bgimage}) no-repeat center center`,
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
    textAlign: "center",
    fontFamily: "Drag Racing",
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

export default Withdrawhistory;