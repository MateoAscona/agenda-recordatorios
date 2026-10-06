jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-notifications/build/DevicePushTokenAutoRegistration.fx', () => {
  throw new Error('El registro de push remoto no está disponible en Expo Go Android.');
});

test('carga las notificaciones locales sin inicializar el registro de push remoto', () => {
  expect(() => require('../notifications')).not.toThrow();
  expect(() => require('../App')).not.toThrow();
});
