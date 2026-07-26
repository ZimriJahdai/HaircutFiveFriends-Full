import { StyleSheet, View } from 'react-native';

import { Button } from '../../../shared/components';
import { SPACING } from '../../../shared/constants/theme';

// Acciones de cuenta: enviar enlace de cambio de contraseña + cerrar sesión.
export function ProfileQuickActions({ onSendPasswordReset, sendingReset, onLogout }) {
  return (
    <View style={styles.wrapper}>
      <Button
        title="Enviar enlace para cambiar contraseña"
        variant="secondary"
        onPress={onSendPasswordReset}
        loading={sendingReset}
      />
      <Button title="Cerrar sesión" variant="danger" onPress={onLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: SPACING.md },
});
