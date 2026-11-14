import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { EVENT_STORAGE_KEY, sortEvents } from './events';

export const useEventsStore = create((set, get) => ({
  events: [],
  loadEvents: async (isActive = () => true) => {
    const saved = await AsyncStorage.getItem(EVENT_STORAGE_KEY);
    const events = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(events)) {
      throw new Error('Los eventos guardados no son una lista.');
    }
    if (isActive()) set({ events: sortEvents(events) });
  },
  addEvent: async (event) => {
    const events = sortEvents([...get().events, event]);
    await AsyncStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events));
    set({ events });
  },
  updateEvent: async (id, changes) => {
    const events = sortEvents(get().events.map((event) =>
      event.id === id ? { ...event, ...changes } : event,
    ));
    await AsyncStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events));
    set({ events });
  },
  deleteEvent: async (id) => {
    const events = get().events.filter((event) => event.id !== id);
    await AsyncStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events));
    set({ events });
  },
  clearEvents: () => set({ events: [] }),
}));
