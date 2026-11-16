import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import AppIcon from './AppIcon';
import { colors } from './theme';

export default function ActionButton({ title, icon, onPress, disabled = false, variant = 'primary', accessibilityLabel, style }) {
  const color = variant === 'primary' ? colors.surface : colors.primary;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled }}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, styles[variant], disabled && styles.disabled, style]}
    >
      {icon ? <AppIcon name={icon} color={color} /> : null}
      <Text style={[styles.label, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  link: { backgroundColor: 'transparent' },
  label: { fontSize: 15, fontWeight: '600', flexShrink: 1, textAlign: 'center' },
  disabled: { opacity: 0.45 },
});
