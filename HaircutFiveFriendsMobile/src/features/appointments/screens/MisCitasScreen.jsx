import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState, LoadingSpinner, Selector } from '../../../shared/components';
import { SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { confirmAction, notify } from '../../../shared/utils/confirm';
import { AppointmentCard } from '../components';
import { useMyAppointments } from '../hooks/useMyAppointments';

const CITAS_TABS = [
  { value: 'ReservarCita', label: 'Reservar' },
  { value: 'MisCitas', label: 'Mis citas' },
];

export function MisCitasScreen({ navigation }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const { appointments, loading, error, refetch, cancelAppointment } = useMyAppointments();

  const onCancel = (appointment) => {
    confirmAction({
      title: 'Cancelar cita',
      message: `¿Seguro que deseas cancelar tu cita de ${appointment.serviceId?.name || 'este servicio'}?`,
      confirmText: 'Cancelar cita',
      destructive: true,
      onConfirm: async () => {
        const result = await cancelAppointment(appointment._id);
        if (!result.ok) notify('Error', result.error);
      },
    });
  };

  if (loading && appointments.length === 0) return <LoadingSpinner message="Cargando tus citas..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        keyExtractor={(item) => String(item._id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Selector options={CITAS_TABS} value="MisCitas" onChange={(routeName) => navigation.navigate(routeName)} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="event-busy" title="Sin citas" message={error || 'Aún no has reservado ninguna cita.'} />
        }
        renderItem={({ item }) => <AppointmentCard appointment={item} onCancel={onCancel} />}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
      />
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: SPACING.lg },
  header: { marginBottom: SPACING.sm },
});
