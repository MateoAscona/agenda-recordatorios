import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native';
import EventItem from '../EventItem';

test('muestra un evento y permite eliminarlo', async () => {
  const onDelete = jest.fn();
  const event = {
    id: 'evento-1',
    title: 'Clase de aplicaciones móviles',
    date: '2026-10-05T13:30:00.000Z',
  };
  await render(<EventItem event={event} onDelete={onDelete} />);

  expect(screen.getByText('Clase de aplicaciones móviles')).toBeTruthy();
  await fireEvent.press(
    screen.getByLabelText('Eliminar Clase de aplicaciones móviles'),
  );
  expect(onDelete).toHaveBeenCalledWith('evento-1');
});
