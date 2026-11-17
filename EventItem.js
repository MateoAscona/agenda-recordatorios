import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatEventDate, formatEventLocation } from './events';
import ActionButton from './ActionButton';
import AppIcon from './AppIcon';
import { colors } from './theme';

export default function EventItem({ event, onDelete, onEdit, onCalendar, calendarBusy = false, disabled = false }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{event.title}</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ${event.title}`}
          style={[styles.deleteButton, disabled && styles.disabled]}
          disabled={disabled}
          onPress={() => onDelete(event.id)}
        >
          <AppIcon name="trash-outline" size={17} color={colors.danger} />
          <Text style={styles.deleteText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.dateRow}>
        <AppIcon name="time-outline" size={16} color={colors.muted} />
        <Text style={styles.date}>{formatEventDate(event.date)}</Text>
      </View>
        {event.imageUri ? (
          <Image accessibilityLabel={`Foto de ${event.title}`} source={{ uri: event.imageUri }} style={styles.image} />
        ) : null}
        {event.location ? (
          <View style={styles.metadata}>
            <AppIcon name="location-outline" size={17} />
            <Text style={styles.metadataText}>Ubicación: {formatEventLocation(event.location)}</Text>
          </View>
        ) : null}
        {event.contact ? (
          <View style={styles.metadata}>
            <AppIcon name="person-outline" size={17} />
            <Text style={styles.metadataText}>Contacto: {event.contact.name}{event.contact.phone ? ` (${event.contact.phone})` : ''}</Text>
          </View>
        ) : null}
        {onEdit ? (
          <ActionButton
            title="Editar evento"
            accessibilityLabel={`Editar ${event.title}`}
            icon="create-outline"
            variant="secondary"
            style={styles.calendarButton}
            disabled={disabled}
            onPress={() => onEdit(event.id)}
          />
        ) : null}
        {onCalendar ? (
          <ActionButton
            title={event.calendarEventId ? 'Ya agregado al calendario' : calendarBusy ? 'Agregando...' : 'Agregar al calendario'}
            icon={event.calendarEventId ? 'checkmark-circle-outline' : 'calendar-outline'}
            variant="secondary"
            accessibilityLabel={`Agregar ${event.title} al calendario`}
            style={styles.calendarButton}
            disabled={disabled || Boolean(event.calendarEventId)}
            onPress={() => onCalendar(event)}
          />
        ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  calendarButton: {
    marginTop: 14,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginTop: 14,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    padding: 18,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '700',
    flex: 1,
    paddingTop: 8,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8 },
  date: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primarySoft,
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  metadataText: { color: colors.primary, fontSize: 13, lineHeight: 20, flex: 1 },
  deleteButton: {
    minHeight: 44,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: colors.dangerSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  deleteText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  disabled: { opacity: 0.45 },
});
