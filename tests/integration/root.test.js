const request = require("supertest");
const app = require("../testApp");

describe("Root Endpoint", () => {
  describe("GET /", () => {
    it("should return status 200 with Hello World message", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.text).toBe("Hello World!");
    });
  });
});
