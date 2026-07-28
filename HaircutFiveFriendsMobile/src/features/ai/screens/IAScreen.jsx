import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Button, Card } from '../../../shared/components';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme';

export function IAScreen() {
  const navigation = useNavigation();
  const { colors } = useThemeStore();
  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Inteligencia Artificial</Text>
      <Text style={styles.subtitle}>
        Aquí verás las funcionalidades de IA cuando estén disponibles: chat, voz y visión.
      </Text>

      <View style={styles.grid}>
        <Card style={styles.card}>
          <MaterialIcons name="chat" size={36} color={colors.primary} />
          <Text style={styles.cardTitle}>Chat inteligente</Text>
          <Text style={styles.cardText}>
            Conversa con el asistente para sugerencias, soporte y ayuda rápida.
          </Text>
          <Button title="Próximamente" variant="secondary" disabled style={styles.cardButton} />
        </Card>

        <Card style={styles.card}>
          <MaterialIcons name="mic" size={36} color={colors.primary} />
          <Text style={styles.cardTitle}>Voz</Text>
          <Text style={styles.cardText}>
            Usa comandos de voz para interactuar con la app y generar ideas.
          </Text>
          <Button title="Próximamente" variant="secondary" disabled style={styles.cardButton} />
        </Card>

        <Card style={styles.card}>
          <MaterialIcons name="visibility" size={36} color={colors.primary} />
          <Text style={styles.cardTitle}>Visión</Text>
          <Text style={styles.cardText}>
            Analiza imágenes para recomendaciones y resultados visuales.
          </Text>
          <Button
            title="Probar corte"
            variant="primary"
            gradient
            onPress={() => navigation.navigate('ProbarCorte')}
            style={styles.cardButton}
          />
        </Card>
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>Vista preliminar</Text>
        <Text style={styles.noteText}>
          Esta pantalla es la vista de IA. Más adelante conectaremos el backend para que funcione con Gemini y tus datos.
        </Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: SPACING.lg },
    title: {
      fontSize: FONT_SIZE.xl,
      fontFamily: FONTS.displayBold,
      fontWeight: '700',
      color: colors.text,
      marginBottom: SPACING.sm,
    },
    subtitle: {
      fontSize: FONT_SIZE.sm,
      fontFamily: FONTS.body,
      color: colors.textSecondary,
      marginBottom: SPACING.lg,
      lineHeight: 22,
    },
    grid: { gap: SPACING.lg },
    card: {
      padding: SPACING.lg,
      borderRadius: RADIUS.xl,
      backgroundColor: colors.surface,
      gap: SPACING.sm,
    },
    cardTitle: {
      fontSize: FONT_SIZE.md,
      fontFamily: FONTS.semibold,
      color: colors.text,
      marginTop: SPACING.xs,
    },
    cardText: {
      fontSize: FONT_SIZE.sm,
      fontFamily: FONTS.body,
      color: colors.textSecondary,
      marginTop: SPACING.xs,
      lineHeight: 20,
    },
    cardButton: { marginTop: SPACING.sm },
    noteCard: {
      marginTop: SPACING.lg,
      padding: SPACING.lg,
      borderRadius: RADIUS.xl,
      backgroundColor: colors.primaryLight,
    },
    noteTitle: {
      fontSize: FONT_SIZE.md,
      fontFamily: FONTS.semibold,
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    noteText: {
      fontSize: FONT_SIZE.sm,
      fontFamily: FONTS.body,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });
