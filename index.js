
// Import required packages
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");


// Import routes
const userRoutes = require("./routes/userRoutes.js");
const storyRoutes = require("./routes/storyRoutes.js");
const configureDB = require("./config/configureDB.js");

dotenv.config();

const app = express();

// Middleware for parsing JSON request body
app.use(express.json());

// Middleware for serving static files (e.g., client-side assets)
app.use(express.static(path.join(__dirname, "../frontend/dist")));


// CORS configuration
const corsOptions = {
  credentials: true,
  origin: "http://localhost:5173",
};

// Enable CORS with configured options
app.use(cors(corsOptions));

// Middleware for parsing cookies
app.use(cookieParser());

// Middleware for parsing URL-encoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Connect DB
configureDB();

//API Endpoints
app.use("/api/user", userRoutes);
app.use("/api/story", storyRoutes);

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

