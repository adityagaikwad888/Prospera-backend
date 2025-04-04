const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../testApp");
const { OrdersModel } = require("../../model/OrdersModel");
const UserModel = require("../../model/UserModel");

describe("Orders and Margin API", () => {
  let testUserId;

  beforeAll(async () => {
    const user = new UserModel({
      email: "orders@example.com",
      password: "password123",
      username: "ordersuser",
      walletBalance: 10000,
    });
    await user.save();
    testUserId = user._id.toString();
  });

  describe("GET /allOrders/:userId", () => {
    it("should return status 200 with user orders", async () => {
      const order = new OrdersModel({
        name: "GOOGL",
        qty: 2,
        price: 180.5,
        mode: "BUY",
        userId: testUserId,
      });
      await order.save();

      const response = await request(app).get(`/allOrders/${testUserId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].name).toBe("GOOGL");
    });

    it("should return empty array for user with no orders", async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();

      const response = await request(app).get(
        `/allOrders/${nonExistentUserId}`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(0);
    });
  });

  describe("POST /marginUpdate", () => {
    it("should update user wallet balance with status 200", async () => {
      const newMargin = 15000;

      const response = await request(app).post("/marginUpdate").send({
        userId: testUserId,
        margin: newMargin,
      });

      expect(response.status).toBe(200);
      expect(response.text).toEqual("Margin updated");

      const updatedUser = await UserModel.findById(testUserId);
      expect(updatedUser.walletBalance).toBe(newMargin);
    });
  });
});
