const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const authRoute = require("../Routes/AuthRoute");
const { HoldingsModel } = require("../model/HoldingsModel");
const { PositionsModel } = require("../model/PositionsModel");
const { OrdersModel } = require("../model/OrdersModel");
const UserModel = require("../model/UserModel");
require("dotenv").config();

// Initialize test app
const app = express();

// Middleware
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
app.use("/", authRoute);

// Import the routes from index.js
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Mock the StockData API to avoid external API calls during tests
app.get("/api/StockData", async (req, res) => {
  const mockStockData = [
    { name: "AAPL", currentPrice: 150.25, percentageChange: "1.20" },
    { name: "TSLA", currentPrice: 230.45, percentageChange: "-0.80" },
  ];

  res.json(mockStockData);
});

// Add other routes
app.get("/allHoldings/:userId", async (req, res) => {
  let { userId } = req.params;
  let allHoldings = await HoldingsModel.find({ userId: userId });
  res.json(allHoldings);
});

app.get("/allPositions", async (req, res) => {
  let allPositions = await PositionsModel.find();
  res.json(allPositions);
});

app.get("/allOrders/:userId", async (req, res) => {
  let { userId } = req.params;
  let allOrders = await OrdersModel.find({ userId: userId });
  res.json(allOrders);
});

app.post("/buyStock", async (req, res) => {
  let newOrder = new OrdersModel({
    name: req.body.name,
    qty: req.body.qty,
    price: req.body.price,
    mode: req.body.mode,
    userId: req.body.userId,
  });
  await newOrder.save();

  let newHolding = new HoldingsModel({
    name: req.body.name,
    qty: req.body.qty,
    avg: req.body.price,
    userId: req.body.userId,
  });
  await newHolding.save();
  res.send("Order saved");
});

app.post("/showHoldings", async (req, res) => {
  let { stockId, userId } = req.body;
  let holdings = await HoldingsModel.find({ name: stockId, userId: userId });
  res.json(holdings);
});

app.post("/sellStock", async (req, res) => {
  const { uID, quantityToSell, avgCost, userId } = req.body;

  try {
    let holdings = await HoldingsModel.find({ name: uID, userId: userId }).sort(
      { avg: 1 }
    );

    let remainingQuantity = quantityToSell;

    for (let holding of holdings) {
      if (remainingQuantity === 0) break;

      if (holding.qty == remainingQuantity) {
        await HoldingsModel.deleteOne({ _id: holding._id });
        remainingQuantity = 0;
      } else if (holding.qty < remainingQuantity) {
        remainingQuantity -= holding.qty;
        await HoldingsModel.deleteOne({ _id: holding._id });
      } else {
        await HoldingsModel.updateOne(
          { _id: holding._id },
          { $set: { qty: holding.qty - remainingQuantity } }
        );
        remainingQuantity = 0;
      }
    }

    let newOrder = new OrdersModel({
      name: uID,
      qty: quantityToSell,
      price: avgCost,
      mode: "SELL",
      userId: userId,
    });
    await newOrder.save();

    res.send("Stock sold successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/marginUpdate", async (req, res) => {
  let { userId, margin } = req.body;
  let update = await UserModel.updateOne(
    { _id: userId },
    { $set: { walletBalance: margin } }
  );
  res.send("Margin updated");
});

// Add the missing /data endpoint
app.get("/data", async (req, res) => {
  let data = await UserModel.find();
  res.json(data);
});

module.exports = app;
