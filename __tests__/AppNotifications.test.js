import { fireEvent, render, screen } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';
import * as Notifications from '../localNotifications';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: () => null,
  DateTimePickerAndroid: { open: jest.fn() },
}));
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
}));
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => typeof children === 'function'
      ? children({ route: {}, navigation: { goBack: jest.fn(), navigate: jest.fn() } })
      : null,
  }),
}));
jest.mock('../localNotifications', () => ({
  AndroidImportance: { DEFAULT: 5 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  Notifications.getPermissionsAsync.mockResolvedValue({
    status: 'undetermined', canAskAgain: true,
  });
  Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
  AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ username: 'mateo', password: 'clave' }));
});

test('solicita permiso al iniciar, antes de iniciar sesión o crear eventos', async () => {
  await render(<App />);
  expect(screen.getByText('Agenda y recordatorios')).toBeTruthy();
  expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
});

test('guarda el evento e informa la causa si la programación falla con permiso concedido', async () => {
  await render(<App />);
  Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
  Notifications.scheduleNotificationAsync.mockRejectedValue(new Error('No se puede programar la alarma'));
  AsyncStorage.getItem.mockImplementation(async (key) => key.includes('usuario')
    ? JSON.stringify({ username: 'mateo', password: 'clave' }) : null);

  await fireEvent.changeText(screen.getByPlaceholderText('Usuario'), 'mateo');
  await fireEvent.changeText(screen.getByPlaceholderText('Contraseña'), 'clave');
  await fireEvent.press(screen.getByText('Iniciar sesión'));
  await fireEvent.changeText(screen.getByPlaceholderText('Título'), 'Clase');
  await fireEvent.press(screen.getByText('Guardar evento'));

  expect(screen.getByText(
    'El evento se guardó sin recordatorio. No se pudo preparar el recordatorio. Intentá nuevamente.',
  )).toBeTruthy();
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(
    'agenda-recordatorios-eventos',
    expect.stringContaining('"notificationId":null'),
  );
});

test('explica en Login cuando el sistema ya denegó el permiso', async () => {
  Notifications.getPermissionsAsync.mockResolvedValue({
    status: 'denied', canAskAgain: false,
  });
  await render(<App />);
  expect(screen.getByText(/Las notificaciones están desactivadas/)).toBeTruthy();
  expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
});

test('muestra el error de inicialización sin impedir iniciar sesión', async () => {
  Notifications.getPermissionsAsync.mockRejectedValue(new Error('El módulo no respondió'));
  await render(<App />);
  expect(screen.getByText(
    'No se pudo preparar el recordatorio. Intentá nuevamente.',
  )).toBeTruthy();
  expect(screen.getByPlaceholderText('Usuario')).toBeTruthy();
});
