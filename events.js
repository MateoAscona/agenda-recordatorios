export const EVENT_STORAGE_KEY = 'agenda-recordatorios-eventos';

function parseEventDate(date, time) {
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeParts = /^(\d{2}):(\d{2})$/.exec(time);

  if (!dateParts || !timeParts) {
    return null;
  }

  const year = Number(dateParts[1]);
  const month = Number(dateParts[2]);
  const day = Number(dateParts[3]);
  const hour = Number(timeParts[1]);
  const minute = Number(timeParts[2]);
  const eventDate = new Date(year, month - 1, day, hour, minute);

  if (
    year < 1000 ||
    eventDate.getFullYear() !== year ||
    eventDate.getMonth() !== month - 1 ||
    eventDate.getDate() !== day ||
    hour > 23 ||
    minute > 59
  ) {
    return null;
  }

  return eventDate;
}

export function validateEvent(title, date, time, now = new Date()) {
  if (typeof title !== 'string' || title.trim().length === 0) {
    return 'Completá el título.';
  }

  if (!date || !time) {
    return 'Completá la fecha y la hora.';
  }

  const eventDate = parseEventDate(date, time);

  if (!eventDate) {
    return 'Ingresá una fecha y hora válidas.';
  }

  if (eventDate <= now) {
    return 'Elegí una fecha y hora futuras.';
  }

  return '';
}

export function getEventDateFields(value) {
  const pad = (number) => String(number).padStart(2, '0');
  return {
    date: `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`,
    time: `${pad(value.getHours())}:${pad(value.getMinutes())}`,
  };
}

export function createEvent(title, date, time) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    date: parseEventDate(date, time).toISOString(),
  };
}

export function sortEvents(events) {
  return [...events].sort(
    (first, second) => new Date(first.date) - new Date(second.date),
  );
}

export function formatEventDate(date) {
  return new Date(date).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
