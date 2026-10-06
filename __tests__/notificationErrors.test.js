import { getNotificationErrorMessage } from '../notifications';

test('distingue el proveedor nativo ausente de los permisos denegados', () => {
  expect(getNotificationErrorMessage(new Error(
    'null cannot be cast to non-null type expo.modules.notifications.notifications.channels.NotificationsChannelsProvider',
  ))).toMatch(/compilación propia de Android/);
});

test('no expone excepciones nativas al usuario', () => {
  expect(getNotificationErrorMessage(new Error('java.lang.NullPointerException')))
    .toBe('No se pudo preparar el recordatorio. Intentá nuevamente.');
});
