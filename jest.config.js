const vueVersion = process.env.VUE || 2;

module.exports = {
  preset: "ts-jest",
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
