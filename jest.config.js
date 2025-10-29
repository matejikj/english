module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native'
      + '|@react-native'
      + '|@react-navigation'
      + '|react-native-gesture-handler'
      + '|react-native-safe-area-context'
      + '|react-native-reanimated'
      + '|react-native-screens'
      + ')/)',
  ],
};
