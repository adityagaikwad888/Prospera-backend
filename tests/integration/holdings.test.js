const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../testApp");
const { HoldingsModel } = require("../../model/HoldingsModel");
const { OrdersModel } = require("../../model/OrdersModel");
const UserModel = require("../../model/UserModel");

describe("Holdings API", () => {
  let testUserId;

  beforeAll(async () => {
    // Create a test user for these tests
    const user = new UserModel({
      email: "holdings@example.com",
      password: "password123",
      username: "holdingsuser",
      walletBalance: 10000,
    });
    await user.save();
    testUserId = user._id.toString();
  });

  describe("POST /buyStock", () => {
    it("should create a new order and holding when buying stock", async () => {
      const buyData = {
        name: "AAPL",
        qty: 10,
        price: 150.5,
        mode: "BUY",
        userId: testUserId,
      };

      const response = await request(app)
        .post("/buyStock")
        .send(buyData)
        .expect(200);

      expect(response.text).toEqual("Order saved");

      // Verify holding was created
      const holdings = await HoldingsModel.find({ userId: testUserId });
      expect(holdings.length).toEqual(1);
      expect(holdings[0].name).toEqual("AAPL");
      expect(holdings[0].qty).toEqual(10);
      expect(holdings[0].avg).toEqual(150.5);

      // Verify order was created
      const orders = await OrdersModel.find({ userId: testUserId });
      expect(orders.length).toEqual(1);
      expect(orders[0].name).toEqual("AAPL");
      expect(orders[0].mode).toEqual("BUY");
    });
  });

  describe("GET /allHoldings/:userId", () => {
    it("should return all holdings for a user", async () => {
      const response = await request(app)
        .get(`/allHoldings/${testUserId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].name).toEqual("AAPL");
    });
  });

  describe("POST /sellStock", () => {
    it("should process a stock sale correctly", async () => {
      // First buy some stock if not already done
      const buyData = {
        name: "TSLA",
        qty: 5,
        price: 220.3,
        mode: "BUY",
        userId: testUserId,
      };

      await request(app).post("/buyStock").send(buyData);

      // Now sell some of it
      const sellData = {
        uID: "TSLA",
        quantityToSell: 3,
        avgCost: 225.5, // Selling price
        userId: testUserId,
      };

      const response = await request(app)
        .post("/sellStock")
        .send(sellData)
        .expect(200);

      expect(response.text).toEqual("Stock sold successfully");

      // Verify holding was updated
      const holdings = await HoldingsModel.findOne({
        userId: testUserId,
        name: "TSLA",
      });

      expect(holdings.qty).toEqual(2); // 5 - 3 = 2

      // Verify sell order was created
      const sellOrder = await OrdersModel.findOne({
        userId: testUserId,
        name: "TSLA",
        mode: "SELL",
      });

      expect(sellOrder).toBeTruthy();
      expect(sellOrder.qty).toEqual(3);
    });
  });

  describe("POST /showHoldings", () => {
    it("should return holdings for specific stock with status 200", async () => {
      const buyData = {
        name: "NVDA",
        qty: 8,
        price: 450.75,
        mode: "BUY",
        userId: testUserId,
      };

      await request(app).post("/buyStock").send(buyData);

      const queryData = {
        stockId: "NVDA",
        userId: testUserId,
      };

      const response = await request(app).post("/showHoldings").send(queryData);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].name).toBe("NVDA");
      expect(response.body[0].qty).toBe(8);
    });
  });
});
