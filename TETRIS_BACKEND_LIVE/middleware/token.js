const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema"); 
const dotenv = require("dotenv").config();
const CryptoJS = require("crypto-js");
const util = require("util");
const verifyToken = util.promisify(jwt.verify);
const crypto = require("crypto");
const STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const ERROR_MESSAGE = {
  FORBIDDEN: "You do not have permission to access this resource.",
  UNAUTHORIZED: "Invalid or expired token.",
  NOT_FOUND: "User not found.",
  INTERNAL_SERVER_ERROR: "Something went wrong. Please try again later.",
};

// Function to decrypt data
const decryptionData = (ciphertext) => {
    var bytes  = CryptoJS.AES.decrypt(ciphertext, process.env.YOUR_SECRET_KEY);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;    
};

const decryptionDataAdmin = (ciphertext) => {
    var bytes  = CryptoJS.AES.decrypt(ciphertext, process.env.YOUR_SECRET_KEY_ADMIN);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;    
};

// const verifyTimestamp = (timestamp) => {
//   const currentTime = new Date().getTime();
//   console.log(typeof currentTime, "currentTime",typeof timestamp, "timestamp");
//   const timeDifference = Math.abs(currentTime - (timestamp));
//   const validTimeWindow = 10000; // 5 seconds
//   console.log(timeDifference, validTimeWindow);

//   if (timeDifference <= validTimeWindow) {
//     return true;
//   }
//   return false;
// };

// const validateClientId = asyncHandler(async (req, res, next) => {
//   try {
//     console.log( req.headers," req.headers");

//     if (!req.headers.clientid) {
//       return res.status(404).json({ error: "ClientId Not Found" });
//     }

//     const decodedToken = decryptionData(req.headers.clientid);  // Correctly call decryptionData function
//     console.log(decodedToken, "decodedToken");

//     if (!decodedToken) {
//       return res.status(400).json({ error: "Invalid Client ID" });
//     }

//     console.log(process.env.YOUR_SECRET_KEY, "process.env.YOUR_SECRET_KEY", decodedToken.split("&TimeStamp=")[0]);

//     if (decodedToken.split("&TimeStamp=")[0] != process.env.YOUR_SECRET_KEY) {
//       return res.status(401).json({ message: "Invalid key" });
//     }

//     const timestamp = decodedToken.split("&TimeStamp=")[1];
//     console.log(timestamp, "timestamp");

//     if (!timestamp) {
//       return res.status(404).json({ message: "Invalid API call" });
//     }

//     if (verifyTimestamp(timestamp)) {
//       next();
//     } else {
//       return res.status(501).json({ message: "ClientId has expired" });
//     }
//   } catch (error) {
//     console.log(error, "error");
//     return next(error);
//   }
// });


// Middleware to validate the JWT token


const verifyTimestamp = (timestamp) => {
  const currentTime = new Date().getTime();
  console.log(typeof currentTime, "currentTime", typeof timestamp, "timestamp");
  const timeDifference = Math.abs(currentTime - (timestamp));
  const validTimeWindow = 5000; // 5 seconds
  console.log(timeDifference, validTimeWindow);

  if (timeDifference <= validTimeWindow) {
    return true;
  }
  return false;
};



// const validateTelegramHash = asyncHandler(async (req, res, next) => {
//   try {
//     // Extract the raw query from the request
//     const rawQuery = req.headers.webapp; // Assuming raw query is passed in the request headers

//     // console.log(rawQuery, "rawQuery");
    

//     if (!rawQuery) {
//       return res.status(STATUS_CODE.BAD_REQUEST).json({ error: "Raw query not provided" });
//     }

//     // Step 1: Split the raw query string by '&' into key=value pairs
//     const keyValuePairs = rawQuery.split('&');

//     // console.log(keyValuePairs, "keyValuePairs");
    
    

//     // Step 2: Filter out the 'hash' param
//     const filteredPairs = keyValuePairs.filter(pair => !pair.startsWith('hash='));

