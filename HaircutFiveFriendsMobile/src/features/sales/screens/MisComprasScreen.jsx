import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Card, EmptyState, LoadingSpinner } from '../../../shared/components';
import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { formatCurrency, formatDateTime } from '../../../shared/utils/format';
import { useSales } from '../hooks/useSales';

const STATUS_TONE = { COMPLETADO: 'success', CANCELADO: 'danger', PENDIENTE: 'warning' };

export function MisComprasScreen() {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const { fetchMySales } = useSales();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await fetchMySales();
    if (result.ok) setSales(result.data || []);
    else setError(result.error);
    setLoading(false);
  }, [fetchMySales]);

  useEffect(() => {
    load();
  }, [load]);

  const totalSpent = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const totalOrders = sales.length;

  if (loading && sales.length === 0) return <LoadingSpinner message="Cargando tus compras..." />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis compras</Text>
        <Text style={styles.subtitle}>Historial de compras y pedidos realizados desde tu cuenta.</Text>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Pedidos</Text>
          <Text style={styles.statValue}>{totalOrders}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Gastado</Text>
          <Text style={styles.statValue}>{formatCurrency(totalSpent)}</Text>
        </Card>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={sales}
        keyExtractor={(item) => String(item._id || item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="shopping-cart"
            title="Sin compras"
            message="Aún no has realizado compras en la app."
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.amount}>{formatCurrency(item.total)}</Text>
              <Badge label={item.status} tone={STATUS_TONE[item.status] || 'neutral'} />
            </View>
            <Text style={styles.date}>{formatDateTime(item.saleDate || item.createdAt)}</Text>
            <Text style={styles.meta}>Detalles: {Array.isArray(item.detailId) ? item.detailId.length : 0}</Text>
            {item.totalPointsUsed > 0 ? <Text style={styles.points}>Pagado con {item.totalPointsUsed} puntos</Text> : null}
            {item.pointsMessage ? <Text style={styles.message}>{item.pointsMessage}</Text> : null}
            <Button title="Ver factura" variant="secondary" onPress={() => {}} disabled style={styles.action} />
          </Card>
        )}
      />
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: SPACING.lg },
  header: { marginBottom: SPACING.lg },
  title: {
    fontSize: FONT_SIZE.xxxl,
    fontFamily: FONTS.displayBold,
    fontWeight: '700',
    color: colors.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  statsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  statCard: { flex: 1, gap: SPACING.xs },
  statLabel: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.semibold, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  statValue: { fontSize: FONT_SIZE.xl, fontFamily: FONTS.displayBold, fontWeight: '800', color: colors.text },
  list: { paddingBottom: SPACING.xxl },
  card: { marginBottom: SPACING.md, gap: SPACING.xs },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amount: { fontSize: FONT_SIZE.lg, fontFamily: FONTS.displayBold, fontWeight: '700', color: colors.text },
  date: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: colors.textSecondary },
  meta: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: colors.textSecondary },
  points: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.semibold, fontWeight: '600', color: colors.secondary },
  message: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.body, color: colors.textSecondary },
  error: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    color: colors.danger,
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.body,
  },
  action: { marginTop: SPACING.sm },
});
