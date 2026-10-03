import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, StyleSheet, Text, View } from 'react-native';

const Stack = createNativeStackNavigator();

function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agenda y recordatorios</Text>
      <Text style={styles.text}>Pantalla de inicio de sesión</Text>
      <View style={styles.button}>
        <Button
          title="Registrarme"
          onPress={() => navigation.navigate('Registro')}
        />
      </View>
    </View>
  );
}

function RegisterScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <Text style={styles.text}>Pantalla para crear una cuenta</Text>
      <View style={styles.button}>
        <Button title="Volver al inicio" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis eventos</Text>
      <Text style={styles.text}>Todavía no hay eventos para mostrar.</Text>
      <View style={styles.button}>
        <Button
          title="Crear evento"
          onPress={() => navigation.navigate('AltaEvento')}
        />
      </View>
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
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Iniciar sesión' }}
        />
        <Stack.Screen
          name="Registro"
          component={RegisterScreen}
          options={{ title: 'Registro' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Agenda' }}
        />
        <Stack.Screen
          name="AltaEvento"
          component={CreateEventScreen}
          options={{ title: 'Nuevo evento' }}
        />
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
  button: {
    marginTop: 8,
  },
});
