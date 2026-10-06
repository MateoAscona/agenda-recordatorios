# Agenda y recordatorios

Aplicación móvil para el parcial de Aplicaciones Móviles. Opción elegida: **Agenda / Recordatorios**.

## Ejecutar

```bash
npm install
npm start
```

Abrí el QR con Expo Go compatible con SDK 57, con el teléfono y la computadora en la misma red. Si Metro ya estaba abierto antes de actualizar el código, detenelo con Ctrl+C y ejecutá `npm start -- --clear`.

## Funcionalidades

- Registro e inicio de sesión local.
- Alta de eventos con título, calendario y selector de hora nativos; listado y eliminación.
- Eventos guardados en AsyncStorage para conservarlos al cerrar la app.
- Notificación local en la fecha del evento, si se concede el permiso; al eliminarlo se cancela el aviso pendiente.
- Pruebas con Jest y React Native Testing Library: `npm test`.

## Notificaciones

Solo se usan notificaciones locales, disponibles en Expo Go. `localNotifications.js` importa únicamente los módulos locales para evitar que el índice de `expo-notifications` 57.0.21 inicialice push remoto y bloquee el arranque en Android. Estas rutas internas deben revisarse al actualizar el paquete. No se ocultan errores ni se desactivan recordatorios.

Al iniciar se solicita permiso si todavía se puede preguntar. En Android se intenta crear el canal `Eventos`; si Expo Go no ofrece esa función, se usa el canal de respaldo de Expo Notifications. En Expo Go el permiso corresponde a Expo Go; si ya fue concedido, o rechazado sin posibilidad de preguntar otra vez, no aparece otro diálogo. En Android anteriores a 13 no se pide ese permiso en tiempo de ejecución. Android puede retrasar el aviso si no permite programar alarmas exactas.

Si no hay permiso, se informa cómo habilitarlo en Ajustes. Si falla la programación aun con permiso, se muestra el error recibido; el evento se conserva sin recordatorio. No se agregan avisos retroactivamente a eventos guardados sin uno.


## Video de demostración

**[Link al video](https://drive.google.com/file/d/1wKu3JZf484tV8OdpRtdkf75vz_lCi1LN/view?usp=sharing)**.
