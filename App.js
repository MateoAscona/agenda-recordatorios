import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Button,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  createAccount,
  credentialsMatch,
  USER_STORAGE_KEY,
  validateCredentials,
} from './auth';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import EventItem from './EventItem';
import EventDateTimePicker from './EventDateTimePicker';
import {
  createEvent,
  getEventDateFields,
  validateEvent,
} from './events';
import { useEventsStore } from './eventsStore';
import { createCalendarEvent } from './calendar';
import {
  pickEventImage, saveEventImage, deleteEventImage,
  getEventLocation, pickEventContact,
} from './deviceResources';
import {
  cancelEventNotification,
  getNotificationErrorMessage,
  requestNotificationPermission,
  scheduleEventNotification,
} from './notifications';
import * as Notifications from './localNotifications';

const Stack = createNativeStackNavigator();
const NOTIFICATION_PERMISSION_MESSAGE =
  'Las notificaciones están desactivadas. Habilitalas en Ajustes del teléfono (Expo Go si abrís la app allí).';

function LoginScreen({ navigation, route, onLogin, notificationMessage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!validateCredentials(username, password)) {
      setError('Completá el usuario y la contraseña.');
      return;
    }

    setLoading(true);

    try {
      const savedAccount = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const account = savedAccount ? JSON.parse(savedAccount) : null;

      if (!account) {
        setLoading(false);
        setError('Todavía no hay una cuenta. Registrate primero.');
        return;
      }

      if (!credentialsMatch(account, username, password)) {
        setLoading(false);
        setError('El usuario o la contraseña no coinciden.');
        return;
      }

      setLoading(false);
      setError('');
      onLogin();
    } catch {
      setLoading(false);
      setError('No se pudieron leer los datos guardados.');
    }
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <Text style={styles.title}>Agenda y recordatorios</Text>
      <Text style={styles.text}>Iniciá sesión para ver tus eventos.</Text>
      {notificationMessage ? (
        <Text style={styles.text}>{notificationMessage}</Text>
      ) : null}
      {route.params?.registered ? (
        <Text style={styles.success}>Cuenta creada. Iniciá sesión.</Text>
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('Registro')}
      >
        <Text style={styles.linkText}>Crear una cuenta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!validateCredentials(username, password)) {
      setError('Completá el usuario y la contraseña.');
      return;
    }

    setLoading(true);

    try {
      const account = createAccount(username, password);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(account));
      setLoading(false);
      navigation.navigate('Login', { registered: true });
    } catch {
      setLoading(false);
      setError('No se pudo guardar la cuenta.');
    }
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.text}>Elegí un usuario y una contraseña.</Text>
      <TextInput
        style={styles.input}
        placeholder="Usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.disabledButton]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'Guardando...' : 'Registrarme'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.linkText}>Volver al inicio</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function HomeScreen({
  navigation,
  onLogout,
  eventsLoading,
  notificationsLoading,
  eventsError,
  actionError,
  notificationMessage,
  onDeleteEvent,
  onCalendar,
  calendarBusyId,
}) {
  const events = useEventsStore((state) => state.events);
  return (
    <SafeAreaView edges={['bottom']} style={styles.homeContainer}>
      <Text style={styles.title}>Mis eventos</Text>
      {eventsLoading ? (
        <Text style={styles.text}>Cargando eventos...</Text>
      ) : eventsError ? null : events.length === 0 ? (
        <Text style={styles.text}>Todavía no hay eventos para mostrar.</Text>
      ) : (
        <ScrollView style={styles.eventList}>
          {events.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              onDelete={onDeleteEvent}
              onCalendar={onCalendar}
              calendarBusy={calendarBusyId === event.id}
              disabled={calendarBusyId !== null}
            />
          ))}
        </ScrollView>
      )}
      {eventsError ? <Text style={styles.error}>{eventsError}</Text> : null}
      {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
      {notificationMessage ? (
        <>
          <Text style={styles.text}>{notificationMessage}</Text>
          {notificationMessage.includes(NOTIFICATION_PERMISSION_MESSAGE) ? (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => Linking.openSettings().catch(() => {})}
            >
              <Text style={styles.linkText}>Abrir ajustes de notificaciones</Text>
            </TouchableOpacity>
          ) : null}
        </>
      ) : null}
      <TouchableOpacity
        style={[styles.primaryButton, eventsError && styles.disabledButton]}
        onPress={() => navigation.navigate('AltaEvento')}
        disabled={eventsLoading || notificationsLoading || Boolean(eventsError) || calendarBusyId !== null}
      >
        <Text style={styles.primaryButtonText}>Crear evento</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={onLogout} disabled={calendarBusyId !== null}>
        <Text style={styles.linkText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function CreateEventScreen({ navigation, onCreateEvent }) {
  const [title, setTitle] = useState('');
  const [dateTime, setDateTime] = useState(() => new Date(Date.now() + 60 * 60 * 1000));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [attachments, setAttachments] = useState({});
  const [resourceLoading, setResourceLoading] = useState(false);
  const busy = saving || resourceLoading;

  async function attach(field, action) {
    setResourceLoading(true);
    setError('');
    try {
      const value = await action();
      if (value) setAttachments((current) => ({ ...current, [field]: value }));
    } catch (resourceError) {
      setError(`No se pudo adjuntar el recurso. ${resourceError.message || 'Intentá nuevamente.'}`);
    } finally {
      setResourceLoading(false);
    }
  }

  async function handleCreateEvent() {
    const { date, time } = getEventDateFields(dateTime);
    const validationMessage = validateEvent(title, date, time);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onCreateEvent({ ...createEvent(title, date, time), ...attachments });
      navigation.goBack();
    } catch {
      setError('No se pudo guardar el evento.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.homeContainer}>
      <ScrollView keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Nuevo evento</Text>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
        maxLength={80}
        editable={!busy}
      />
      <EventDateTimePicker
        value={dateTime}
        onChange={setDateTime}
        disabled={busy}
      />
      <Text style={styles.text}>Datos opcionales</Text>
      <View style={styles.button}>
        <Button title="Tomar foto" disabled={busy} onPress={() => attach('imageUri', () => pickEventImage('camera'))} />
      </View>
      <View style={styles.button}>
        <Button title="Elegir de galería" disabled={busy} onPress={() => attach('imageUri', () => pickEventImage('gallery'))} />
      </View>
      {attachments.imageUri ? (
        <>
          <Image accessibilityLabel="Foto seleccionada" source={{ uri: attachments.imageUri }} style={styles.eventImage} />
          <Button title="Quitar foto" disabled={busy} onPress={() => setAttachments((current) => ({ ...current, imageUri: null }))} />
        </>
      ) : null}
      <View style={styles.button}>
        <Button title="Usar ubicación actual" disabled={busy} onPress={() => attach('location', getEventLocation)} />
      </View>
      {attachments.location ? (
        <Text style={styles.text}>Ubicación del dispositivo: {attachments.location.latitude.toFixed(5)}, {attachments.location.longitude.toFixed(5)}</Text>
      ) : null}
      <View style={styles.button}>
        <Button title="Seleccionar contacto" disabled={busy} onPress={() => attach('contact', pickEventContact)} />
      </View>
      {attachments.contact ? <Text style={styles.text}>Contacto: {attachments.contact.name}</Text> : null}
      {resourceLoading ? <Text style={styles.text}>Esperando al dispositivo...</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.primaryButton, busy && styles.disabledButton]}
        onPress={handleCreateEvent}
        disabled={busy}
      >
        <Text style={styles.primaryButtonText}>
          {saving ? 'Guardando...' : 'Guardar evento'}
        </Text>
      </TouchableOpacity>
      <View style={styles.button}>
        <Button title="Volver a la agenda" disabled={busy} onPress={() => navigation.goBack()} />
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const events = useEventsStore((state) => state.events);
  const loadEvents = useEventsStore((state) => state.loadEvents);
  const addEvent = useEventsStore((state) => state.addEvent);
  const updateEvent = useEventsStore((state) => state.updateEvent);
  const deleteEvent = useEventsStore((state) => state.deleteEvent);
  const clearEvents = useEventsStore((state) => state.clearEvents);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [calendarBusyId, setCalendarBusyId] = useState(null);
  const calendarBusy = useRef(false);
  const pendingCalendarLinks = useRef({});

  useEffect(() => {
    let active = true;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    requestNotificationPermission()
      .then((granted) => {
        if (active && !granted) {
          setNotificationMessage(NOTIFICATION_PERMISSION_MESSAGE);
        }
      })
      .catch((error) => {
        if (active) {
          setNotificationMessage(getNotificationErrorMessage(error));
        }
      })
      .finally(() => {
        if (active) {
          setNotificationsLoading(false);
        }
      });

    return () => {
      active = false;
      Notifications.setNotificationHandler(null);
    };
  }, []);

  useEffect(() => {
    if (!loggedIn) {
      clearEvents();
      setEventsLoading(false);
      setEventsError('');
      setActionError('');
      return undefined;
    }

    let active = true;
    setEventsLoading(true);
    setEventsError('');

    async function hydrateEvents() {
      try {
        await loadEvents(() => active);
      } catch {
        if (active) {
          setEventsError('No se pudieron cargar los eventos guardados.');
        }
      } finally {
        if (active) {
          setEventsLoading(false);
        }
      }
    }

    hydrateEvents();
    return () => {
      active = false;
    };
  }, [loggedIn]);

  async function handleCreateEvent(event) {
    const imageUri = event.imageUri ? await saveEventImage(event.imageUri) : null;
    let notificationId = null;
    let warning = '';

    try {
      notificationId = await scheduleEventNotification(event);
      if (!notificationId) {
        warning = `El evento se guardó sin recordatorio. ${NOTIFICATION_PERMISSION_MESSAGE}`;
      }
    } catch (error) {
      warning = `El evento se guardó sin recordatorio. ${getNotificationErrorMessage(error)}`;
    }

    const savedEvent = { ...event, ...(imageUri ? { imageUri } : {}), notificationId };
    try {
      await addEvent(savedEvent);
    } catch (error) {
      await cancelEventNotification(notificationId).catch(() => null);
      await deleteEventImage(imageUri).catch(() => null);
      throw error;
    }

    setActionError('');
    setNotificationMessage(warning);
  }

  async function handleDeleteEvent(eventId) {
    if (calendarBusy.current) return;
    const eventToDelete = events.find((event) => event.id === eventId);
    try {
      await cancelEventNotification(eventToDelete?.notificationId);
      await deleteEvent(eventId);
      setActionError('');
      setNotificationMessage('');
      try {
        await deleteEventImage(eventToDelete?.imageUri);
      } catch {
        setActionError('El evento se eliminó, pero no se pudo borrar su foto del dispositivo.');
      }
    } catch {
      setActionError('No se pudo eliminar el evento o cancelar su recordatorio.');
    }
  }

  async function handleCalendar(event) {
    if (calendarBusy.current || event.calendarEventId) return;
    calendarBusy.current = true;
    setCalendarBusyId(event.id);
    setActionError('');
    try {
      if (!pendingCalendarLinks.current[event.id]) {
        pendingCalendarLinks.current[event.id] = await createCalendarEvent(event);
      }
      try {
        await updateEvent(event.id, pendingCalendarLinks.current[event.id]);
        delete pendingCalendarLinks.current[event.id];
      } catch {
        setActionError('Se agregó al calendario, pero no se pudo guardar el vínculo. Reintentá sin cerrar la app para no duplicarlo.');
      }
    } catch (error) {
      setActionError(`No se pudo agregar al calendario. ${error.message || 'Intentá nuevamente.'}`);
    } finally {
      calendarBusy.current = false;
      setCalendarBusyId(null);
    }
  }

  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        key={loggedIn ? 'agenda' : 'acceso'}
        initialRouteName={loggedIn ? 'Home' : 'Login'}
        screenOptions={{ headerTitleAlign: 'center' }}
      >
        {loggedIn ? (
          <>
            <Stack.Screen name="Home" options={{ title: 'Agenda' }}>
              {(props) => (
                <HomeScreen
                  {...props}
                  eventsLoading={eventsLoading}
                  notificationsLoading={notificationsLoading}
                  eventsError={eventsError}
                  actionError={actionError}
                  notificationMessage={notificationMessage}
                  onDeleteEvent={handleDeleteEvent}
                  onCalendar={handleCalendar}
                  calendarBusyId={calendarBusyId}
                  onLogout={() => setLoggedIn(false)}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="AltaEvento"
              options={{ title: 'Nuevo evento' }}
            >
              {(props) => (
                <CreateEventScreen
                  {...props}
                  onCreateEvent={handleCreateEvent}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Login" options={{ title: 'Iniciar sesión' }}>
              {(props) => (
                <LoginScreen
                  {...props}
                  notificationMessage={notificationMessage}
                  onLogin={() => setLoggedIn(true)}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Registro"
              component={RegisterScreen}
              options={{ title: 'Registro' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  eventImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginVertical: 12,
  },
  homeContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  eventList: {
    flex: 1,
  },
  input: {
    borderColor: '#999',
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    marginTop: 16,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#397253',
    borderRadius: 6,
    marginTop: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 10,
  },
  linkText: {
    color: '#397253',
    fontSize: 15,
  },
  error: {
    color: '#b42318',
    marginTop: 12,
    textAlign: 'center',
  },
  success: {
    color: '#397253',
    marginBottom: 4,
    textAlign: 'center',
  },
});
