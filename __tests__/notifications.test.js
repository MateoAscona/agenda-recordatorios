jest.mock('../localNotifications', () => ({
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
}));

import { Platform } from 'react-native';
import * as Notifications from '../localNotifications';
import {
  cancelEventNotification,
  requestNotificationPermission,
  scheduleEventNotification,
} from '../notifications';

afterEach(() => {
  jest.restoreAllMocks();
});

test('vuelve a solicitar permiso al guardar si todavía puede preguntar', async () => {
  Notifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined', canAskAgain: true });
  Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
  Notifications.scheduleNotificationAsync.mockResolvedValue('recordatorio');
  await expect(scheduleEventNotification({
    id: 'evento-1', title: 'Clase', date: '2026-10-05T13:30:00.000Z',
  })).resolves.toBe('recordatorio');
  expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
});

test('sigue pidiendo permiso si Android no admite canales personalizados', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  Notifications.setNotificationChannelAsync.mockRejectedValue(
    new Error('null cannot be cast to NotificationsChannelsProvider'),
  );
  Notifications.getPermissionsAsync.mockResolvedValue({
    status: 'undetermined', canAskAgain: true,
  });
  Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });

  await expect(requestNotificationPermission()).resolves.toBe(true);
  expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
});

beforeEach(() => {
  jest.resetAllMocks();
});

test('guarda el evento sin programar una notificación si falta permiso', async () => {
  Notifications.getPermissionsAsync.mockResolvedValue({ status: 'denied', canAskAgain: false });
  Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

  const event = {
    id: 'evento-1',
    title: 'Clase',
    date: '2026-10-05T13:30:00.000Z',
  };

  await expect(scheduleEventNotification(event)).resolves.toBeNull();
  expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
});

test('usa el canal de fallback si Android no permite crear uno propio', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  Notifications.setNotificationChannelAsync.mockRejectedValue(
    new Error('null cannot be cast to NotificationsChannelsProvider'),
  );
  Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
  Notifications.scheduleNotificationAsync.mockResolvedValue('notificacion-1');

  await expect(scheduleEventNotification({
    id: 'evento-1', title: 'Clase', date: '2026-10-05T13:30:00.000Z',
  })).resolves.toBe('notificacion-1');

  const [request] = Notifications.scheduleNotificationAsync.mock.calls[0];
  expect(request.trigger.channelId).toBeUndefined();
});

test('programa el recordatorio y permite cancelarlo', async () => {
  Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
  Notifications.scheduleNotificationAsync.mockResolvedValue('notificacion-1');
  const event = {
    id: 'evento-1',
    title: 'Clase',
    date: '2026-10-05T13:30:00.000Z',
  };

  await expect(scheduleEventNotification(event)).resolves.toBe(
    'notificacion-1',
  );
  expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
    expect.objectContaining({
      content: expect.objectContaining({
        title: 'Clase',
        body: 'Es hora de tu evento.',
        data: { eventId: 'evento-1' },
      }),
      trigger: expect.objectContaining({ type: 'date', date: new Date(event.date) }),
    }),
  );

  await cancelEventNotification('notificacion-1');
  expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
    'notificacion-1',
  );
});

test('crea el canal antes de pedir permiso al iniciar', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  Notifications.getPermissionsAsync.mockResolvedValue({
    status: 'undetermined',
    canAskAgain: true,
  });
  Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });

  await expect(requestNotificationPermission()).resolves.toBe(true);
  expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
    'eventos',
    expect.objectContaining({ name: 'Eventos' }),
  );
  expect(Notifications.setNotificationChannelAsync.mock.invocationCallOrder[0]).toBeLessThan(
    Notifications.requestPermissionsAsync.mock.invocationCallOrder[0],
  );
  jest.restoreAllMocks();
});

test('no repite el pedido si el permiso ya está concedido', async () => {
  Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
  await expect(requestNotificationPermission()).resolves.toBe(true);
  expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
});

test('no intenta forzar el diálogo si el sistema no permite preguntar otra vez', async () => {
  Notifications.getPermissionsAsync.mockResolvedValue({
    status: 'denied',
    canAskAgain: false,
  });
  await expect(requestNotificationPermission()).resolves.toBe(false);
  expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
});

test('informa permiso denegado cuando el usuario rechaza el diálogo', async () => {
  Notifications.getPermissionsAsync.mockResolvedValue({
    status: 'undetermined',
    canAskAgain: true,
  });
  Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });
  await expect(requestNotificationPermission()).resolves.toBe(false);
});

test('un error de programación no se confunde con permiso denegado', async () => {
  Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
  Notifications.scheduleNotificationAsync.mockRejectedValue(
    new Error('No se puede programar la alarma'),
  );
  await expect(scheduleEventNotification({
    id: 'evento-1', title: 'Clase', date: '2026-10-05T13:30:00.000Z',
  })).rejects.toThrow('No se puede programar la alarma');
});
