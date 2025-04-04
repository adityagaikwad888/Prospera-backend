require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  })
);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/StockData", (req, res) => {
  const mockStocks = [
    { name: "AAPL", currentPrice: 150.25, percentageChange: "1.20" },
    { name: "TSLA", currentPrice: 230.45, percentageChange: "-0.80" },
  ];
  res.status(200).json(mockStocks);
});

const startServer = async (port = 3001) => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(
        process.env.MONGO_URL || "mongodb://localhost:27017/test_db"
      );
      console.log("Connected to MongoDB for tests");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }

  return app.listen(port, () => {
    console.log(`Test server running on port ${port}`);
  });
};

module.exports = { app, startServer };
