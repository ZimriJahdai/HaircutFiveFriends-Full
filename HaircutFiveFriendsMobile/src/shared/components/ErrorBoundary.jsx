import { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../constants/theme';
import { useThemeStore } from '../hooks/useThemeStore';

// Captura errores de render de la pantalla hija para que NUNCA quede una página
// en blanco: muestra un fallback con el mensaje del error y un botón de reintento.
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { colors } = this.props;
    const styles = createStyles(colors);

    if (this.state.error) {
      return (
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="error-outline" size={36} color={colors.danger} />
          </View>
          <Text style={styles.title}>Algo salió mal</Text>
          <Text style={styles.message}>No se pudo mostrar esta pantalla.</Text>
          {this.state.error?.message ? (
            <Text style={styles.detail} numberOfLines={4}>
              {String(this.state.error.message)}
            </Text>
          ) : null}
          <TouchableOpacity style={styles.btn} onPress={this.reset} activeOpacity={0.85}>
            <Text style={styles.btnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

// HOC para envolver un componente de pantalla con el ErrorBoundary.
export function withErrorBoundary(ScreenComponent) {
  function Wrapped(props) {
    const { colors } = useThemeStore();
    return (
      <ErrorBoundary colors={colors}>
        <ScreenComponent {...props} />
      </ErrorBoundary>
    );
  }
  Wrapped.displayName = `withErrorBoundary(${ScreenComponent.displayName || ScreenComponent.name || 'Screen'})`;
  return Wrapped;
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
    backgroundColor: colors.background,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.pill,
    backgroundColor: colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  title: { fontSize: FONT_SIZE.lg, fontFamily: FONTS.displayBold, fontWeight: '700', color: colors.text },
  message: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: colors.textSecondary, textAlign: 'center' },
  detail: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  btn: {
    marginTop: SPACING.md,
    backgroundColor: colors.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  btnText: { color: colors.textOnPrimary, fontFamily: FONTS.bold, fontWeight: '700', fontSize: FONT_SIZE.sm },
});
