import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

import { Button, Card, EmptyState, GradientCard } from '../../../shared/components';
import { FONTS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { useAuthStore } from '../../../shared/store/authStore';
import { useClientProfileStore } from '../../../shared/store/clientProfileStore';
import { AppointmentCard } from '../../appointments/components';
import { useMyAppointments } from '../../appointments/hooks/useMyAppointments';

export function HomeScreen({ navigation }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const user = useAuthStore((state) => state.user);
  const points = useClientProfileStore((state) => state.points);
  const refreshPoints = useClientProfileStore((state) => state.refreshPoints);
  const { upcoming, loading: loadingAppointments, refetch: refetchAppointments } = useMyAppointments();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshPoints(), refetchAppointments()]);
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.greeting}>Hola, {user?.name?.split(' ')[0] || 'cliente'} 👋</Text>
      <Text style={styles.subtitle}>Bienvenido de nuevo a Haircut Five Friends</Text>

      <GradientCard style={styles.pointsCard}>
        <View style={styles.pointsRow}>
          <MaterialIcons name="stars" size={28} color={colors.textOnPrimary} />
          <View>
            <Text style={styles.pointsLabel}>Tus puntos</Text>
            <Text style={styles.pointsValue}>{points}</Text>
          </View>
        </View>
      </GradientCard>

      <Card style={styles.ctaCard}>
        <Text style={styles.ctaTitle}>¿Listo para tu próximo corte?</Text>
        <Text style={styles.ctaSubtitle}>Reserva tu cita en segundos.</Text>
        <Button title="Reservar cita" gradient onPress={() => navigation.navigate('Citas', { screen: 'ReservarCita' })} />
      </Card>

      <View>
        <Text style={styles.sectionTitle}>Próxima cita</Text>
        {!loadingAppointments && upcoming.length === 0 ? (
          <EmptyState icon="event-available" title="Sin citas próximas" message="Reserva una cuando quieras." />
        ) : (
          upcoming.slice(0, 1).map((appointment) => <AppointmentCard key={appointment._id} appointment={appointment} />)
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: SPACING.lg, gap: SPACING.lg },
  greeting: { fontSize: FONT_SIZE.xxl, fontFamily: FONTS.displayBold, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: colors.textSecondary, marginTop: -SPACING.sm },
  pointsCard: { marginTop: SPACING.sm },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  pointsLabel: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: colors.textOnPrimary, opacity: 0.85 },
  pointsValue: { fontSize: FONT_SIZE.xxl, fontFamily: FONTS.displayBold, fontWeight: '800', color: colors.textOnPrimary },
  ctaCard: { gap: SPACING.sm },
  ctaTitle: { fontSize: FONT_SIZE.lg, fontFamily: FONTS.displayBold, fontWeight: '700', color: colors.text },
  ctaSubtitle: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: colors.textSecondary, marginBottom: SPACING.sm },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontFamily: FONTS.displayBold, fontWeight: '700', color: colors.text, marginBottom: SPACING.sm },
});
