import { useState } from 'react';
import { Button, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

export default function EventDateTimePicker({ value, onChange, disabled = false }) {
  const [mode, setMode] = useState(null);

  function selectValue(selectedMode, selectedDate) {
    const updatedDate = new Date(value);

    if (selectedMode === 'date') {
      updatedDate.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      );
    } else {
      updatedDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
    }

    updatedDate.setSeconds(0, 0);
    onChange(updatedDate);
  }

  function openPicker(selectedMode) {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode: selectedMode,
        is24Hour: true,
        display: 'default',
        onValueChange: (_, selectedDate) => selectValue(selectedMode, selectedDate),
        onDismiss: () => setMode(null),
      });
    } else {
      setMode(selectedMode);
    }
  }

  return (
    <View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Elegir fecha"
        style={[styles.field, disabled && styles.disabled]}
        onPress={() => openPicker('date')}
        disabled={disabled}
      >
        <Text style={styles.label}>Fecha</Text>
        <Text style={styles.value}>{value.toLocaleDateString('es-AR')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Elegir hora"
        style={[styles.field, disabled && styles.disabled]}
        onPress={() => openPicker('time')}
        disabled={disabled}
      >
        <Text style={styles.label}>Hora</Text>
        <Text style={styles.value}>
          {value.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </Text>
      </TouchableOpacity>
      {mode ? (
        <View>
          <DateTimePicker
            value={value}
            mode={mode}
            display="spinner"
            disabled={disabled}
            onValueChange={(_, selectedDate) => selectValue(mode, selectedDate)}
            onDismiss={() => setMode(null)}
          />
          <Button title="Listo" onPress={() => setMode(null)} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    borderColor: '#999',
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    color: '#555',
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
});
