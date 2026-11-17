# Agenda y recordatorios

Proyecto individual para el parcial de Aplicaciones Móviles de ISTEA.

**Autor:** Mateo Ascona

**Opción elegida:** Agenda / Recordatorios


## Funcionalidades

- Registro e inicio de sesión con usuario y contraseña.
- Acceso a la agenda únicamente después de iniciar sesión.
- Creación y edición de eventos con título, fecha y hora futura.
- Listado de eventos ordenados por fecha y opción de eliminarlos.
- Almacenamiento local con AsyncStorage para conservar la cuenta y los eventos al cerrar la app.
- Estado global de eventos con Zustand.
- Notificaciones locales en el horario del evento y cancelación del recordatorio al eliminarlo.
- Foto tomada con la cámara o elegida de la galería, guardada en archivos de la app.
- Ubicación actual con ciudad y provincia cuando están disponibles, y contacto opcional, visibles en la agenda.
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

Cada recurso muestra su propio aviso con un icono y una explicación. Si el permiso está bloqueado, el aviso permite abrir los ajustes. Una solicitud sin respuesta tiene un límite de espera de 15 segundos; también puede usarse **Cancelar espera** para continuar sin perder los datos del formulario. Al pulsar nuevamente el botón del recurso, la app consulta el permiso actual e inicia una solicitud nueva si el sistema permite volver a pedirlo. No reutiliza una espera cancelada. Cancelar la espera en la app no cierra una ventana de permisos que siga abierta en el sistema.

La ubicación corresponde al dispositivo en el momento de capturarla; no hay seguimiento en segundo plano. La app intenta identificar solamente la ciudad y provincia mediante el servicio de ubicación del teléfono, sin claves de API ni backend propio. La consulta puede necesitar conexión y no siempre encuentra un resultado: si falla o tarda más de 4 segundos, se conservan las coordenadas. Los eventos anteriores siguen siendo compatibles; puede capturarse nuevamente su ubicación al editarlos. Del contacto se guarda su nombre y, si tiene, un teléfono.

El botón **Editar evento** permite cambiar el título, la fecha, la hora y los datos opcionales, o quitar una foto, ubicación o contacto. Volver a la agenda sin guardar no modifica el evento. Si cambia el título u horario, se reemplaza su recordatorio; si falla la notificación, los cambios se guardan igualmente y se muestra un aviso. Si no se logra cancelar un aviso anterior, su identificador se conserva para reintentar al guardar o eliminar el evento.

El botón **Agregar al calendario** utiliza un calendario que permita escritura y conserva el vínculo para no volver a exportar el mismo evento. Si no hay calendarios disponibles, es necesario configurar uno en el teléfono. Editar o eliminar un evento de la agenda no modifica el calendario externo: los cambios se guardan solo en la app.

Si el calendario se crea pero falla el almacenamiento del vínculo, el mensaje indica reintentar sin cerrar la app. Ese reintento guarda el vínculo sin crear otra copia. Si se cierra la app antes de resolverlo, debe revisarse el calendario antes de exportar otra vez.

Estas integraciones requieren Android o iOS. Para probarlas con Expo Go se necesita una versión compatible con SDK 57; los textos de permisos de una compilación propia requieren reconstruirla al cambiar la configuración.

## Uso de inteligencia artificial

Para acompañar el desarrollo se utilizó **Codex** junto con **Gentle AI**. Codex actuó como asistente de desarrollo para analizar el proyecto, proponer cambios, escribir código y ejecutar verificaciones. Gentle AI aportó las reglas de trabajo y la coordinación del proceso para mantener cada cambio dentro del alcance acordado.

El trabajo siguió una versión liviana de **ODD (Organic Driven Development)**: comprender primero el problema, revisar el código existente, resolver las decisiones necesarias, implementar cambios pequeños y verificarlos antes de avanzar. Este enfoque evitó aplicar soluciones sin contexto y permitió conservar una relación clara entre cada requerimiento, su implementación y su validación.

También se utilizó **Engram** como memoria persistente del proyecto. Su función fue conservar decisiones, restricciones y hallazgos relevantes entre sesiones, sin reemplazar el código, el historial de Git ni la revisión humana.

El proceso de desarrollo fue el siguiente:

1. Análisis de los requerimientos y del estado actual de la aplicación.
2. Evaluación de alternativas y toma de decisiones técnicas según el alcance del proyecto.
3. Desarrollo asistido por agentes, con cambios acotados y verificaciones automáticas cuando correspondía.
4. Revisión humana final del comportamiento, los mensajes y la experiencia en el dispositivo.
5. Registro de los cambios en commits y publicación mediante push una vez aprobada cada entrega.

La IA se utilizó como herramienta de apoyo. Las decisiones finales, la validación funcional y la responsabilidad sobre el resultado permanecieron a cargo del autor.

### Que es Gentle-AI?

**Gentle-AI** es un entorno que potencia el desarrollo asistido por IA mediante metodologías, herramientas de análisis y mecanismos de control, sin reemplazar la supervisión humana.

Sus principales componentes son:
- **ODD (Organic Driven Development):** Metodología que organiza el desarrollo según la complejidad y los riesgos de cada tarea.
- **Engram:** Memoria persistente que conserva decisiones técnicas y contexto entre sesiones.
- **CodeGraph:** Analiza la estructura del código y sus dependencias para facilitar su comprensión.
- **RDD (Receipt-Driven Development):** Promueve verificaciones basadas en evidencias para validar los cambios.
- **Skills:** Incorporan conocimientos y procedimientos especializados reutilizables.
- **Orquestación multiagente:** Permite distribuir tareas entre agentes especializados.

En conjunto, Gentle-AI estructura el trabajo de los agentes, mientras que **el desarrollador mantiene el control de las decisiones técnicas, la revisión y la validación final del código**.

## Tests

Las 8 pruebas utilizan Jest y React Native Testing Library. Incluyen validación de credenciales y eventos e interacción con un componente.

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

## Verificación en teléfono

- Crear un evento básico, cerrar sesión e ingresar nuevamente: debe seguir en la agenda.
- Adjuntar una foto de cámara y otra de galería; reiniciar la app y comprobar que se ven.
- Capturar ubicación y elegir un contacto; comprobar sus datos en la agenda.
- Rechazar los permisos y desactivar el GPS: deben aparecer mensajes sin perder el formulario.
- Cerrar una solicitud de permiso con Atrás, cancelar la espera y pulsar nuevamente el recurso: debe realizarse un intento nuevo, sin aplicar resultados del intento cancelado.
- Editar un evento, cambiar su título y horario, quitar o reemplazar datos opcionales y reiniciar la app: deben conservarse los cambios y el identificador del evento.
- Editar sin guardar: el evento original debe permanecer igual. Comprobar ciudad y provincia con conexión y la alternativa de coordenadas si no se identifican.
- Agregar un evento al calendario y comprobar título, horario y que no se exporta dos veces.
- Eliminar un evento y comprobar que se cancela su notificación. Sin permiso de notificaciones, guardar igualmente un evento nuevo.

Los mocks de los tests no reemplazan estas comprobaciones en un dispositivo real.

### Evidencia de Tests

<img width="1081" height="297" alt="image" src="https://github.com/user-attachments/assets/770684b7-b8ec-45e2-ba74-a7e4bdb7e046" />


## Video de demostración

[Ver la demostración del Parcial 1](https://drive.google.com/file/d/1wKu3JZf484tV8OdpRtdkf75vz_lCi1LN/view?usp=sharing). Pendiente actualizar el video con las funcionalidades del Parcial 2.
