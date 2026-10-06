import { Platform } from 'react-native';
import * as Notifications from './localNotifications';

export function getNotificationErrorMessage(error) {
  if (String(error?.message).includes('NotificationsChannelsProvider')) {
    return 'Esta instalación no tiene disponible el canal de recordatorios. Usá una compilación propia de Android con expo-notifications; cambiar los permisos no corrige este problema.';
  }
  return 'No se pudo preparar el recordatorio. Intentá nuevamente.';
}

async function createNotificationChannel() {
  if (Platform.OS !== 'android') {
    return null;
  }

  try {
    await Notifications.setNotificationChannelAsync('eventos', {
      name: 'Eventos',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    return 'eventos';
  } catch (error) {
    if (String(error?.message).includes('NotificationsChannelsProvider')) {
      return null;
    }
    throw error;
  }
}

async function hasNotificationPermission() {
  const permissions = await Notifications.getPermissionsAsync();

  if (permissions.status === 'granted') {
    return true;
  }

  if (permissions.canAskAgain === false) {
    return false;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync();
  return requestedPermissions.status === 'granted';
}

export async function requestNotificationPermission() {
  await createNotificationChannel();
  return hasNotificationPermission();
}

export async function scheduleEventNotification(event) {
  // Revisa también el permiso al guardar: puede haber cambiado desde el inicio.
  const channelId = await createNotificationChannel();
  if (!await hasNotificationPermission()) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: event.title,
      body: 'Es hora de tu evento.',
      data: { eventId: event.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(event.date),
      ...(channelId ? { channelId } : {}),
    },
  });
}

export async function cancelEventNotification(notificationId) {
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
}
