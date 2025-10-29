try {
  require('@react-native-gesture-handler/jestSetup');
} catch (err) {
  // Some versions register automatically; ignore if unavailable.
}

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  Screen: jest.fn(),
  ScreenContainer: jest.fn(),
}));

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mockReanimated = require('react-native-reanimated/mock');
  jest.mock('react-native-reanimated', () => mockReanimated);
} catch (err) {
  // Module might be absent during early scaffolding; ignore.
}

try {
  require('react-native/Libraries/Animated/NativeAnimatedHelper');
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
} catch (err) {
  // React Native 0.72+ already mocks this internally.
}
