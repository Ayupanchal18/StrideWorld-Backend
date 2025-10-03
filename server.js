// server.js
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";

// load env
dotenv.config();

// connect to DB
connectDB();

// create app
const app = express();

// --- CORS configuration (single, correct setup) ---
const allowedOrigins = [
  "http://localhost:3000",                     // local dev
  "https://strideworld-frontend.onrender.com"  // deployed frontend (NO trailing slash)
];

// Use a function for origin so header is set to the single request origin
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (e.g., curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // include OPTIONS
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  credentials: true,
};

// Apply CORS once (must be before routes)
app.use(cors(corsOptions));
// Ensure preflight (OPTIONS) across all routes
app.options("*", cors(corsOptions));

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow server-to-server requests with no origin header
  if (!origin) return next();

  // If origin isn't allowed, block it (optional: you can return 403 instead)
  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ message: "CORS Origin Denied" });
  }

  // Set explicit CORS headers for every request
  res.header("Access-Control-Allow-Origin", origin);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // If it's a preflight request, end here with 200
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// body parser and logger
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);

// root route
app.get("/", (req, res) => {
  res.send("<h1>Welcome to ecommerce app</h1>");
});

// start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server Running on ${process.env.DEV_MODE || "production"} mode on port ${PORT}`);
});
