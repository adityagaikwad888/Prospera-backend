module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  setupFilesAfterEnv: ["./tests/setup/setup.js"],
  globalTeardown: "./tests/setup/teardown.js",
  testTimeout: 10000,
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./test-results",
        outputName: "junit.xml",
      },
    ],
  ],
};
