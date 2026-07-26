import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Button, Card } from '../../../shared/components';
import { FONTS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { formatDateTime } from '../../../shared/utils/format';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';

export function AppointmentCard({ appointment, onCancel }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const canCancel = appointment.status === 'PENDIENTE' && typeof onCancel === 'function';

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.service}>{appointment.serviceId?.name || 'Servicio'}</Text>
        <AppointmentStatusBadge status={appointment.status} />
      </View>

      <View style={styles.row}>
        <MaterialIcons name="event" size={16} color={colors.textMuted} />
        <Text style={styles.meta}>{formatDateTime(appointment.appointmentDate)}</Text>
      </View>

      {appointment.barberId?.name ? (
        <View style={styles.row}>
          <MaterialIcons name="content-cut" size={16} color={colors.textMuted} />
          <Text style={styles.meta}>{appointment.barberId.name}</Text>
        </View>
      ) : null}

      {canCancel ? (
        <Button title="Cancelar cita" variant="danger" onPress={() => onCancel(appointment)} style={styles.cancelButton} />
      ) : null}
    </Card>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: { gap: SPACING.xs },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  service: { fontSize: FONT_SIZE.md, fontFamily: FONTS.semibold, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  meta: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: colors.textSecondary },
  cancelButton: { marginTop: SPACING.sm },
});
