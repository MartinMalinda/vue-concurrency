const isVue2 = process.env.VUE !== "3";

let setupFiles = [];

if (isVue2) {
  setupFiles = ["<rootDir>/test-utils/vue-2-setup.ts"]
}

module.exports = {
  preset: "ts-jest",
  setupFiles,
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
