import { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import ActionButton from './ActionButton';
import AppIcon from './AppIcon';
import { colors } from './theme';

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
      <View style={styles.row}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Elegir fecha"
        style={[styles.field, disabled && styles.disabled]}
        onPress={() => openPicker('date')}
        disabled={disabled}
      >
        <View style={styles.fieldHeading}>
          <AppIcon name="calendar-outline" size={17} />
          <Text style={styles.label}>Fecha</Text>
        </View>
        <Text style={styles.value}>{value.toLocaleDateString('es-AR')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Elegir hora"
        style={[styles.field, disabled && styles.disabled]}
        onPress={() => openPicker('time')}
        disabled={disabled}
      >
        <View style={styles.fieldHeading}>
          <AppIcon name="time-outline" size={17} />
          <Text style={styles.label}>Hora</Text>
        </View>
        <Text style={styles.value}>
          {value.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </Text>
      </TouchableOpacity>
      </View>
      {mode ? (
        <View style={styles.pickerPanel}>
          <DateTimePicker
            value={value}
            mode={mode}
            display="spinner"
            disabled={disabled}
            onValueChange={(_, selectedDate) => selectValue(mode, selectedDate)}
            onDismiss={() => setMode(null)}
          />
          <ActionButton title="Listo" icon="checkmark-outline" onPress={() => setMode(null)} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginTop: 16 },
  field: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    minHeight: 88,
  },
  fieldHeading: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  label: {
    color: colors.muted,
    fontSize: 13,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  pickerPanel: { backgroundColor: colors.surface, borderRadius: 16, padding: 12, marginTop: 12 },
  disabled: {
    opacity: 0.6,
  },
});
