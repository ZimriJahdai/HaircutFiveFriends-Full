import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, LoadingSpinner } from '../../../shared/components';
import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { useClientProfileStore } from '../../../shared/store/clientProfileStore';
import { apiClient, getApiError } from '../../../shared/api';
import { saveAndSharePdf } from '../../../shared/utils/pdf';
import { useSales } from '../../sales/hooks/useSales';

export function ReportesScreen() {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const { fetchMySales } = useSales();
  const points = useClientProfileStore((state) => state.points);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
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

  const completedSales = sales.filter((sale) => sale.status === 'COMPLETADO' || sale.status === 'COMPLETADA').length;
  const canceledSales = sales.filter((sale) => sale.status === 'CANCELADO' || sale.status === 'CANCELADA').length;
  const totalSpent = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const averageTicket = sales.length > 0 ? totalSpent / sales.length : 0;

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const res = await apiClient.get('/statistics/client/pdf', { responseType: 'arraybuffer' });
      await saveAndSharePdf(res.data, 'reporte-cliente.pdf');
    } catch (err) {
      setError(getApiError(err, 'No se pudo descargar el reporte'));
    } finally {
      setDownloading(false);
    }
  };

  if (loading && sales.length === 0) return <LoadingSpinner message="Cargando reportes..." />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
    >
      <Text style={styles.title}>Reportes</Text>
      <Text style={styles.subtitle}>Resumen de tu actividad, compras y puntos acumulados.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.grid}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Puntos actuales</Text>
          <Text style={styles.statValue}>{points}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Compras completadas</Text>
          <Text style={styles.statValue}>{completedSales}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Compras canceladas</Text>
          <Text style={styles.statValue}>{canceledSales}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Ticket promedio</Text>
          <Text style={styles.statValue}>{averageTicket.toFixed(2)}</Text>
        </Card>
      </View>

      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Actividad reciente</Text>
        <Text style={styles.summaryText}>Compras registradas: {sales.length}</Text>
        <Text style={styles.summaryText}>Monto total: {totalSpent.toFixed(2)}</Text>
        <Text style={styles.summaryText}>Este reporte usa los datos de tus compras y el PDF del backend.</Text>
      </Card>

      <View style={styles.actions}>
        <Button title={downloading ? 'Generando...' : 'Descargar reporte PDF'} onPress={downloadReport} gradient loading={downloading} />
      </View>

      {downloading ? (
        <View style={styles.downloadHint}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.downloadText}>Preparando tu reporte...</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
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
    marginBottom: SPACING.lg,
  },
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  statCard: {
    width: '48%',
    minWidth: 150,
    gap: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.semibold,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontFamily: FONTS.displayBold,
    fontWeight: '800',
    color: colors.text,
  },
  summaryCard: { marginTop: SPACING.lg, gap: SPACING.xs },
  summaryTitle: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.semibold,
    fontWeight: '700',
    color: colors.text,
    marginBottom: SPACING.xs,
  },
  summaryText: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actions: { marginTop: SPACING.lg },
  downloadHint: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  downloadText: {
    color: colors.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.body,
  },
});
