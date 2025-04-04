const request = require("supertest");
const app = require("../testApp");
const UserModel = require("../../model/UserModel");

describe("User API", () => {
  let testUserId;

  beforeAll(async () => {
    const user = new UserModel({
      email: "wallet@example.com",
      password: "password123",
      username: "walletuser",
      walletBalance: 10000,
    });
    await user.save();
    testUserId = user._id.toString();
  });

  describe("GET /data", () => {
    it("should return all users with status 200", async () => {
      const response = await request(app).get("/data");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);

      const user = response.body.find((u) => u.email === "wallet@example.com");
      expect(user).toBeTruthy();
      expect(user.username).toBe("walletuser");
    });
  });
});
