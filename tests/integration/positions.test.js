const request = require("supertest");
const app = require("../testApp");
const { PositionsModel } = require("../../model/PositionsModel");

describe("Positions API", () => {
  beforeAll(async () => {
    const positions = [
      { name: "AAPL", qty: 5, price: 145.75 },
      { name: "MSFT", qty: 10, price: 300.5 },
    ];
    await PositionsModel.insertMany(positions);
  });

  describe("GET /allPositions", () => {
    it("should return status 200 with all positions", async () => {
      const response = await request(app).get("/allPositions");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(2);

      const position = response.body.find((p) => p.name === "AAPL");
      expect(position).toBeTruthy();
      expect(position.qty).toBe(5);
      expect(position.price).toBe(145.75);
    });
  });
});
