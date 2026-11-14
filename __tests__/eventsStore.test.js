import AsyncStorage from '@react-native-async-storage/async-storage';
import { EVENT_STORAGE_KEY } from '../events';
import { useEventsStore } from '../eventsStore';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

beforeEach(async () => {
  await AsyncStorage.clear();
  useEventsStore.setState({ events: [] });
});

test('loads existing events and persists added, updated and deleted events', async () => {
  const oldEvent = { id: 'old', title: 'Old event', date: '2030-01-02T12:00:00.000Z', notificationId: 'notice' };
  await AsyncStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify([oldEvent]));
  await useEventsStore.getState().loadEvents();
  const newEvent = { id: 'new', title: 'New event', date: '2030-01-01T12:00:00.000Z' };
  await useEventsStore.getState().addEvent(newEvent);
  await useEventsStore.getState().updateEvent('old', { location: { latitude: 1, longitude: 2 } });
  expect(useEventsStore.getState().events).toEqual([newEvent, { ...oldEvent, location: { latitude: 1, longitude: 2 } }]);
  await useEventsStore.getState().deleteEvent('new');
  expect(JSON.parse(await AsyncStorage.getItem(EVENT_STORAGE_KEY))).toEqual([{ ...oldEvent, location: { latitude: 1, longitude: 2 } }]);
});

test('does not load events after the session is closed', async () => {
  let finishRead;
  jest.spyOn(AsyncStorage, 'getItem').mockImplementationOnce(() => new Promise((resolve) => { finishRead = resolve; }));
  let active = true;
  const loading = useEventsStore.getState().loadEvents(() => active);
  active = false;
  useEventsStore.getState().clearEvents();
  finishRead(JSON.stringify([{ id: 'old', title: 'Old', date: '2030-01-02T12:00:00.000Z' }]));
  await loading;
  expect(useEventsStore.getState().events).toEqual([]);
});

test('does not change events when storage fails', async () => {
  const event = { id: 'old', title: 'Old event', date: '2030-01-02T12:00:00.000Z' };
  useEventsStore.setState({ events: [event] });
  jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('storage error'));
  await expect(useEventsStore.getState().deleteEvent('old')).rejects.toThrow('storage error');
  expect(useEventsStore.getState().events).toEqual([event]);
});
