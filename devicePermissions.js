export const resourceDetails = {
  camera: {
    title: 'Permiso de cámara', label: 'la cámara', icon: 'camera-outline',
    denied: 'No se autorizó la cámara. Puedes elegir una imagen de la galería o guardar el evento sin foto.',
    failure: 'No se pudo abrir la cámara. Intenta nuevamente o elige una foto de la galería.',
  },
  gallery: {
    title: 'Permiso de fotos', label: 'las fotos', icon: 'images-outline',
    denied: 'No se autorizó el acceso a tus fotos. Puedes tomar una con la cámara o guardar el evento sin imagen.',
    failure: 'No se pudo abrir la galería. Tu evento puede guardarse sin una imagen.',
  },
  location: {
    title: 'Permiso de ubicación', label: 'la ubicación', icon: 'location-outline',
    denied: 'No se autorizó la ubicación. Puedes guardar el evento sin coordenadas.',
    failure: 'No se pudo obtener tu ubicación. Comprueba la señal y vuelve a intentarlo; no se perderán los datos del evento.',
  },
  contacts: {
    title: 'Permiso de contactos', label: 'los contactos', icon: 'person-outline',
    denied: 'No se autorizó el acceso a tus contactos. Puedes guardar el evento sin asociar una persona.',
    failure: 'No se pudo abrir la agenda de contactos. Puedes continuar sin seleccionar uno.',
  },
  calendar: {
    title: 'Permiso de calendario', label: 'el calendario', icon: 'calendar-outline',
    denied: 'No se autorizó el calendario. El evento sigue guardado en la agenda de la app.',
    failure: 'No se pudo agregar al calendario del teléfono. El evento sigue guardado en la app.',
  },
  notifications: {
    title: 'Permiso de notificaciones', label: 'las notificaciones', icon: 'notifications-outline',
    denied: 'Las notificaciones están desactivadas. Los eventos se guardan, pero no recibirás sus recordatorios.',
    failure: 'No se pudo preparar la notificación. Puedes guardar el evento sin recordatorio.',
  },
};

export function resourceError(resource, reason, canAskAgain) {
  const info = resourceDetails[resource];
  const messages = {
    denied: `${info.denied}${canAskAgain === false ? ' Habilita el permiso desde los ajustes del teléfono.' : ' Puedes solicitarlo nuevamente cuando lo necesites.'}`,
    dismissed: `La solicitud de acceso a ${info.label} se cerró sin autorizarse. Puedes continuar sin este dato o volver a intentarlo.`,
    cancelled: `Se canceló la espera de acceso a ${info.label}. Los datos del evento no cambiaron.`,
    'permission-timeout': `No se recibió una respuesta al solicitar acceso a ${info.label}. Puedes continuar sin este dato o volver a solicitar el permiso.`,
    'services-disabled': 'La ubicación del teléfono está desactivada. Activa el GPS y vuelve a intentarlo. También puedes guardar el evento sin ubicación.',
    'location-timeout': 'No se pudo obtener la ubicación a tiempo. Busca un lugar con mejor señal o guarda el evento sin coordenadas.',
  };
  const error = new Error(messages[reason] || info.failure);
  error.resource = resource;
  error.reason = reason;
  error.canAskAgain = canAskAgain;
  return error;
}

export function getResourceNotice(resource, error) {
  return {
    resource,
    title: error?.reason === 'services-disabled' ? 'GPS desactivado' : resourceDetails[resource].title,
    message: error?.resource === resource ? error.message : resourceDetails[resource].failure,
    showSettings: error?.canAskAgain === false,
  };
}

export function waitForDeviceResult(operation, resource, { signal, timeoutMs = 15000, timeoutReason = 'permission-timeout' } = {}) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let timer;
    function finish(callback, value) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
      callback(value);
    }
    function cancel() { finish(reject, resourceError(resource, 'cancelled')); }
    if (signal?.aborted) { cancel(); return; }
    signal?.addEventListener('abort', cancel, { once: true });
    if (timeoutMs > 0) {
      timer = setTimeout(() => finish(reject, resourceError(resource, timeoutReason)), timeoutMs);
    }
    Promise.resolve().then(() => {
      if (signal?.aborted) throw resourceError(resource, 'cancelled');
      return operation();
    }).then((value) => finish(resolve, value), (error) => finish(reject, error));
  });
}

export async function requestDevicePermission(resource, getPermission, requestPermission, options = {}) {
  const current = await waitForDeviceResult(getPermission, resource, options);
  if (options.signal?.aborted) throw resourceError(resource, 'cancelled');
  if (current.granted) return current;
  if (current.canAskAgain === false) throw resourceError(resource, 'denied', false);
  const permission = await waitForDeviceResult(requestPermission, resource, options);
  if (options.signal?.aborted) throw resourceError(resource, 'cancelled');
  if (!permission.granted) {
    throw resourceError(resource, permission.status === 'undetermined' ? 'dismissed' : 'denied', permission.canAskAgain);
  }
  return permission;
}
