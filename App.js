import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Button,
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
  EVENT_STORAGE_KEY,
  getEventDateFields,
  sortEvents,
  validateEvent,
} from './events';
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
  events,
  eventsLoading,
  notificationsLoading,
  eventsError,
  actionError,
  notificationMessage,
  onDeleteEvent,
}) {
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
        disabled={eventsLoading || notificationsLoading || Boolean(eventsError)}
      >
        <Text style={styles.primaryButtonText}>Crear evento</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={onLogout}>
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
      await onCreateEvent(createEvent(title, date, time));
      navigation.goBack();
    } catch {
      setError('No se pudo guardar el evento.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <Text style={styles.title}>Nuevo evento</Text>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
        maxLength={80}
      />
      <EventDateTimePicker
        value={dateTime}
        onChange={setDateTime}
        disabled={saving}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.primaryButton, saving && styles.disabledButton]}
        onPress={handleCreateEvent}
        disabled={saving}
      >
        <Text style={styles.primaryButtonText}>
          {saving ? 'Guardando...' : 'Guardar evento'}
        </Text>
      </TouchableOpacity>
      <View style={styles.button}>
        <Button title="Volver a la agenda" onPress={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationsLoading, setNotificationsLoading] = useState(true);

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
      setEvents([]);
      setEventsLoading(false);
      setEventsError('');
      setActionError('');
      return undefined;
    }

    let active = true;
    setEventsLoading(true);
    setEventsError('');

    async function loadEvents() {
      try {
        const savedEvents = await AsyncStorage.getItem(EVENT_STORAGE_KEY);
        const parsedEvents = savedEvents ? JSON.parse(savedEvents) : [];

        if (!Array.isArray(parsedEvents)) {
          throw new Error('Los eventos guardados no son una lista.');
        }

        if (active) {
          setEvents(sortEvents(parsedEvents));
        }
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

    loadEvents();
    return () => {
      active = false;
    };
  }, [loggedIn]);

  async function handleCreateEvent(event) {
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

    const savedEvent = { ...event, notificationId };
    const updatedEvents = sortEvents([...events, savedEvent]);

    try {
      await AsyncStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(updatedEvents));
    } catch (error) {
      await cancelEventNotification(notificationId).catch(() => null);
      throw error;
    }

    setEvents(updatedEvents);
    setActionError('');
    setNotificationMessage(warning);
  }

  async function handleDeleteEvent(eventId) {
    const eventToDelete = events.find((event) => event.id === eventId);
    const updatedEvents = events.filter((event) => event.id !== eventId);

    try {
      await cancelEventNotification(eventToDelete?.notificationId);
      await AsyncStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
      setActionError('');
      setNotificationMessage('');
    } catch {
      setActionError('No se pudo eliminar el evento o cancelar su recordatorio.');
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
                  events={events}
                  eventsLoading={eventsLoading}
                  notificationsLoading={notificationsLoading}
                  eventsError={eventsError}
                  actionError={actionError}
                  notificationMessage={notificationMessage}
                  onDeleteEvent={handleDeleteEvent}
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