//     // console.log(filteredPairs, "filteredPairs");
    
    

//     const receivedHash = keyValuePairs.find(pair => pair.startsWith('hash='))?.split('=')[1];
//     if (!receivedHash) {
//       return res.status(STATUS_CODE.BAD_REQUEST).json({ error: "Hash parameter missing" });
//     }

//     // console.log(receivedHash, "receivedHash");
    

//     // Step 3: Map each key=value pair into `${key}=${decodeURIComponent(value)}` format
//     const decodedPairs = filteredPairs.map(pair => {
//       const [key, value] = pair.split('=');
//       return `${key}=${decodeURIComponent(value)}`;
//     });

//     // console.log(decodedPairs, "decodedPairs");
    

//     // Step 4: Sort and join with newline
//     const dataCheckString = decodedPairs.sort().join('\n');

//     // console.log(dataCheckString, "dataCheckString");
    

//     // Step 5: Create secret key: HMAC-SHA256 of 'WebAppData' using your bot token as key
//     const secretKey = crypto
//       .createHmac('sha256', 'WebAppData') // 'WebAppData' is the key here
//       .update(process.env.TELEGRAM_BOT_TOKEN) // your bot token
//       .digest();

//       // console.log(secretKey, "secretKey");
      

//     // Step 6: Create HMAC-SHA256 of dataCheckString using the secret key from step 5
//     const computedHash = crypto
//       .createHmac('sha256', secretKey)
//       .update(dataCheckString)
//       .digest('hex');

//       // console.log(computedHash, "computedHash");
      

//     // Step 7: Compare hashes securely (case-insensitive compare)
//     const isValid = computedHash === receivedHash;

//     // console.log(isValid, "isValid");
    



//     if (isValid) {
//       // If valid, proceed with the request
//       // console.log("Valid hash, proceeding with request");
      
//       next();
//     } else {
//       // If invalid, return an error response
//             // console.log("Invalid hash, returning error response");

//       return res.status(STATUS_CODE.FORBIDDEN).json({ error: "Invalid hash" });
      
//     }

//   } catch (error) {
//     console.error(error, "error");
//     return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGE.INTERNAL_SERVER_ERROR });
//   }
// });




// const validateTelegramHash = asyncHandler(async (req, res, next) => {
//   try {
//     // Extract the raw query from the request
//     const rawQuery = req.headers.webapp; // Assuming raw query is passed in the request headers
//     if (!rawQuery) {
//       return res
//         .status(STATUS_CODE.BAD_REQUEST)
//         .json({ error: "Raw query not provided" });
//     }
//     // Step 1: Split the raw query string by '&' into key=value pairs
//     const keyValuePairs = rawQuery.split("&");
 
//     // Step 2: Filter out the 'hash' param
//     const filteredPairs = keyValuePairs.filter(
//       (pair) => !pair.startsWith("hash=")
//     );
 
//     const receivedHash = keyValuePairs
//       .find((pair) => pair.startsWith("hash="))
//       ?.split("=")[1];
//     if (!receivedHash) {
//       return res
//         .status(STATUS_CODE.BAD_REQUEST)
//         .json({ error: "Hash parameter missing" });
//     }
 
//     // Step 3: Map each key=value pair into `${key}=${decodeURIComponent(value)}` format
//     const decodedPairs = filteredPairs.map((pair) => {
//       const [key, value] = pair.split("=");
//       return `${key}=${decodeURIComponent(value)}`;
//     });
 
//     // Step 4: Sort and join with newline
//     const dataCheckString = decodedPairs.sort().join("\n");
 
//     // Extract the user field from dataCheckString
//     const userField = decodedPairs.find((pair) => pair.startsWith("user="));
//     if (userField) {
//       const userValue = userField.split("=")[1]; // Extract the value of 'user' parameter
//       // console.log("dataCheckString.user", JSON.parse(userValue)); // Log the parsed user data
//       req.userData = JSON.parse(userValue);
//     } else {
//       console.log("User field not found");
//     }
 
