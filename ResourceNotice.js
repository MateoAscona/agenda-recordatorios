import { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ActionButton from './ActionButton';
import AppIcon from './AppIcon';
import { resourceDetails } from './devicePermissions';
import { colors } from './theme';

export default function ResourceNotice({ notice, onDismiss }) {
  const [settingsError, setSettingsError] = useState('');
  useEffect(() => setSettingsError(''), [notice]);
  const info = resourceDetails[notice.resource];

  async function openSettings() {
    try {
      await Linking.openSettings();
    } catch {
      setSettingsError('No se pudieron abrir los ajustes. Puedes acceder desde la configuración del teléfono.');
    }
  }

  return (
    <View style={styles.container} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <View style={styles.header}>
        <View style={styles.icon}><AppIcon name={info.icon} color={colors.noticeText} /></View>
        <Text style={styles.title}>{notice.title || info.title}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cerrar aviso" style={styles.close} onPress={onDismiss}>
          <AppIcon name="close-outline" color={colors.noticeText} />
        </TouchableOpacity>
      </View>
      <Text style={styles.message}>{notice.message}</Text>
      {notice.showSettings ? (
        <ActionButton title="Abrir ajustes" icon="settings-outline" variant="secondary" style={styles.settings} onPress={openSettings} />
      ) : null}
      {settingsError ? <Text style={styles.message}>{settingsError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.notice, borderWidth: 1, borderColor: '#EBD7AF', borderRadius: 16, padding: 14, marginVertical: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F6E5C3', alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.noticeText, fontSize: 15, lineHeight: 21, fontWeight: '700', flex: 1 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  message: { color: colors.noticeText, fontSize: 14, lineHeight: 21, marginTop: 8 },
  settings: { marginTop: 12 },
});
