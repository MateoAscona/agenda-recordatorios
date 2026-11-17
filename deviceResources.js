import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts/legacy';
import { Directory, File, Paths } from 'expo-file-system';
import { requestDevicePermission, resourceError, waitForDeviceResult } from './devicePermissions';

export async function pickEventImage(source, options = {}) {
  const camera = source === 'camera';
  const resource = camera ? 'camera' : 'gallery';
  await requestDevicePermission(resource,
    () => camera ? ImagePicker.getCameraPermissionsAsync() : ImagePicker.getMediaLibraryPermissionsAsync(),
    () => camera ? ImagePicker.requestCameraPermissionsAsync() : ImagePicker.requestMediaLibraryPermissionsAsync(), options);
  const pickerOptions = { mediaTypes: ['images'], quality: 0.7 };
  const result = await waitForDeviceResult(
    () => camera ? ImagePicker.launchCameraAsync(pickerOptions) : ImagePicker.launchImageLibraryAsync(pickerOptions),
    resource, { ...options, timeoutMs: 0 });
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

export async function getEventLocation(options = {}) {
  await requestDevicePermission('location', () => Location.getForegroundPermissionsAsync(), () => Location.requestForegroundPermissionsAsync(), options);
  const enabled = await waitForDeviceResult(() => Location.hasServicesEnabledAsync(), 'location', { ...options, timeoutReason: 'location-timeout' });
  if (!enabled) {
    throw resourceError('location', 'services-disabled');
  }
  const position = await waitForDeviceResult(
    () => Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
    'location', { ...options, timeoutMs: 20000, timeoutReason: 'location-timeout' });
  const location = { latitude: position.coords.latitude, longitude: position.coords.longitude };
  try {
    const [address] = await waitForDeviceResult(
      () => Location.reverseGeocodeAsync(location), 'location', { ...options, timeoutMs: 4000 });
    return { ...location, city: address?.city ?? null, region: address?.region ?? null };
  } catch (error) {
    if (options.signal?.aborted) throw resourceError('location', 'cancelled');
    return location;
  }
}

export async function pickEventContact(options = {}) {
  await requestDevicePermission('contacts', () => Contacts.getPermissionsAsync(), () => Contacts.requestPermissionsAsync(), options);
  const contact = await waitForDeviceResult(() => Contacts.presentContactPickerAsync(), 'contacts', { ...options, timeoutMs: 0 });
  return contact ? {
    id: contact.id,
    name: contact.name || 'Contacto sin nombre',
    phone: contact.phoneNumbers?.[0]?.number ?? null,
  } : null;
}