//     const envToken =
//       req.route.path === "/swlogin"
//         ? process.env.WITHDRAW_BOT_TOKEN
//         : process.env.TELEGRAM_BOT_TOKEN;
 
//     // Step 5: Create secret key: HMAC-SHA256 of 'WebAppData' using your bot token as key
//     const secretKey = crypto
//       .createHmac("sha256", "WebAppData") // 'WebAppData' is the key here
//       .update(envToken) // your bot token
//       .digest();
 
//     // Step 6: Create HMAC-SHA256 of dataCheckString using the secret key from step 5
//     const computedHash = crypto
//       .createHmac("sha256", secretKey)
//       .update(dataCheckString)
//       .digest("hex");
 
//     // Step 7: Compare hashes securely (case-insensitive compare)
//     const isValid = computedHash === receivedHash;
 
//     if (isValid) {
//       // If valid, proceed with the request
//       console.log("Valid hash, proceeding with request");
 
//       next();
//     } else {
//       // If invalid, return an error response
//       // console.log("Invalid hash, returning error response");
 
//       return res.status(STATUS_CODE.FORBIDDEN).json({ error: "Invalid hash" });
//     }
//   } catch (error) {
//     console.log(error, "error");
//     return res
//       .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
//       .json({ error: ERROR_MESSAGE.INTERNAL_SERVER_ERROR });
//   }
// });




const validateTelegramHash = asyncHandler(async (req, res, next) => {
  try {
    // Extract the raw query from the request
    const rawQuery = req.headers.webapp; // Assuming raw query is passed in the request headers
    // console.log("req.headers.WebApp",req.headers.webapp)
    // console.log("req.headers",req.headers)
    if (!rawQuery) {
      return res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: "Raw query not provided" });
    }
    // console.log(rawQuery, "rawQuery");
 
    // Step 1: Split the raw query string by '&' into key=value pairs
    const keyValuePairs = rawQuery.split("&");
 
    // console.log(keyValuePairs, "keyValuePairs");
 
    // Step 2: Filter out the 'hash' param
    const filteredPairs = keyValuePairs.filter(
      (pair) => !pair.startsWith("hash=")
    );
 
    // console.log(filteredPairs, "filteredPairs");
 
    const receivedHash = keyValuePairs
      .find((pair) => pair.startsWith("hash="))
      ?.split("=")[1];
    if (!receivedHash) {
      return res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: "Hash parameter missing" });
    }
 
    // console.log(receivedHash, "receivedHash");
 
    // Step 3: Map each key=value pair into `${key}=${decodeURIComponent(value)}` format
    const decodedPairs = filteredPairs.map((pair) => {
      const [key, value] = pair.split("=");
      return `${key}=${decodeURIComponent(value)}`;
    });
 
    // console.log(decodedPairs, "decodedPairs");
 
    // Step 4: Sort and join with newline
    const dataCheckString = decodedPairs.sort().join("\n");
 
    // console.log(dataCheckString, "dataCheckString");
    // console.log("dataCheckString.user", dataCheckString.user);
    // console.log("dataCheckString", dataCheckString);
 
    // Extract the user field from dataCheckString
    const userField = decodedPairs.find((pair) => pair.startsWith("user="));
    if (userField) {
      const userValue = userField.split("=")[1]; // Extract the value of 'user' parameter
      // console.log("dataCheckString.user", JSON.parse(userValue)); // Log the parsed user data
      req.userData = JSON.parse(userValue);
    } else {
      console.log("User field not found");
    }
 
    // console.log("dataCheckString", dataCheckString);
 
    console.log(req.route.path, "req.route.path");
 
    const envToken =
      req.route.path === "/swlogin"
        ? process.env.WITHDRAW_BOT_TOKEN
        : process.env.TELEGRAM_BOT_TOKEN;
 
    // console.log(envToken, "envToken");
    // console.log(`hjadbvgbihajkdhakjdhajih    ${req.route.path} === "/swlogin"`);
   
 
    // Step 5: Create secret key: HMAC-SHA256 of 'WebAppData' using your bot token as key
    const secretKey = crypto
      .createHmac("sha256", "WebAppData") // 'WebAppData' is the key here
      .update(envToken) // your bot token
      // .update(`7690063183:AAE3tZ_1_b1TJRiZ3Zad9Yc4YeTa47gciPc`) // your bot token
      .digest();
 
    // console.log(secretKey, "secretKey");
 
    // Step 6: Create HMAC-SHA256 of dataCheckString using the secret key from step 5
    const computedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");
 
    // console.log(computedHash, "computedHash");
 
    // Step 7: Compare hashes securely (case-insensitive compare)
    const isValid = computedHash === receivedHash;
 
    // console.log(isValid, "isValid");
 
    if (isValid) {
      // If valid, proceed with the request
      console.log("Valid hash, proceeding with request");
 
      next();
    } else {
      // If invalid, return an error response
      // console.log("Invalid hash, returning error response");
 
      return res.status(STATUS_CODE.FORBIDDEN).json({ error: "Invalid hash" });
    }
  } catch (error) {
    console.log(error, "error");
    return res
      .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
      .json({ error: ERROR_MESSAGE.INTERNAL_SERVER_ERROR });
  }
});
 






