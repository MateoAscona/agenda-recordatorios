import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
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
import ActionButton from './ActionButton';
import AppIcon from './AppIcon';
import { colors } from './theme';
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
    <SafeAreaView edges={['bottom']} style={styles.homeContainer}>
      <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
        <View style={styles.authCard}>
          <View style={styles.brandMark}><AppIcon name="calendar-outline" size={36} /></View>
          <Text style={styles.title}>Agenda y recordatorios</Text>
          <Text style={styles.text}>Iniciá sesión para ver tus eventos.</Text>
          {notificationMessage ? (
            <Text style={styles.notice}>{notificationMessage}</Text>
          ) : null}
          {route.params?.registered ? (
            <Text style={styles.success}>Cuenta creada. Iniciá sesión.</Text>
          ) : null}
          <Text style={styles.fieldLabel}>Usuario</Text>
          <TextInput
            style={styles.input}
            placeholder="Usuario"
            placeholderTextColor={colors.muted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.fieldLabel}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <ActionButton
            title={loading ? 'Ingresando...' : 'Iniciar sesión'}
            icon="log-in-outline"
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={loading}
          />
          <ActionButton
            title="Crear una cuenta"
            icon="person-add-outline"
            variant="link"
            style={styles.button}
            onPress={() => navigation.navigate('Registro')}
          />
        </View>
      </ScrollView>
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
    <SafeAreaView edges={['bottom']} style={styles.homeContainer}>
      <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
        <View style={styles.authCard}>
          <View style={styles.brandMark}><AppIcon name="person-add-outline" size={34} /></View>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.text}>Elegí un usuario y una contraseña.</Text>
          <Text style={styles.fieldLabel}>Usuario</Text>
          <TextInput
            style={styles.input}
            placeholder="Usuario"
            placeholderTextColor={colors.muted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.fieldLabel}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <ActionButton
            title={loading ? 'Guardando...' : 'Registrarme'}
            icon="checkmark-circle-outline"
            style={styles.primaryButton}
            onPress={handleRegister}
            disabled={loading}
          />
          <ActionButton
            title="Volver al inicio"
            icon="arrow-back-outline"
            variant="link"
            style={styles.button}
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
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
      <View style={styles.agendaHeader}>
        <View style={styles.headerDetails}>
          <Text style={styles.eyebrow}>Agenda personal</Text>
          <Text style={styles.homeTitle}>Mis eventos</Text>
          <Text style={styles.headerCaption}>Tus planes, en un solo lugar.</Text>
        </View>
        <View style={styles.headerIcon}><AppIcon name="calendar-outline" size={32} color={colors.accent} /></View>
      </View>
      {eventsLoading ? (
        <Text style={styles.text}>Cargando eventos...</Text>
      ) : eventsError ? null : events.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.brandMark}><AppIcon name="calendar-clear-outline" size={32} /></View>
          <Text style={styles.emptyTitle}>Tu agenda empieza aquí</Text>
          <Text style={styles.text}>Todavía no hay eventos para mostrar.</Text>
        </View>
      ) : (
        <ScrollView style={styles.eventList} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.notice}>{notificationMessage}</Text>
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
      <ActionButton
        title="Crear evento"
        icon="add-circle-outline"
        style={styles.primaryButton}
        onPress={() => navigation.navigate('AltaEvento')}
        disabled={eventsLoading || notificationsLoading || Boolean(eventsError) || calendarBusyId !== null}
      />
      <ActionButton title="Cerrar sesión" icon="log-out-outline" variant="link" style={styles.button} onPress={onLogout} disabled={calendarBusyId !== null} />
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
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formHeading}>
          <View style={styles.sectionIcon}><AppIcon name="create-outline" size={26} /></View>
          <View style={styles.headerDetails}>
            <Text style={styles.formTitle}>Nuevo evento</Text>
            <Text style={styles.formCaption}>Un lugar para tus próximos planes.</Text>
          </View>
        </View>
        <Text style={styles.fieldLabel}>Nombre del evento</Text>
        <TextInput
          style={styles.input}
          placeholder="Título"
          placeholderTextColor={colors.muted}
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
        <Text style={styles.sectionTitle}>Datos opcionales</Text>
        <Text style={styles.formCaption}>Agrega una foto, ubicación o contacto.</Text>
        <View style={styles.attachmentGrid}>
          <ActionButton title="Tomar foto" icon="camera-outline" variant="secondary" style={styles.attachmentButton} disabled={busy} onPress={() => attach('imageUri', () => pickEventImage('camera'))} />
          <ActionButton title="Elegir de galería" icon="images-outline" variant="secondary" style={styles.attachmentButton} disabled={busy} onPress={() => attach('imageUri', () => pickEventImage('gallery'))} />
        </View>
        {attachments.imageUri ? (
          <>
            <Image accessibilityLabel="Foto seleccionada" source={{ uri: attachments.imageUri }} style={styles.eventImage} />
            <ActionButton title="Quitar foto" icon="close-circle-outline" variant="link" disabled={busy} onPress={() => setAttachments((current) => ({ ...current, imageUri: null }))} />
          </>
        ) : null}
        <View style={styles.button}>
          <ActionButton title="Usar ubicación actual" icon="location-outline" variant="secondary" disabled={busy} onPress={() => attach('location', getEventLocation)} />
        </View>
        {attachments.location ? (
          <Text style={styles.selectedData}>Ubicación del dispositivo: {attachments.location.latitude.toFixed(5)}, {attachments.location.longitude.toFixed(5)}</Text>
        ) : null}
        <View style={styles.button}>
          <ActionButton title="Seleccionar contacto" icon="person-outline" variant="secondary" disabled={busy} onPress={() => attach('contact', pickEventContact)} />
        </View>
        {attachments.contact ? <Text style={styles.selectedData}>Contacto: {attachments.contact.name}</Text> : null}
        {resourceLoading ? <Text style={styles.text}>Esperando al dispositivo...</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <ActionButton
          title={saving ? 'Guardando...' : 'Guardar evento'}
          icon="checkmark-circle-outline"
          style={styles.primaryButton}
          onPress={handleCreateEvent}
          disabled={busy}
        />
        <View style={styles.button}>
          <ActionButton title="Volver a la agenda" icon="arrow-back-outline" variant="link" disabled={busy} onPress={() => navigation.goBack()} />
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
      <StatusBar style="dark" />
      <Stack.Navigator
        key={loggedIn ? 'agenda' : 'acceso'}
        initialRouteName={loggedIn ? 'Home' : 'Login'}
        screenOptions={{
          headerTitleAlign: 'center',
          headerTintColor: colors.primary,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { fontSize: 17, fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
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
    height: 200,
    borderRadius: 18,
    marginVertical: 12,
  },
  homeContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  authContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  authCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 24,
  },
  brandMark: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    lineHeight: 33,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    marginBottom: 16,
    textAlign: 'center',
  },
  agendaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderRadius: 24,
    backgroundColor: colors.primaryDark,
    marginBottom: 18,
  },
  headerDetails: { flex: 1 },
  eyebrow: { color: '#BFD6C8', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  homeTitle: { color: colors.surface, fontSize: 28, lineHeight: 34, fontWeight: '700', marginBottom: 6 },
  headerCaption: { color: '#D3E4DA', fontSize: 13, lineHeight: 19 },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#2B5545',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 24,
  },
  emptyTitle: { fontSize: 19, fontWeight: '600', color: colors.text, marginBottom: 10, textAlign: 'center' },
  eventList: {
    flex: 1,
  },
  listContent: { paddingBottom: 8 },
  formContent: { paddingBottom: 20 },
  formHeading: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  sectionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: { fontSize: 24, lineHeight: 30, fontWeight: '700', color: colors.text },
  formCaption: { fontSize: 14, lineHeight: 20, color: colors.muted },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 26, marginBottom: 6 },
  attachmentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  attachmentButton: { flex: 1, minWidth: 130 },
  selectedData: {
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    fontSize: 13,
    lineHeight: 20,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  button: { marginTop: 10 },
  primaryButton: { marginTop: 20 },
  linkButton: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 12,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    borderRadius: 12,
    padding: 12,
    lineHeight: 20,
    marginTop: 12,
  },
  success: {
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    padding: 12,
    lineHeight: 20,
    textAlign: 'center',
  },
  notice: {
    color: colors.noticeText,
    backgroundColor: colors.notice,
    borderRadius: 12,
    padding: 12,
    lineHeight: 20,
    marginVertical: 12,
  },
});
