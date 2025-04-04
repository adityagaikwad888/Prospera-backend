const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables from .env

let mongod;

beforeAll(async () => {
  // Only use in-memory MongoDB if MONGO_URL is not explicitly provided
  if (!process.env.MONGO_URL) {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URL = mongod.getUri();
    console.log("Using in-memory MongoDB for tests");
  } else {
    console.log("Using provided MONGO_URL from environment");
  }

  // Ensure required environment variables exist
  if (!process.env.TOKEN_KEY) {
    console.warn(
      "TOKEN_KEY not found in environment, using default test value"
    );
    process.env.TOKEN_KEY = "test-jwt-key";
  }

  if (!process.env.FINNHUB_API_KEY) {
    console.warn("FINNHUB_API_KEY not found in environment, using demo value");
    process.env.FINNHUB_API_KEY = "demo_api_key";
  }

  // Connect to database (either real or in-memory)
  await mongoose.connect(process.env.MONGO_URL);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});

// Clear database collections between tests if not using production database
afterEach(async () => {
  // Only clean up if using test database (determined by database name)
  const dbName = mongoose.connection.name;
  if (dbName.includes("test") || dbName.includes("memory")) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});
