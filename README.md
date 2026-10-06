# Agenda y recordatorios

Proyecto individual para el parcial de Aplicaciones Móviles de ISTEA.

**Autor:** Mateo Ascona

**Opción elegida:** Agenda / Recordatorios

## Funcionalidades

- Registro e inicio de sesión con usuario y contraseña.
- Acceso a la agenda únicamente después de iniciar sesión.
- Creación de eventos con título, fecha y hora.
- Listado de eventos ordenados por fecha y opción de eliminarlos.
- Almacenamiento local con AsyncStorage para conservar la cuenta y los eventos al cerrar la app.
- Notificaciones locales en el horario del evento y cancelación del recordatorio al eliminarlo.

La aplicación no utiliza backend. La autenticación es local y guarda una única cuenta en el dispositivo.

## Cómo ejecutar la app

Necesitás Node.js, npm y Expo Go compatible con Expo SDK 57.

Desde la carpeta del proyecto:

```bash
npm install
npm start
```

Conectá el teléfono y la computadora a la misma red y abrí el código QR con Expo Go.

Si necesitás limpiar la caché de desarrollo:

```bash
npm start -- --clear
```

## Notificaciones

Para recibir recordatorios, habilitá las notificaciones cuando la app solicite permiso. Si utilizás Expo Go, el permiso corresponde a esa aplicación.

Si las notificaciones están desactivadas o no se puede programar el aviso, el evento se guarda igualmente y la app informa que quedó sin recordatorio. Habilitar el permiso después no programa avisos para esos eventos.

## Tests

Las pruebas utilizan Jest y React Native Testing Library. Incluyen validación de credenciales y eventos, interacción con componentes y lógica de notificaciones.

Para ejecutarlas:

```bash
npm test
```

Los tests contemplan:
- Autenticación (3): rechazan campos vacíos, crean la cuenta sin espacios extra en el usuario y comprueban las
   credenciales.
 - Eventos (4): validan campos obligatorios y fechas, crean y ordenan eventos, y conservan la fecha y hora locales.
 - Item de Evento (1): muestra el título y comprueba que el botón “Eliminar” llame a la función
   correspondiente.

### Evidencia de Tests

<img width="1081" height="297" alt="image" src="https://github.com/user-attachments/assets/770684b7-b8ec-45e2-ba74-a7e4bdb7e046" />


## Video de demostración

[Ver la demostración](https://drive.google.com/file/d/1wKu3JZf484tV8OdpRtdkf75vz_lCi1LN/view?usp=sharing)
