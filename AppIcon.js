import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from './theme';

export default function AppIcon({ name, size = 20, color = colors.primary }) {
  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
