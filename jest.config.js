module.exports = {
  preset: "ts-jest",
  setupFiles: ["<rootDir>/test-utils/vue-setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/test-utils/test-setup.ts"],
  clearMocks: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/"],
  globals: {},

  moduleFileExtensions: ["js", "ts"],

  moduleNameMapper: {},

  collectCoverage: true,
  coverageReporters: ["lcov"],
  collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}"],
};
