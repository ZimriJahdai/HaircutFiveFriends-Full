import { StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Card } from '../../../shared/components';
import { FONTS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { formatCurrency, formatDateTime } from '../../../shared/utils/format';

const STATUS_TONE = { COMPLETADO: 'success', CANCELADO: 'danger', PENDIENTE: 'warning' };

export function InvoiceCard({ sale, onDownload, downloading }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.total}>{formatCurrency(sale.total)}</Text>
        <Badge label={sale.status} tone={STATUS_TONE[sale.status] || 'neutral'} />
      </View>
      <Text style={styles.date}>{formatDateTime(sale.saleDate || sale.createdAt)}</Text>
      {sale.totalPointsUsed > 0 ? <Text style={styles.points}>Canjeado con {sale.totalPointsUsed} puntos</Text> : null}
      <Button title="Descargar / Compartir PDF" variant="secondary" onPress={onDownload} loading={downloading} />
    </Card>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: { gap: SPACING.xs },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  total: { fontSize: FONT_SIZE.lg, fontFamily: FONTS.displayBold, fontWeight: '700', color: colors.text },
  date: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: colors.textSecondary },
  points: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.semibold, fontWeight: '600', color: colors.secondary },
});
