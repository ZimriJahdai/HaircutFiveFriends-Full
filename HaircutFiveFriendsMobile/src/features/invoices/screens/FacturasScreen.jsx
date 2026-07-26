import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState, LoadingSpinner } from '../../../shared/components';
import { SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { getId } from '../../../shared/api';
import { notify } from '../../../shared/utils/confirm';
import { InvoiceCard } from '../components';
import { useInvoices } from '../hooks/useInvoices';

export function FacturasScreen() {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const { sales, loading, error, refetch, downloadInvoice, downloadingId } = useInvoices();

  const onDownload = async (sale) => {
    const result = await downloadInvoice(sale);
    if (!result.ok) notify('Error', result.error);
  };

  if (loading && sales.length === 0) return <LoadingSpinner message="Cargando tus facturas..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={sales}
        keyExtractor={(item) => String(getId(item))}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState icon="receipt-long" title="Sin facturas" message={error || 'Aún no tienes compras registradas.'} />
        }
        renderItem={({ item }) => (
          <InvoiceCard sale={item} onDownload={() => onDownload(item)} downloading={downloadingId === getId(item)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
      />
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: SPACING.lg },
});
