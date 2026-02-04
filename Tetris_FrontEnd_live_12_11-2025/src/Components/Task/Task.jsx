import React, { useState, useEffect, useContext, useRef } from "react";
import ReactGA from "react-ga";
import { MyContext } from "../../context/Mycontext";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  Card,
  CardMedia,
  CircularProgress,
} from "@mui/material";
import { Telegram } from "@mui/icons-material";
import {
  AllTasks,
  AllAds,
  CompleteTask,
  CompleteAd,
  GetCompletedTasks,
  CompletedAds,
  encryptSecretKey,
} from "../../ApiConfig";
import { useNavigate } from "react-router-dom";
// import bgimage from "../../assets/bg1.png";
import bgimage from "../../assets/bg.jpg";
import coin from "../../assets/coin.png";
import { useUser } from "../../context/UserContext";
import SquareLoader from "../SquareLoader/SquareLoader";
import { TonAdInit, TonAdPopupShow } from "ton-ai-sdk";

export default function TasksPage() {
  const [ads, setAds] = useState([]);
  const [adError, setAdError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTaskType, setSelectedTaskType] = useState("Other Task");
  const [completedTasks, setCompletedTasks] = useState(0);
  const [completedAds, setCompletedAds] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [activeAdId, setActiveAdId] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [activeAdTimers, setActiveAdTimers] = useState({});
  const [adIds, setAdIds] = useState([]);
  const userId = localStorage.getItem("userId");
  const { data } = useContext(MyContext);
  const { updateUserBalance } = useUser();
  const showAd = useRef({});
  const [completedUserAdsToday, setCompletedUserAdsToday] = useState([]);
  const [loadingAds, setLoadingAds] = useState({});   ///new code
  // google analytics
  useEffect(() => {
    // Initialize Google Analytics
    ReactGA.initialize("G-K9GJH23MN3");

    // Track page view
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);
  // Remove hardcoded adIds array and add function to extract numeric adSDKadSDK values
  const extractNumericAdIds = (adsData) => {
    const numericIds = adsData
      .filter((ad) => {
        const isNumeric = !isNaN(Number(ad.adSDK));
        return isNumeric;
      })
      .map((ad) => {
        const numericId = Number(ad.adSDK);
        return numericId;
      });
    return numericIds;
  };
  const [adController, setAdController] = useState();
  useEffect(() => {
    if (window.Adsgram) {
      const controller = window.Adsgram.init({ blockId: "int-11981" });
      setAdController(controller);
    } else {
      console.warn("Adsgram SDK not loaded yet");
    }
  }, []);
  const showAdsgram = () => {
    if (adController) {
      adController.show();
    } else {
      console.warn("AdController is not ready");
    }
  };
  // Initialize ads when ads data changes
  useEffect(() => {
    if (ads.length > 0) {
      const numericAdIds = extractNumericAdIds(ads);
      setAdIds(numericAdIds);

      // Initialize all numeric ad IDs
      numericAdIds.forEach((id) => {
        window
          .initCdTma?.({ id })
          .then((show) => {
            showAd.current[id] = show;
          })
          .catch((e) => console.log(`Error initializing ad ${id}:`, e));
      });
    }
  }, [ads]);

  const VideoAdhandler = (adId) => {
    if (showAd.current[adId]) {
      showAd.current[adId]()
        .then(() => {})
        .catch((err) => {
          console.error(`Error showing ad ${adId}:`, err);
        });
    } else {
      console.error(`Ad ${adId} not initialized`);
    }
  };

  useEffect(() => {
    // Assuming you have access to the Telegram user ID
    const result = TonAdInit({
      appId: "688b0f88d5aef0721bee072c", // Replace with your actual app ID
      telegramUserId: window.Telegram?.WebApp?.initDataUnsafe?.user?.id, // Provide the Telegram user ID here
      debug: false, // Enable debug mode for troubleshooting
    });

    // console.log('TonAdInit result:', result);  // Log the initialization result
  }, []);

  const Adsthree = async () => {
    TonAdPopupShow({
      blockId: "689dbf5a5b7a288f81b16136",
      onAdClick: (ad) => {
        // Triggered when the ad is clicked
        console.log("Adsthree clicked:", ad);
        // Handle logic after ad click, e.g., give rewards or items
        // sendReward()
      },
      onAdError: (error) => {
        // Triggered when ad fails to load
        console.error("Ad error:", error);
      },
    });
  };

  // Fetch data for tasks and ads
  const fetchData = async () => {
    const upToken = localStorage.getItem("upToken");
    if (!upToken) {
      setError("Unauthorized: No authentication token found.");
      setLoading(false);
      return;
    }
    try {
      // First fetch completed tasks
      let completedTaskIds = [];
      try {
        const userId = localStorage.getItem("userId");
        const completedTasksResponse = await axios.get(
          `${GetCompletedTasks}/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("upToken")}`,
              clientid: encryptSecretKey(
                import.meta.env.VITE_SECRET_KEY,
                new Date().getTime()
              ),
              WebApp: window.Telegram.WebApp.initData,
            },
          }
        );

        completedTaskIds =
          completedTasksResponse.data.completedTasks?.map(
            (task) => task.taskId
          ) || [];
      } catch (error) {
        // If no completed tasks found (404) or other error, continue with empty array
        completedTaskIds = [];
      }
      // Then fetch all tasks
      const tasksResponse = await axios.get(`${AllTasks}/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("upToken")}`,
          clientid: encryptSecretKey(
            import.meta.env.VITE_SECRET_KEY,
            new Date().getTime()
          ),
          WebApp: window.Telegram.WebApp.initData,
        },
      });
      // Filter only ACTIVE tasks
      const activeTasks = tasksResponse.data.allTasks.filter(
        (task) => task.status === "ACTIVE"
      );
      // Mark tasks as completed based on the completed tasks data
      const updatedTasks = activeTasks.map((task) => ({
        ...task,
        status: completedTaskIds.includes(task._id) ? "COMPLETED" : task.status,
      }));
      setTasks(updatedTasks);
      // Calculate completed tasks for the selected type
      const completed = updatedTasks.filter(
        (task) =>
          task.taskName === selectedTaskType && task.status === "COMPLETED"
      ).length;
      setCompletedTasks(completed);
      let completedAdPlays = new Map(); // To store played count for each ad
      try {
        const userId = localStorage.getItem("userId");

        const completedAdsResponse = await axios.get(
          `${CompletedAds}/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${upToken}`,
              clientid: encryptSecretKey(
                import.meta.env.VITE_SECRET_KEY,
                new Date().getTime()
              ),
              WebApp: window.Telegram.WebApp.initData,
            },
          }
        );

        setCompletedAds(completedAdsResponse.data.completedAds);
        const completedAds = completedAdsResponse.data.completedAds;
      } catch (error) {
        completedAdPlays = new Map(); // Reset if there's an error or no data
      }
      // Fetch ads
      const adsResponse = await axios.get(`${AllAds}/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("upToken")}`,
          clientid: encryptSecretKey(
            import.meta.env.VITE_SECRET_KEY,
            new Date().getTime()
          ),
          WebApp: window.Telegram.WebApp.initData,
        },
      });
      const adsData =
        adsResponse.data.data || adsResponse.data.ads || adsResponse.data;
      if (Array.isArray(adsData)) {
        const updatedAds = adsData.map((ad) => {
          const playedCount = completedAdPlays.get(ad._id) || 0;
          const maxPlays = ad.adCount || 1;
          const remainingPlays = maxPlays - playedCount;
          return {
            ...ad,
            adSDK: ad.adSDK,
            playedCount: playedCount,
            maxPlays: maxPlays,
            remainingPlays: remainingPlays,
            canPlay: remainingPlays > 0,
            status: remainingPlays <= 0 ? "COMPLETED" : "pending",
          };
        });
        setAds(updatedAds);
      } else {
        setAdError("Invalid ads data format received from server");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch data.");
      setAdError("Failed to fetch ads");
    } finally {
      // await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    }
  };
  const completeTask = async (taskId) => {
    const upToken = localStorage.getItem("upToken");
    const userId = localStorage.getItem("userId");
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;
    try {
      // Make API call first
      const response = await axios.post(
        `${CompleteTask}/${userId}`,
        {
          taskId: task._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("upToken")}`,
            clientid: encryptSecretKey(
              import.meta.env.VITE_SECRET_KEY,
              new Date().getTime()
            ),
            WebApp: window.Telegram.WebApp.initData,
          },
        }
      );
      // Wait for the API response before updating UI
      if (response.data.success || response.status === 200) {
        // Update tasks state with the new status
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t._id === taskId ? { ...t, status: "COMPLETED" } : t
          )
        );
        // Update completed tasks count
        setCompletedTasks((prevCount) => {
          const newCount = tasks.filter(
            (t) =>
              (t._id === taskId || t.status === "COMPLETED") &&
              t.taskName === selectedTaskType
          ).length;
          return newCount;
        });
        // Update global balance state
        // await updateUserBalance();
        // Dispatch event for legacy components
        window.dispatchEvent(
          new CustomEvent("pointsUpdated", {
            detail: { points: task.rewardPoints },
          })
        );
        // Refresh completed tasks from server
        // await fetchCompletedTasks(); // <-- Removed this line
        return task.rewardPoints;
      } else {
        throw new Error("Task completion failed");
      }
    } catch (error) {
      console.error("Error completing task:", error);
      // Revert any UI changes if the API call failed
      // await fetchCompletedTasks();
      return 0;
    }
  };

  const completeAd = async (adId) => {
    const userId = localStorage.getItem("userId");
    const upToken = localStorage.getItem("upToken");
    const ad = ads.find((a) => a._id === adId);

    if (!ad) {
      console.error("Ad not found:", adId);
      return 0;
    }

    try {
      const response = await axios.post(
        `${CompleteAd}/${userId}`,
        { adId: ad._id },
        {
          headers: {
            Authorization: `Bearer ${upToken}`,
            clientid: encryptSecretKey(
              import.meta.env.VITE_SECRET_KEY,
              new Date().getTime()
            ),
            WebApp: window.Telegram.WebApp.initData,
            // WebApp : `query_id=AAEN1jQhAAAAAA3WNCHJvyPW&user=%7B%22id%22%3A557110797%2C%22first_name%22%3A%22Thirupathi%22%2C%22last_name%22%3A%22%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FMDVgokSUWbom45YPslzjXJKmWFXtvnYjLt8HqWgRtm4.svg%22%7D&auth_date=1751888331&signature=BvVJfVQV_SdORYAuBreZpA1TAH83DdGtjt9rD-ZtZCygza_XKBTAokFTKo1jQyHNz_AC4xDHmx_pBeJ_7ejWAw&hash=260eac2d17ecc241b69532b250f6fa3952438ee490bfc7f799e18ac91842488f`,
          },
        }
      );

      if (response.data.success || response.status === 200) {
        // Filter completed ads for the current day and match adId
        const today = new Date();
        const completedUserAdsToday = completedAds.filter((ad) => {
          if (!ad.completionTime || !ad.adId) return false;
          const completionDate = new Date(ad.completionTime);
          return (
            completionDate.getFullYear() === today.getFullYear() &&
            completionDate.getMonth() === today.getMonth() &&
            completionDate.getDate() === today.getDate() &&
            ad.adId === adId
          );
        });

        // Calculate ad reward based on completion
        let adReward = 0;
        if (completedUserAdsToday.length < ad.adCount) {
          adReward = ad.rewardPoints;
        }

        // Dispatch event for legacy components
        window.dispatchEvent(
          new CustomEvent("pointsUpdated", {
            detail: { points: adReward },
          })
        );

        // Refresh data after completing ad
        await fetchData();

        return adReward;
      }
    } catch (error) {
      console.error("Error completing ad:", error);
      return 0; // Return 0 in case of an error
    }
  };

  useEffect(() => {
    fetchData();
    const initialAdTimer = setTimeout(() => {
      if (ads.length > 0 && ads[0].adSDK) {
        try {
          if (ads[0].adSDK.includes("(") && ads[0].adSDK.includes(")")) {
            new Function(ads[0].adSDK)();
          } else if (typeof window[ads[0].adSDK] === "function") {
            window[ads[0].adSDK]();
          }
        } catch (e) {
          console.error("Initial ad error:", e);
        }
      }
    }, 5000);
    return () => clearTimeout(initialAdTimer);
  }, []);
  // Handle task countdown
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && activeTaskId) {
      completeTask(activeTaskId);
      setActiveTaskId(null);
      // Show ad after task completion
      const currentAd = ads.find((ad) => ad.adSDK);
      if (currentAd?.adSDK) {
        try {
          if (currentAd.adSDK.includes("(") && currentAd.adSDK.includes(")")) {
            new Function(currentAd.adSDK)();
          } else if (typeof window[currentAd.adSDK] === "function") {
            window[currentAd.adSDK]();
          }
        } catch (e) {
          console.error("Post-task ad error:", e);
        }
      }
    }
    return () => clearTimeout(timer);
  }, [countdown, activeTaskId]);
  // Handle ad countdown
  useEffect(() => {
    const timers = {};
    Object.entries(activeAdTimers).forEach(([adId, timerData]) => {
      if (!timerData) return;
      if (timerData.remaining > 0) {
        timers[adId] = setTimeout(() => {
          setActiveAdTimers((prev) => {
            const currentTimer = prev[adId];
            if (!currentTimer) return prev;
            const newRemaining = Math.max(0, currentTimer.remaining - 1);

            if (newRemaining === 0) {
              //   // Complete the ad when timer reaches 0
              //   completeAd(adId).catch(error => {
              //     console.error(`Error completing ad ${adId}:`, error);
              // });

              // Remove timer from state
              const newTimers = { ...prev };
              delete newTimers[adId];
              return newTimers;
            }
            return {
              ...prev,
              [adId]: {
                ...currentTimer,
                remaining: newRemaining,
              },
            };
          });
        }, 1000);
      }
    });
    // Cleanup function
    return () => {
      Object.values(timers).forEach((timer) => clearTimeout(timer));
    };
  }, [activeAdTimers]);
  // Add new useEffect for page visibility
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        await fetchData();

        // Show ad when page becomes visible
        const currentAd = ads.find((ad) => ad.adSDK);
        if (currentAd?.adSDK) {
          try {
            if (
              currentAd.adSDK.includes("(") &&
              currentAd.adSDK.includes(")")
            ) {
              new Function(currentAd.adSDK)();
            } else if (typeof window[currentAd.adSDK] === "function") {
              window[currentAd.adSDK]();
            }
          } catch (e) {
            console.error("Visibility ad error:", e);
          }
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  useEffect(() => {
    if (tasks.length > 0) {
      const completed = tasks.filter(
        (task) =>
          task.taskName === selectedTaskType && task.status === "COMPLETED"
      ).length;
      setCompletedTasks(completed);
    }
  }, [selectedTaskType, tasks]);
  // Add useEffect for periodic refresh with shorter interval
  useEffect(() => {
    // Initial fetch
    fetchData();
    // Resume ad timer from localStorage if present
    const savedAdTimer = localStorage.getItem("activeAdTimers");
    if (savedAdTimer) {
      const parsedTimers = JSON.parse(savedAdTimer);
      const currentTime = Date.now();

      // Calculate remaining time for each timer
      const updatedTimers = Object.entries(parsedTimers).reduce(
        (acc, [adId, timerData]) => {
          const elapsedTime = Math.floor(
            (currentTime - timerData.startTime) / 1000
          );
          const remainingTime = Math.max(0, timerData.duration - elapsedTime);

          // Only keep timers that still have time remaining
          if (remainingTime > 0) {
            acc[adId] = {
              ...timerData,
              remaining: remainingTime,
            };
          }
          return acc;
        },
        {}
      );
      // Update state with calculated timers
      setActiveAdTimers(updatedTimers);

      // Update localStorage with cleaned up timers
      if (Object.keys(updatedTimers).length === 0) {
        localStorage.removeItem("activeAdTimers");
      } else {
        localStorage.setItem("activeAdTimers", JSON.stringify(updatedTimers));
      }
    }
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        // fetchCompletedTasks();
      }
    }, 5000); // Refresh every 5 seconds when page is visible
    return () => clearInterval(refreshInterval);
  }, []);
  const filteredTasks = tasks.filter(
    (task) => task.taskName === selectedTaskType
  );
  const totalTasks = filteredTasks.length;
  const completedCount = filteredTasks.filter(
    (task) => task.status === "COMPLETED"
  ).length;
  const progress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
  const handleTaskClick = async (task) => {
    if (task.status === "COMPLETED") return;
    // Open the Sitelink in a new tab
    if (task.siteLink) {
      window.open(task.siteLink, "_blank");
    }
    // For Main Tasks and String Tasks, complete immediately
    if (task.taskName === "Main Task" || task.taskName === "String Task") {
      await completeTask(task._id);
    } else {
      // For Other Tasks, show countdown
      setActiveTaskId(task._id);
      setCountdown(15);
    }
  };
  const adhandler = () => {
    const adexiumWidget = new window.AdexiumWidget({
      wid: "ec0f31d2-f59d-43f3-bd5a-b5ad4733c585",
      adFormat: "interstitial", // try 'rewarded' or 'banner' too
      firstAdImpressionIntervalInSeconds: 0,
      adImpressionIntervalInSeconds: 0,
    });
    adexiumWidget.init();
  };
  const handleAdClick = async (ad) => {
    if (activeAdTimers[ad._id]) {
      return;
    }

    try {
      // Set loading state for this specific ad
      setLoadingAds((prev) => ({ ...prev, [ad._id]: true }));  //new code

      if (adIds.includes(Number(ad.adSDK))) {
        VideoAdhandler(Number(ad.adSDK));
      } else if (ad.adSDK === "int-11981") {
        showAdsgram();
      } else if (ad.adSDK === "sonar") {
        window.Sonar.show({ adUnit: "stringdrive" });
      } else if (ad.adSDK === "689dbf5a5b7a288f81b16136") {
        Adsthree();
        console.log("Ads3 function called");
      } else {
        if (
          typeof ad.adSDK === "string" &&
          ad.adSDK.includes("(") &&
          ad.adSDK.includes(")")
        ) {
          try {
            new Function(ad.adSDK)();
          } catch (e) {
            console.error("Error executing adSDK string:", e);
          }
        } else if (typeof window[ad.adSDK] === "function") {
          try {
            window[ad.adSDK]();
          } catch (e) {
            console.error("Error calling AdSDK function by name:", e);
          }
        } else {
          console.warn(
            `AdSDK '${ad.adSDK}' is not a valid function name or executable string.`
          );
        }
      }

      // Complete the ad and fetch reward if applicable
      const reward = await completeAd(ad._id);
      if (reward > 0) {
        await fetchData();
      }

      // Set up the countdown timer for this ad
      const timerInMinutes =
        ad.AdTimer_InMinutes !== undefined ? ad.AdTimer_InMinutes : 0.5;
      const timerInSeconds = Math.floor(timerInMinutes * 60);

      // Create a new timer entry
      const newTimer = {
        startTime: Date.now(),
        duration: timerInSeconds,
        remaining: timerInSeconds,
      };

      // Update active timers state (allows multiple concurrent timers)
      setActiveAdTimers((prev) => ({
        ...prev,
        [ad._id]: newTimer,
      }));

      // Save to localStorage (supports persistence across refreshes/navigation)
      const savedTimers = JSON.parse(
        localStorage.getItem("activeAdTimers") || "{}"
      );
      savedTimers[ad._id] = newTimer;
      localStorage.setItem("activeAdTimers", JSON.stringify(savedTimers));
    } catch (error) {
      console.error("Error handling ad click:", error);

      // Still set up the timer even if there was an error
      const timerInMinutes =
        ad.AdTimer_InMinutes !== undefined ? ad.AdTimer_InMinutes : 0.5;
      const timerInSeconds = Math.floor(timerInMinutes * 60);

      const newTimer = {
        startTime: Date.now(),
        duration: timerInSeconds,
        remaining: timerInSeconds,
      };

      setActiveAdTimers((prev) => ({
        ...prev,
        [ad._id]: newTimer,
      }));

      const savedTimers = JSON.parse(
        localStorage.getItem("activeAdTimers") || "{}"
      );
      savedTimers[ad._id] = newTimer;
      localStorage.setItem("activeAdTimers", JSON.stringify(savedTimers));
    } finally {   //new code
      setLoadingAds((prev) => {
        const newState = { ...prev };
        delete newState[ad._id];
        return newState;
      });
    }
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
        display: "flex",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bgimage}) no-repeat center center`,
        // backgroundColor: "##161f2f",
        alignItems: "center",
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
        gap: { xs: "15px", sm: "20px" },
      }}
    >
      {/* <SquareLoader /> */}
      {/* {loading && (
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
          <SquareLoader />
        </Box>
      )} */}

      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: "600px" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
          margin: 0,
          marginTop: { xs: "50px", sm: "70px" },
          marginBottom: { xs: "70px", md: "80px" },
        }}
      >
        {/* Header and Progress Bar */}
        {selectedTaskType === "Other Task" && (
          <>
            <Typography
              variant="h4"
              sx={{
                color: "#0bf",
                // fontWeight: "bold",
                textAlign: "center",
                fontSize: { xs: "1.5rem", sm: "2rem" },
                fontFamily: "Techno Race Italic",
                margin: 0,
                pt: { xs: 1, sm: 2 },
              }}
            >
              Watch Ads
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                width: "100%",
                height: { xs: 8, sm: 10 },
                borderRadius: "5px",
                backgroundColor: "#c6f",
                "& .MuiLinearProgress-bar": { backgroundColor: "#41B3C8" },
                margin: 0,
              }}
            />
          </>
        )}
        {/* Header and Progress Bar */}
        {selectedTaskType === "Main Task" && (
          <>
            <Typography
              variant="h4"
              sx={{
                color: "#0bf",
                // fontWeight: "bold",
                textAlign: "center",
                fontSize: { xs: "1.5rem", sm: "2rem" },
                fontFamily: "Techno Race Italic",
                margin: 0,
                pt: { xs: 1, sm: 2 },
              }}
            >
              Task Completion {completedTasks}/{totalTasks}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                width: "100%",
                height: { xs: 8, sm: 10 },
                borderRadius: "5px",
                backgroundColor: "#c6f",
                "& .MuiLinearProgress-bar": { backgroundColor: "#4caf50" },
                margin: 0,
              }}
            />
          </>
        )}
        {/* Header and Progress Bar */}
        {selectedTaskType === "String Task" && (
          <>
            <Typography
              variant="h4"
              sx={{
                color: "#0bf",
                // fontWeight: "bold",
                textAlign: "center",
                fontSize: { xs: "1.5rem", sm: "2rem" },
                fontFamily: "Techno Race Italic",
                margin: 0,
                pt: { xs: 1, sm: 2 },
              }}
            >
              Task Completion {completedTasks}/{totalTasks}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                width: "100%",
                height: { xs: 8, sm: 10 },
                borderRadius: "5px",
                backgroundColor: "#c6f",
                "& .MuiLinearProgress-bar": { backgroundColor: "#4caf50" },
                margin: 0,
              }}
            />
          </>
        )}
        {/* Task Type Selector Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: { xs: "8px", sm: "12px" },
            margin: 0,
            width: { xs: "95%", sm: "90%" },
            maxWidth: "100%",
            height: { xs: "60px", sm: "73px" },
            padding: { xs: "8px", sm: "10px" },
            borderRadius: "10px 3px 10px 3px",
          }}
        >
          <Button
            fullWidth
            variant="contained"
            sx={{
              background:
                selectedTaskType === "Other Task"
                  ? "linear-gradient(90deg, #1faeff 0%, #af73ff 100%)"
                  : "#09090b",
              border:
                selectedTaskType === "Other Task" ? "none" : "3px solid #c6f",
              borderRadius: "6px",
              padding: { xs: "8px 5px", sm: "10px 7px" },
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
              color: "#c6f",
              gap: "10px",
              py: 1.5,
              margin: 0,
              "&:hover": {
                background: "linear-gradient(90deg, #1faeff 0%, #af73ff 100%)",
                borderRadius: "6px",
                border: "none",
                color: "#09090b",
              },
            }}
            onClick={() => setSelectedTaskType("Other Task")}
          >
            Ads
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{
              background:
                selectedTaskType === "Main Task"
                  ? "linear-gradient(90deg, #1faeff 0%, #af73ff 100%)"
                  : "#09090b",
              border:
                selectedTaskType === "Main Task" ? "none" : "3px solid #c6f",
              borderRadius: "6px",
              padding: "10px 7px 10px 7px",
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
              color: "#c6f",
              gap: "10px",
              py: 1.5,
              margin: 0,
              "&:hover": {
                background: "linear-gradient(90deg, #1faeff 0%, #af73ff 100%)",
                borderRadius: "6px",
                border: "none",
                color: "#09090b",
              },
            }}
            onClick={() => setSelectedTaskType("Main Task")}
          >
            MAIN
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{
              background:
                selectedTaskType === "String Task"
                  ? "linear-gradient(90deg, #1faeff 0%, #af73ff 100%)"
                  : "#09090b",
              border:
                selectedTaskType === "String Task" ? "none" : "3px solid #c6f",
              borderRadius: "6px",
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
              color: "#c6f",
              gap: 6,
              py: 1.5,
              margin: 0,
              "&:hover": {
                background: "linear-gradient(90deg, #1faeff 0%, #af73ff 100%)",
                borderRadius: "6px",
                border: "none",
                color: "#09090b",
              },
            }}
            onClick={() => setSelectedTaskType("String Task")}
          >
            STRING
          </Button>
        </Box>
        {/* Show only the relevant section based on selectedTaskType */}
        {selectedTaskType === "Other Task" ? (
          <Box
            sx={{
              // backgroundColor: "#212121",
              borderRadius: 2,
              width: "100%",
              maxWidth: "100%",
              margin: 0,
              mb: 2,
            }}
          >
            <List
              sx={{
                padding: { xs: "8px 5px", sm: "10px 7px" },
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                color: "#3A9FD0",
                gap: { xs: "8px", sm: "10px" },
                py: { xs: 1, sm: 1.5 },
                margin: 0,
              }}
            >
              {ads.map((ad, index) => (
                <React.Fragment key={ad._id + selectedTaskType}>
                  {/* Standard Card Wrapper */}
                  <Card
                    key={ad._id + selectedTaskType}
                    sx={{
                      backgroundColor: "#09090b",
                      animation:
                        index % 2 === 0
                          ? "parallax-slide-left 0.5s ease-out forwards"
                          : "parallax-slide-right 0.5s ease-out forwards",
                      willChange: "transform, opacity",
                      borderRadius: "12px",
                      boxShadow: 3,
                      mb: 2,
                      border: "3px solid #345282",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "#41B3C8",
                      },
                    }}
                  >
                    {/* Inner Content Box */}
                    <Card
                      sx={{
                        backgroundColor: "#09090b",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "none",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#09090b",
                        },
                      }}
                    >
                      <ListItem
                        sx={{
                          padding: { xs: "8px 5px", sm: "10px 7px" },
                          fontFamily: "Inter",
                          fontWeight: 600,
                          fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                          color: "#3A9FD0",
                          gap: { xs: "8px", sm: "10px" },
                          py: { xs: 1, sm: 1.5 },
                          margin: 0,
                          position: "relative",
                        }}
                        onClick={() => handleAdClick(ad)}
                      >
                        {/* Countdown Overlay */}
                        {activeAdTimers[ad._id] && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: "rgba(0,0,0,0.5)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 1,
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                fontSize: { xs: "1.5rem", sm: "2rem" },
                                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                              }}
                            >
                              {activeAdTimers[ad._id].remaining}s
                            </Typography>
                          </Box>
                        )}
                        {/* Loading Overlay - Add this section */}  
                        {loadingAds[ad._id] && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: "rgba(0,0,0,0.7)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 1,
                            }}
                          >
                            <CircularProgress
                              size={40}
                              sx={{ color: "#41B3C8" }}
                            />
                          </Box>
                        )}
                        {/* Image Wrapper */}
                        <Box
                          sx={{
                            width: { xs: "50px", sm: "60px" },
                            height: { xs: "50px", sm: "60px" },
                            minWidth: { xs: "50px", sm: "60px" },
                            backgroundColor: "#09090b",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            p: "3px",
                          }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              backgroundColor: "#09090b",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                            }}
                          >
                            <CardMedia
                              component="img"
                              alt={ad.adName}
                              image={ad.adImage}
                              sx={{
                                objectFit: "contain",
                                width: "100%",
                                height: "100%",
                                maxHeight: { xs: "50px", sm: "60px" },
                                maxWidth: { xs: "50px", sm: "60px" },
                              }}
                            />
                          </Box>
                        </Box>
                        {/* Ad Name */}
                        <Typography
                          variant="body1"
                          sx={{
                            color: "white",
                            fontWeight: "bold",
                            flexGrow: 1,
                            textAlign: "center",
                            zIndex: 0,
                            px: 2,
                          }}
                        >
                          {ad.adName}
                        </Typography>
                        {/* Points Button */}
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor: "#09090b",
                            // border: "3px solid #345282",
                            borderRadius: "6px",
                            padding: "10px 7px",
                            fontFamily: "Inter",
                            fontWeight: 600,
                            fontSize: {
                              xs: "1rem",
                              sm: "1.25rem",
                              md: "1.5rem",
                            },
                            color: "#3A9FD0",
                            gap: "10px",
                            "&:hover": {
                              backgroundColor: "#09090b",
                              // border: "3px solid #345282",
                            },
                            py: 1.5,
                            margin: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "110px",
                          }}
                        >
                          <img
                            src={coin}
                            alt="coin"
                            style={{ width: "24px", marginRight: "8px" }}
                          />
                          {ad.rewardPoints}
                        </Button>
                      </ListItem>
                    </Card>
                  </Card>
                  {/* {index !== ads.length - 1 && (
                    <Divider
                      sx={{ backgroundColor: "rgba(255,255,255,0.2)", my: 1 }}
                    />
                  )} */}
                </React.Fragment>
              ))}
            </List>
          </Box>
        ) : (
          <Box
            sx={{
              // backgroundColor: "#212121",
              borderRadius: 2,
              width: "100%",
              maxWidth: "100%",
              margin: 0,
              mb: 2,
            }}
          >
            <List
              sx={{
                padding: { xs: "8px 5px", sm: "10px 7px" },
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                color: "#3A9FD0",
                gap: { xs: "8px", sm: "10px" },
                py: { xs: 1, sm: 1.5 },
                margin: 0,
              }}
            >
              {filteredTasks.map((task, index) => (
                <React.Fragment key={task._id + selectedTaskType}>
                  {/* Standard Card Wrapper */}
                  <Card
                    key={task._id + selectedTaskType}
                    sx={{
                      animation:
                        index % 2 === 0
                          ? "parallax-slide-left 0.5s ease-out forwards"
                          : "parallax-slide-right 0.5s ease-out forwards",
                      willChange: "transform, opacity",
                      backgroundColor: "#09090b",
                      borderRadius: "12px",
                      boxShadow: 3,
                      mb: 2,
                      border:
                        task.status === "COMPLETED"
                          ? "3px solid #4caf50"
                          : "3px solid #345282", // Green border if claimed
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "#09090b",
                      },
                    }}
                  >
                    {/* Inner Content Box */}
                    <Card
                      sx={{
                        backgroundColor: "#09090b",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "none",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#09090b",
                        },
                      }}
                    >
                      <ListItem
                        sx={{
                          padding: { xs: "8px 5px", sm: "10px 7px" },
                          fontFamily: "Inter",
                          fontWeight: 600,
                          fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                          color: "#3A9FD0",
                          gap: { xs: "8px", sm: "10px" },
                          py: { xs: 1, sm: 1.5 },
                          margin: 0,
                          position: "relative",
                        }}
                        onClick={() =>
                          task.status !== "COMPLETED" && handleTaskClick(task)
                        }
                      >
                        {/* Countdown Overlay */}
                        {activeTaskId === task._id && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: "rgba(0,0,0,0.5)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 1,
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                position: "absolute",
                                color: "white",
                                fontWeight: "bold",
                              }}
                            >
                              {countdown}s
                            </Typography>
                          </Box>
                        )}
                        {/* Image Wrapper */}
                        <Box
                          sx={{
                            width: { xs: "50px", sm: "60px" },
                            height: { xs: "50px", sm: "60px" },
                            minWidth: { xs: "50px", sm: "60px" },
                            // backgroundColor: "#345282",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            p: "3px",
                          }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              backgroundColor: "#09090b",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                            }}
                          >
                            <CardMedia
                              component="img"
                              alt={task.taskName}
                              image={task.taskImage}
                              sx={{
                                objectFit: "contain",
                                width: "100%",
                                height: "100%",
                                maxHeight: { xs: "50px", sm: "60px" },
                                maxWidth: { xs: "50px", sm: "60px" },
                              }}
                            />
                          </Box>
                        </Box>
                        {/* Task Name */}
                        <Typography
                          variant="body1"
                          sx={{
                            color: "white",
                            fontWeight: 1000,
                            fontFamily: "Inter",
                            fontSize: {
                              xs: "1rem",
                              sm: "1.25rem",
                              md: "1.5rem",
                            },
                            flexGrow: 1,
                            textAlign: "center",
                            zIndex: 0,
                            px: { xs: 1, sm: 2 },
                          }}
                        >
                          {task.subTask}
                        </Typography>
                        {/* Points Button */}
                        {task.status === "COMPLETED" ? (
                          <Box
                            sx={{
                              backgroundColor: "#09090b",
                              borderRadius: "6px",
                              padding: { xs: "8px 5px", sm: "10px 7px" },
                              fontFamily: "Inter",
                              fontSize: {
                                xs: "1rem",
                                sm: "1.25rem",
                                md: "1.5rem",
                              },
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              // border: "3px solid #345282",
                              animation: "glow 1.5s infinite alternate",
                              minWidth: { xs: "90px", sm: "110px" },
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{ color: "#4caf50", fontWeight: "bold" }} // Green color for CLAIMED
                            >
                              CLAIMED
                            </Typography>
                          </Box>
                        ) : (
                          <Button
                            variant="contained"
                            sx={{
                              backgroundColor: "#09090b",
                              // border: "3px solid #345282",
                              borderRadius: "6px",
                              padding: { xs: "8px 5px", sm: "10px 7px" },
                              fontFamily: "Inter",
                              fontWeight: 600,
                              fontSize: {
                                xs: "1rem",
                                sm: "1.25rem",
                                md: "1.5rem",
                              },
                              gap: "10px",
                              "&:hover": {
                                backgroundColor: "#152841",
                                // border: "3px solid #345282",
                              },
                              py: 1.5,
                              margin: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: { xs: "90px", sm: "110px" },
                            }}
                          >
                            <img
                              src={coin}
                              alt="coin"
                              style={{ width: "24px", marginRight: "8px" }}
                            />
                            {task.rewardPoints}
                          </Button>
                        )}
                      </ListItem>
                    </Card>
                  </Card>
                  {/* {index !== filteredTasks.length - 1 && (
                    <Divider
                      sx={{ backgroundColor: "rgba(255,255,255,0.2)", my: 1 }}
                    />
                  )} */}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </Box>
  );
}
