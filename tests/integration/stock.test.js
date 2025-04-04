const request = require("supertest");
const app = require("../testApp");

describe("Stock API", () => {
  describe("GET /api/StockData", () => {
    it("should return stock data with correct structure", async () => {
      const response = await request(app)
        .get("/api/StockData")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);

      // Check structure of stock data
      const stock = response.body[0];
      expect(stock).toHaveProperty("name");
      expect(stock).toHaveProperty("currentPrice");
      expect(stock).toHaveProperty("percentageChange");
    });
  });
});
