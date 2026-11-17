import * as Calendar from 'expo-calendar/legacy';

export async function createCalendarEvent(event) {
  const permission = await Calendar.requestCalendarPermissionsAsync();
  if (!permission.granted) {
    throw new Error('No se concedió permiso para el calendario. Podés habilitarlo en Ajustes del teléfono.');
  }
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writable = calendars.filter((calendar) => calendar.allowsModifications);
  const calendar = writable.find((item) => item.isPrimary) || writable[0];
  if (!calendar) {
    throw new Error('No hay un calendario disponible para escribir. Configurá uno en el teléfono.');
  }
  const startDate = new Date(event.date);
  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
  const calendarEventId = await Calendar.createEventAsync(calendar.id, {
    title: event.title,
    startDate,
    endDate,
  });
  return { calendarEventId, calendarId: calendar.id };
}