const validateReferralCount = asyncHandler(async (req, res, next) => {
  try {
    const key = req.headers.key;
    console.log(key, "key");

    if (!key) {
      return res.status(400).json({ error: "Invalid Request: Missing API key" });
    }

    console.log(process.env.EXTERNAL_API_KEY, "process.env.EXTERNAL_API_KEY");

    if (key === process.env.EXTERNAL_API_KEY) {
      console.log("Key validation is successful");
      return next(); // ✅ Proceed to next middleware
    } else {
      return res.status(403).json({ error: "Unauthorized: Invalid API key" });
    }

  } catch (error) {
    console.error("Key validation failed:", error);
    return res.status(500).json({ message: "Key validation failed", error: error.message });
  }
});





  const validateClientId = asyncHandler(async (req, res, next) => {
    try {

      req.headers['original-url'] = req.originalUrl
      console.log(req.headers, "headers");
      if (req.headers['postman-token']) {
        return res.status(400).json({ error: "Invalid Request" });
        
      }

      if (req.headers['user-agent'] === 'ELB-HealthChecker/2.0') {
        return next();
      }

      if (!req.headers.clientid && (req.headers['user-agent'] !== 'ELB-HealthChecker/2.0')) {
        return res.status(400).json({ error: "Invalid Client" });
       
      }

      const decodedToken = decryptionData(req.headers.clientid);  // Correctly call decryptionData function
      console.log(decodedToken, "decodedToken");

      if (!decodedToken) {
        return res.status(400).json({ error: "Invalid Client ID" });
      }

      console.log(process.env.YOUR_SECRET_KEY, "process.env.YOUR_SECRET_KEY", decodedToken.split("&TimeStamp=")[0]);

      if (decodedToken.split("&TimeStamp=")[0] != process.env.YOUR_SECRET_KEY) {
        return res.status(401).json({ message: "Invalid key" });
      }

      const timestamp = decodedToken.split("&TimeStamp=")[1];
      console.log(timestamp, "timestamp");

      if (!timestamp) {
        return res.status(404).json({ message: "Invalid API call" });
      }

      if (verifyTimestamp(timestamp)) {
        next();
      } else {
        return res.status(501).json({ message: "ClientId has expired" });
      }
    } catch (error) {
      console.log(error, "error");
      return next(error);
    }
  });

  const validateClientIdAdmin = asyncHandler(async (req, res, next) => {
    try {

      req.headers['original-url'] = req.originalUrl
      console.log(req.headers, "headers");
      if (req.headers['postman-token']) {
        return res.status(400).json({ error: "Invalid Request" });
        
      }

      if (req.headers['user-agent'] === 'ELB-HealthChecker/2.0') {
        return next();
      }

      if (!req.headers.clientid && (req.headers['user-agent'] !== 'ELB-HealthChecker/2.0')) {
        return res.status(400).json({ error: "Invalid Client" });
       
      }

      const decodedToken = decryptionDataAdmin(req.headers.clientid);  // Correctly call decryptionData function
      console.log(decodedToken, "decodedToken");

      if (!decodedToken) {
        return res.status(400).json({ error: "Invalid Client ID" });
      }

      console.log(process.env.YOUR_SECRET_KEY_ADMIN, "process.env.YOUR_SECRET_KEY", decodedToken.split("&TimeStamp=")[0]);

      if (decodedToken.split("&TimeStamp=")[0] != process.env.YOUR_SECRET_KEY_ADMIN) {
        return res.status(401).json({ message: "Invalid key" });
      }

      const timestamp = decodedToken.split("&TimeStamp=")[1];
      console.log(timestamp, "timestamp");

      if (!timestamp) {
        return res.status(404).json({ message: "Invalid API call" });
      }

      if (verifyTimestamp(timestamp)) {
        next();
      } else {
        return res.status(501).json({ message: "ClientId has expired" });
      }
    } catch (error) {
      console.log(error, "error");
      return next(error);
    }
  });




const validateToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(STATUS_CODE.FORBIDDEN).json({ error: ERROR_MESSAGE.FORBIDDEN });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = await verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("decoded log in validtoken",decoded)
  } catch (err) {
            console.log(`➡️ Incoming request: ${req.method} ${req.originalUrl}`);
    return res.status(STATUS_CODE.UNAUTHORIZED).json({ error: "Invalid Token" });
  }

  const user = await User.findById(decoded.user?.id);
  if (!user) return res.status(STATUS_CODE.NOT_FOUND).json({ error: ERROR_MESSAGE.NOT_FOUND });

  req.user = user;
  next();
});


// Middleware to check if user is an Admin
const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.loginType === "Admin") {
      next();
    } else {
        console.log(`➡️ Incoming request: ${req.method} ${req.originalUrl}`);
      const error = new Error(ERROR_MESSAGE.FORBIDDEN);
      error.statusCode = STATUS_CODE.FORBIDDEN;
      throw error;
    }
  } catch (err) {
    const statusCode = err.statusCode || STATUS_CODE.INTERNAL_SERVER_ERROR;
    const errorMessage = err.message || ERROR_MESSAGE.INTERNAL_SERVER_ERROR;
    res.status(statusCode).json({ error: errorMessage });
  }
});


const isuser = asyncHandler(async (req, res, next) => {
  try {
    console.log("Decoded User from req.user:", req.user);
    console.log("Route param _id:", req.params._id);

    if (req.user.loginType !== "user") {
        console.log(`➡️ Incoming request: ${req.method} ${req.originalUrl}`);
      const error = new Error(ERROR_MESSAGE.FORBIDDEN);
      error.statusCode = STATUS_CODE.FORBIDDEN;
      throw error;
    }

    // Extract MongoDB ObjectId from JWT payload
    const userId = req.user.id || (req.user._id && req.user._id.toString());
    const paramId = req.params._id;

    if (paramId === userId) {
      next();
    } else {
        console.log(`➡️ Incoming request: ${req.method} ${req.originalUrl}`);
      const error = new Error(ERROR_MESSAGE.FORBIDDEN);
      error.statusCode = STATUS_CODE.FORBIDDEN;
      throw error;
    }
  } catch (err) {
      console.log(`➡️ Incoming request: ${req.method} ${req.originalUrl}`);
    const statusCode = err.statusCode || STATUS_CODE.INTERNAL_SERVER_ERROR;
    const errorMessage = err.message || ERROR_MESSAGE.INTERNAL_SERVER_ERROR;
    res.status(statusCode).json({ error: errorMessage });
  }
});



module.exports = { validateToken,validateClientIdAdmin,validateClientId,validateReferralCount, isAdmin, isuser,validateTelegramHash };