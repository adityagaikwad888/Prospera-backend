require("dotenv").config();
let { HoldingsModel } = require("./model/HoldingsModel");
let { PositionsModel } = require("./model/PositionsModel");
let { OrdersModel } = require("./model/OrdersModel");
const authRoute = require("./Routes/AuthRoute");
const axios = require("axios");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const UserModel = require("./model/UserModel");

const app = express();
const port = process.env.PORT || 3001;
const url = process.env.MONGO_URL;

// In your backend index.js file
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      `${process.env.FRONTEND_URL}`,
      "http://65.1.106.80:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(`/`, authRoute);

mongoose
  .connect(url)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});

FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/HealthCheck", (req, res) => {
  res.status(200).json({ message: "API is healthy" });
});

app.get(`/api/StockData`, async (req, res) => {
  try {
    // List of Indian stock symbols (NSE)
    const symbols = ["AAPL", "TSLA", "MSFT", "AMZN", "GOOGL", "LMT", "NVDA"];
    const stockData = [];

    // Step 2: Fetch stock data from Finnhub and convert to INR
    for (const symbol of symbols) {
      const response = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );

      const stockInfo = response.data;
      if (!stockInfo) {
        throw new Error(`No data available for symbol: ${symbol}`);
      }

      const percentageChange =
        stockInfo.dp != null ? stockInfo.dp.toFixed(2) : "0.00";

      stockData.push({
        name: symbol, // stock symbol
        currentPrice: stockInfo.c, // current price
        percentageChange: percentageChange, // percentage change
      });
    }

    // Send the stock data as a JSON response
    res.json(stockData);
  } catch (error) {
    console.error("Error fetching Indian stock data:", error.message);
    res.status(500).json({ error: "Failed to fetch Indian stock data" });
  }
});

app.get(`/allHoldings/:userId`, async (req, res) => {
  let { userId } = req.params;
  let allHoldings = await HoldingsModel.find({ userId: userId });
  res.json(allHoldings);
});

app.get(`/allPositions`, async (req, res) => {
  let allPositions = await PositionsModel.find();
  res.json(allPositions);
});

app.get(`/allOrders/:userId`, async (req, res) => {
  let { userId } = req.params;
  let allOrders = await OrdersModel.find({ userId: userId });
  res.json(allOrders);
});

app.post(`/buyStock`, async (req, res) => {
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

app.post(`/showHoldings`, async (req, res) => {
  let { stockId, userId } = req.body;
  let holdings = await HoldingsModel.find({ name: stockId, userId: userId });
  res.json(holdings);
});

app.post(`/sellStock`, async (req, res) => {
  const { uID, quantityToSell, avgCost, userId } = req.body;

  try {
    // Fetch and sort holdings for the specified stock
    let holdings = await HoldingsModel.find({ name: uID, userId: userId }).sort(
      { avg: 1 }
    );

    let remainingQuantity = quantityToSell;

    for (let holding of holdings) {
      if (remainingQuantity === 0) break;

      if (holding.qty == remainingQuantity) {
        // Case 1: Exact quantity match, delete the holding
        await HoldingsModel.deleteOne({ _id: holding._id });
        remainingQuantity = 0;
      } else if (holding.qty < remainingQuantity) {
        // Case 2: Quantity is less, delete this entry and reduce remaining quantity
        remainingQuantity -= holding.qty;
        await HoldingsModel.deleteOne({ _id: holding._id });
      } else {
        // Case 3: Quantity is more, update this entry
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

app.post(`/marginUpdate`, async (req, res) => {
  let { userId, margin } = req.body;
  let update = await UserModel.updateOne(
    { _id: userId },
    { $set: { walletBalance: margin } }
  );
  res.send("Margin updated");
});

app.get("/data", async (req, res) => {
  let data = await UserModel.find();
  console.log(data);
  res.json(data);
});
