module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'routes/cohrm.js',
    'services/cohrmScannerService.js',
    'services/cohrmNotificationService.js',
    'lib/**/*.js',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
