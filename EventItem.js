import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatEventDate } from './events';

export default function EventItem({ event, onDelete, onCalendar, calendarBusy = false, disabled = false }) {
  return (
    <View style={styles.container}>
      <View style={styles.details}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.date}>{formatEventDate(event.date)}</Text>
        {event.imageUri ? (
          <Image accessibilityLabel={`Foto de ${event.title}`} source={{ uri: event.imageUri }} style={styles.image} />
        ) : null}
        {event.location ? (
          <Text style={styles.date}>Ubicación: {event.location.latitude.toFixed(5)}, {event.location.longitude.toFixed(5)}</Text>
        ) : null}
        {event.contact ? (
          <Text style={styles.date}>Contacto: {event.contact.name}{event.contact.phone ? ` (${event.contact.phone})` : ''}</Text>
        ) : null}
        {onCalendar ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Agregar ${event.title} al calendario`}
            style={styles.calendarButton}
            disabled={disabled || Boolean(event.calendarEventId)}
            onPress={() => onCalendar(event)}
          >
            <Text style={styles.calendarText}>
              {event.calendarEventId ? 'Ya agregado al calendario' : calendarBusy ? 'Agregando...' : 'Agregar al calendario'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Eliminar ${event.title}`}
        style={styles.deleteButton}
        disabled={disabled}
        onPress={() => onDelete(event.id)}
      >
        <Text style={styles.deleteText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarButton: {
    paddingVertical: 10,
  },
  calendarText: {
    color: '#397253',
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 6,
    marginTop: 10,
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#f5f7f5',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 14,
  },
  details: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    color: '#555',
    marginTop: 6,
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    color: '#b42318',
  },
});
