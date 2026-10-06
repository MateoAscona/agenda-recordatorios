import {
  createEvent,
  getEventDateFields,
  sortEvents,
  validateEvent,
} from '../events';

describe('validación de eventos', () => {
  const now = new Date(2026, 9, 3, 12, 0);

  test('pide título, fecha y hora', () => {
    expect(validateEvent('', '2026-10-04', '12:00', now)).toBe(
      'Completá el título.',
    );
    expect(validateEvent('Clase', '', '12:00', now)).toBe(
      'Completá la fecha y la hora.',
    );
  });

  test('rechaza fechas inexistentes y horarios pasados', () => {
    expect(validateEvent('Clase', '2026-02-30', '12:00', now)).toBe(
      'Ingresá una fecha y hora válidas.',
    );
    expect(validateEvent('Clase', '2026-10-03', '11:59', now)).toBe(
      'Elegí una fecha y hora futuras.',
    );
  });

  test('crea y ordena eventos por fecha', () => {
    const later = createEvent('Más adelante', '2026-10-05', '10:30');
    const sooner = createEvent('Antes', '2026-10-04', '09:00');

    expect(later.title).toBe('Más adelante');
    const savedDate = new Date(later.date);
    expect(savedDate.getFullYear()).toBe(2026);
    expect(savedDate.getMonth()).toBe(9);
    expect(savedDate.getDate()).toBe(5);
    expect(savedDate.getHours()).toBe(10);
    expect(savedDate.getMinutes()).toBe(30);
    expect(sortEvents([later, sooner]).map((event) => event.title)).toEqual([
      'Antes',
      'Más adelante',
    ]);
  });
});

test('convierte el selector usando fecha y hora locales, sin cambiar a UTC', () => {
  expect(getEventDateFields(new Date(2026, 0, 4, 23, 5))).toEqual({
    date: '2026-01-04', time: '23:05',
  });
});
