import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatEventDate } from './events';

export default function EventItem({ event, onDelete }) {
  return (
    <View style={styles.container}>
      <View style={styles.details}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.date}>{formatEventDate(event.date)}</Text>
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Eliminar ${event.title}`}
        style={styles.deleteButton}
        onPress={() => onDelete(event.id)}
      >
        <Text style={styles.deleteText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
