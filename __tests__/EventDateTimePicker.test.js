import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import EventDateTimePicker from '../EventDateTimePicker';

jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: (props) => require('react').createElement(
    require('react-native').View,
    { ...props, testID: 'native-picker' },
  ),
  DateTimePickerAndroid: { open: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.replaceProperty(Platform, 'OS', 'android');
});
afterEach(() => jest.restoreAllMocks());

test('abre el calendario nativo y conserva la hora al elegir una fecha', async () => {
  const onChange = jest.fn();
  await render(
    <EventDateTimePicker value={new Date(2026, 9, 4, 14, 30)} onChange={onChange} />,
  );
  await fireEvent.press(screen.getByLabelText('Elegir fecha'));
  const options = DateTimePickerAndroid.open.mock.calls[0][0];
  expect(options.mode).toBe('date');

  await act(async () => {
    options.onValueChange({ type: 'set' }, new Date(2026, 9, 8, 0, 0));
  });
  expect(onChange).toHaveBeenCalledWith(new Date(2026, 9, 8, 14, 30));
});

test('abre el reloj nativo y conserva la fecha al elegir una hora', async () => {
  const onChange = jest.fn();
  await render(
    <EventDateTimePicker value={new Date(2026, 9, 4, 14, 30)} onChange={onChange} />,
  );
  await fireEvent.press(screen.getByLabelText('Elegir hora'));
  const options = DateTimePickerAndroid.open.mock.calls[0][0];
  expect(options.mode).toBe('time');
  expect(options.is24Hour).toBe(true);

  await act(async () => {
    options.onValueChange({ type: 'set' }, new Date(2026, 9, 3, 18, 45));
  });
  expect(onChange).toHaveBeenCalledWith(new Date(2026, 9, 4, 18, 45));
});

test('cancelar el selector no modifica el evento', async () => {
  const onChange = jest.fn();
  await render(
    <EventDateTimePicker value={new Date(2026, 9, 4, 14, 30)} onChange={onChange} />,
  );
  await fireEvent.press(screen.getByLabelText('Elegir fecha'));
  const options = DateTimePickerAndroid.open.mock.calls[0][0];
  await act(async () => options.onDismiss());
  expect(onChange).not.toHaveBeenCalled();
});

test('en iOS muestra el selector nativo y permite cerrarlo', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  await render(
    <EventDateTimePicker value={new Date(2026, 9, 4, 14, 30)} onChange={jest.fn()} />,
  );
  await fireEvent.press(screen.getByLabelText('Elegir hora'));
  expect(screen.getByTestId('native-picker').props.mode).toBe('time');
  await fireEvent.press(screen.getByText('Listo'));
  expect(screen.queryByTestId('native-picker')).toBeNull();
  expect(DateTimePickerAndroid.open).not.toHaveBeenCalled();
});

test('no abre selectores mientras se está guardando', async () => {
  await render(
    <EventDateTimePicker value={new Date(2026, 9, 4, 14, 30)} onChange={jest.fn()} disabled />,
  );
  await fireEvent.press(screen.getByLabelText('Elegir fecha'));
  expect(DateTimePickerAndroid.open).not.toHaveBeenCalled();
});
