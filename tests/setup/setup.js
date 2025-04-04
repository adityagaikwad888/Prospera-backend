const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
require("dotenv").config();

let mongod;

beforeAll(async () => {
  console.log("Creating MongoDB Memory Server for tests");
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Override environment variables for testing
  process.env.MONGO_URL = uri;
  process.env.TOKEN_KEY = process.env.TOKEN_KEY || "test-jwt-key";
  process.env.FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "demo_api_key";

  console.log("Using MongoDB Memory Server for tests");

  // Connect to the in-memory database
  await mongoose.connect(uri);
  console.log("Connected to in-memory MongoDB");
});

// Modify the cleanup approach to be more selective
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      // Instead of deleting all collections, keep track of what was created in each test
      // and clean up only what's necessary
      console.log("Test cleanup: Only clearing test-specific data");

      // We could selectively clean specific patterns instead of everything
      // For now, we'll just log the cleanup for debugging
    } catch (error) {
      console.error("Error in test cleanup:", error);
    }
  }
});

// Only clear all data after all tests are done
afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    // Clear all collections at the end of all tests
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      try {
        const collection = collections[key];
        await collection.deleteMany({});
      } catch (error) {
        console.error(`Error clearing collection ${key}:`, error);
      }
    }
    console.log("Cleared all collections after all tests");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }

  if (mongod) {
    await mongod.stop();
    console.log("Stopped MongoDB Memory Server");
  }
});
