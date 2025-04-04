const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../testApp");
const UserModel = require("../../model/UserModel");

describe("Authentication API", () => {
  describe("POST /signup", () => {
    it("should create a new user", async () => {
      const timestamp = Date.now(); // Add timestamp to ensure unique email
      const userData = {
        email: `test${timestamp}@example.com`,
        password: "password123",
        username: "testuser",
        walletBalance: 10000,
        createdAt: new Date(),
      };

      const response = await request(app).post("/signup").send(userData);

      // Check for successful response
      expect(response.status).toBe(201);
      expect(response.body.success).toBeTruthy();
      expect(response.body.message).toEqual("User signed in successfully");

      // Check if user was saved to database
      const user = await UserModel.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.username).toEqual(userData.username);
    });

    it("should return error for duplicate email", async () => {
      const timestamp = Date.now();
      const userData = {
        email: `duplicate${timestamp}@example.com`,
        password: "password123",
        username: "duplicateuser",
        walletBalance: 10000,
        createdAt: new Date(),
      };

      await request(app).post("/signup").send(userData);

      const response = await request(app).post("/signup").send(userData);

      expect(response.body.message).toEqual("User already exists");
    });
  });

  describe("POST /signin", () => {
    beforeEach(async () => {
      // Create a test user before each sign-in test
      const userData = {
        email: "signin@example.com",
        password: "password123",
        username: "signinuser",
        walletBalance: 10000,
        createdAt: new Date(),
      };

      await request(app).post("/signup").send(userData);
    });

    it("should sign in an existing user with status 201", async () => {
      const response = await request(app).post("/signin").send({
        email: "signin@example.com",
        password: "password123",
      });

      // Check for successful response
      expect(response.status).toBe(201);
      expect(response.body.success).toBeTruthy();
      expect(response.body.token).toBeTruthy();
    });

    it("should reject invalid credentials", async () => {
      const response = await request(app).post("/signin").send({
        email: "signin@example.com",
        password: "wrongpassword",
      });

      expect(response.body.message).toEqual("Incorrect password or email");
    });
  });
});
