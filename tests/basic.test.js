const request = require("supertest");
const { app } = require("./testServer");

describe("Server Health Check", () => {
  it("GET /health should return status 200", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});
