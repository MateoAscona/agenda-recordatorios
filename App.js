import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Button,
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

const Stack = createNativeStackNavigator();

function LoginScreen({ navigation, route, onLogin }) {
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
    <View style={styles.container}>
      <Text style={styles.title}>Agenda y recordatorios</Text>
      <Text style={styles.text}>Iniciá sesión para ver tus eventos.</Text>
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
    </View>
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
    <View style={styles.container}>
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
    </View>
  );
}

function HomeScreen({ navigation, onLogout }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis eventos</Text>
      <Text style={styles.text}>Todavía no hay eventos para mostrar.</Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('AltaEvento')}
      >
        <Text style={styles.primaryButtonText}>Crear evento</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={onLogout}>
        <Text style={styles.linkText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

function CreateEventScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuevo evento</Text>
      <Text style={styles.text}>Aquí se podrá agregar un evento.</Text>
      <View style={styles.button}>
        <Button title="Volver a la agenda" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
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
                <HomeScreen {...props} onLogout={() => setLoggedIn(false)} />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="AltaEvento"
              component={CreateEventScreen}
              options={{ title: 'Nuevo evento' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" options={{ title: 'Iniciar sesión' }}>
              {(props) => (
                <LoginScreen {...props} onLogin={() => setLoggedIn(true)} />
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
  );
}

const styles = StyleSheet.create({
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
