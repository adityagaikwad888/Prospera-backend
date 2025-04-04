const request = require("supertest");
const app = require("../testApp");
const UserModel = require("../../model/UserModel");

describe("User API", () => {
  it("GET /data should return all users with status 200", async () => {
    // Create a test user
    const user = new UserModel({
      email: "user@example.com",
      password: "password123",
      username: "testuser",
      walletBalance: 10000,
    });
    await user.save();

    const response = await request(app).get("/data");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
  });
});
