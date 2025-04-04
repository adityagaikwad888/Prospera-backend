const request = require("supertest");
const { app } = require("./testServer");

describe("Stock API", () => {
  it("GET /api/StockData should return status 200 with data", async () => {
    const response = await request(app).get("/api/StockData");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
