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
- Estado global de eventos con Zustand.
- Notificaciones locales en el horario del evento y cancelación del recordatorio al eliminarlo.
- Foto tomada con la cámara o elegida de la galería, guardada en archivos de la app.
- Ubicación actual y contacto opcionales, visibles en la agenda.
- Exportación al calendario del teléfono, con una duración de 30 minutos.

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

## Foto, ubicación, contactos y calendario

Los permisos se solicitan al usar cada función. Si se rechazan, la app muestra un mensaje y permite seguir creando eventos básicos. Pueden habilitarse desde los ajustes del teléfono.

La ubicación corresponde al dispositivo en el momento de capturarla; no hay seguimiento en segundo plano. Del contacto se guarda su nombre y, si tiene, un teléfono.

El botón **Agregar al calendario** utiliza un calendario que permita escritura y conserva el vínculo para no volver a exportar el mismo evento. Si no hay calendarios disponibles, es necesario configurar uno en el teléfono. Eliminar un evento de la agenda no lo elimina del calendario externo.

Si el calendario se crea pero falla el almacenamiento del vínculo, el mensaje indica reintentar sin cerrar la app. Ese reintento guarda el vínculo sin crear otra copia. Si se cierra la app antes de resolverlo, debe revisarse el calendario antes de exportar otra vez.

Estas integraciones requieren Android o iOS. Para probarlas con Expo Go se necesita una versión compatible con SDK 57; los textos de permisos de una compilación propia requieren reconstruirla al cambiar la configuración.

## Tests

Las pruebas versionadas utilizan Jest y React Native Testing Library. Incluyen validación de credenciales y eventos, interacción con componentes y persistencia del estado.

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
 - Estado de eventos (3): carga datos previos, persiste los cambios y maneja fallos de almacenamiento o una sesión cerrada durante la carga.

## Verificación en teléfono

- Crear un evento básico, cerrar sesión e ingresar nuevamente: debe seguir en la agenda.
- Adjuntar una foto de cámara y otra de galería; reiniciar la app y comprobar que se ven.
- Capturar ubicación y elegir un contacto; comprobar sus datos en la agenda.
- Rechazar los permisos y desactivar el GPS: deben aparecer mensajes sin perder el formulario.
- Agregar un evento al calendario y comprobar título, horario y que no se exporta dos veces.
- Eliminar un evento y comprobar que se cancela su notificación. Sin permiso de notificaciones, guardar igualmente un evento nuevo.

Los mocks de los tests no reemplazan estas comprobaciones en un dispositivo real.

### Evidencia de Tests

<img width="1081" height="297" alt="image" src="https://github.com/user-attachments/assets/770684b7-b8ec-45e2-ba74-a7e4bdb7e046" />


## Video de demostración

[Ver la demostración del Parcial 1](https://drive.google.com/file/d/1wKu3JZf484tV8OdpRtdkf75vz_lCi1LN/view?usp=sharing). Pendiente actualizar el video con las funcionalidades del Parcial 2.
