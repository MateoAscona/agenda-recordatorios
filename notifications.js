import { Platform } from 'react-native';
import * as Notifications from './localNotifications';
import { requestDevicePermission } from './devicePermissions';

export function getNotificationErrorMessage(error) {
  if (error?.resource === 'notifications') return error.message;
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
  try {
    await requestDevicePermission('notifications',
      () => Notifications.getPermissionsAsync(),
      () => Notifications.requestPermissionsAsync());
    return true;
  } catch (error) {
    if (['denied', 'dismissed'].includes(error.reason)) return false;
    throw error;
  }
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

export function getEventNotificationIds(event) {
  return [...new Set([
    event?.notificationId,
    ...(Array.isArray(event?.pendingNotificationIds) ? event.pendingNotificationIds : []),
  ].filter(Boolean))];
}

export async function cancelEventNotifications(ids) {
  const remaining = [];
  for (const id of [...new Set(ids.filter(Boolean))]) {
    try {
      await cancelEventNotification(id);
    } catch {
      remaining.push(id);
    }
  }
  return remaining;
}
