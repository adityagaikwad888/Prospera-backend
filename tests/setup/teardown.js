module.exports = async () => {
  const mongoose = require("mongoose");

  // Disconnect Mongoose
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }

  // Stop MongoDB Memory Server if running
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
    console.log("Stopped MongoDB Memory Server");
  }
};
