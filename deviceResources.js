import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts/legacy';
import { Directory, File, Paths } from 'expo-file-system';

function requirePermission(permission, resource) {
  if (!permission.granted) {
    throw new Error(`No se concedió permiso para ${resource}. Podés habilitarlo en Ajustes del teléfono.`);
  }
}

export async function pickEventImage(source) {
  const camera = source === 'camera';
  const permission = camera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  requirePermission(permission, camera ? 'la cámara' : 'las fotos');
  const options = { mediaTypes: ['images'], quality: 0.7 };
  const result = camera
    ? await ImagePicker.launchCameraAsync(options)
    : await ImagePicker.launchImageLibraryAsync(options);
  return result.canceled ? null : result.assets?.[0]?.uri ?? null;
}

export async function saveEventImage(uri) {
  const directory = new Directory(Paths.document, 'event-images');
  directory.create({ idempotent: true, intermediates: true });
  const extension = uri.split(/[?#]/)[0].split('.').pop().toLowerCase();
  const suffix = ['jpg', 'jpeg', 'png', 'heic', 'webp'].includes(extension) ? extension : 'jpg';
  const destination = new File(directory, `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${suffix}`);
  try {
    await new File(uri).copy(destination);
    return destination.uri;
  } catch (error) {
    if (destination.exists) destination.delete();
    throw error;
  }
}

export async function deleteEventImage(uri) {
  if (!uri) return;
  const directory = new Directory(Paths.document, 'event-images');
  const prefix = `${directory.uri.replace(/\/$/, '')}/`;
  if (!uri.startsWith(prefix)) return;
  const name = uri.slice(prefix.length);
  if (!/^event-\d+-[a-z0-9]+\.(jpg|jpeg|png|heic|webp)$/.test(name)) return;
  const file = new File(uri);
  if (file.exists) file.delete();
}

export async function getEventLocation() {
  requirePermission(await Location.requestForegroundPermissionsAsync(), 'la ubicación');
  if (!await Location.hasServicesEnabledAsync()) {
    throw new Error('Activá la ubicación del teléfono e intentá nuevamente.');
  }
  let timer;
  try {
    const position = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Se agotó el tiempo para obtener la ubicación. Intentá nuevamente.')), 20000);
      }),
    ]);
    return { latitude: position.coords.latitude, longitude: position.coords.longitude };
  } finally {
    clearTimeout(timer);
  }
}

export async function pickEventContact() {
  requirePermission(await Contacts.requestPermissionsAsync(), 'los contactos');
  const contact = await Contacts.presentContactPickerAsync();
  return contact ? {
    id: contact.id,
    name: contact.name || 'Contacto sin nombre',
    phone: contact.phoneNumbers?.[0]?.number ?? null,
  } : null;
}
