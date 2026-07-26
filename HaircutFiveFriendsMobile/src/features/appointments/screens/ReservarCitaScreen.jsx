import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, DateField, LoadingSpinner, Selector } from '../../../shared/components';
import { FONTS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { getId } from '../../../shared/api';
import { notify } from '../../../shared/utils/confirm';
import { formatDateTime } from '../../../shared/utils/format';
import { useServices } from '../../services/hooks/useServices';
import { useReservarCita } from '../hooks/useReservarCita';

const CITAS_TABS = [
  { value: 'ReservarCita', label: 'Reservar' },
  { value: 'MisCitas', label: 'Mis citas' },
];

export function ReservarCitaScreen({ navigation }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const { services, loading: loadingServices } = useServices();
  const { createAppointment, loading } = useReservarCita();
  const [serviceId, setServiceId] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(null);

  const serviceOptions = services.map((service) => ({ value: getId(service), label: service.name }));

  const onSubmit = async () => {
    if (!serviceId || !appointmentDate) {
      notify('Faltan datos', 'Elige un servicio y una fecha/hora.');
      return;
    }
    const result = await createAppointment({ serviceId, appointmentDate });
    if (!result.ok) {
      const suggestion = result.suggestedTime ? `\nHorario sugerido: ${formatDateTime(result.suggestedTime)}` : '';
      notify('No se pudo reservar', `${result.error}${suggestion}`);
      return;
    }
    notify('¡Cita reservada!', 'Puedes ver el detalle en Mis Citas.', () => navigation.navigate('MisCitas'));
    setServiceId(null);
    setAppointmentDate(null);
  };

  if (loadingServices) return <LoadingSpinner message="Cargando servicios..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Selector options={CITAS_TABS} value="ReservarCita" onChange={(routeName) => navigation.navigate(routeName)} />

        <Text style={styles.title}>Reservar cita</Text>
        <Text style={styles.subtitle}>Elige el servicio y el horario que prefieras. Te asignaremos un barbero disponible.</Text>

        <Selector label="Servicio" options={serviceOptions} value={serviceId} onChange={setServiceId} horizontal={false} />

        <DateField
          label="Fecha y hora"
          value={appointmentDate}
          onChange={setAppointmentDate}
          minimumDate={new Date()}
        />

        <Button title="Reservar cita" gradient onPress={onSubmit} loading={loading} disabled={!serviceId || !appointmentDate} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: SPACING.lg },
  title: { fontSize: FONT_SIZE.xl, fontFamily: FONTS.displayBold, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: colors.textSecondary, marginTop: SPACING.xs, marginBottom: SPACING.lg },
});
