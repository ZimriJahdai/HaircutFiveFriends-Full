import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { GRADIENTS, RADIUS, SHADOWS, SPACING } from '../constants/theme';

// Tarjeta con degradado de acento y sombra coloreada.
export function GradientCard({
  children,
  colors = GRADIENTS.accent,
  start = GRADIENTS.start,
  end = GRADIENTS.endDiagonal,
  style,
  contentStyle,
}) {
  return (
    <View style={[styles.shadow, style]}>
      <LinearGradient colors={colors} start={start} end={end} style={[styles.card, contentStyle]}>
        {children}
      </LinearGradient>
    </View>
  );
}

// Banda/fondo con el degradado oscuro de marca (headers, hero). Hijos por encima.
export function BrandGradient({ children, style, start = GRADIENTS.start, end = GRADIENTS.endDiagonal }) {
  return (
    <LinearGradient
      colors={GRADIENTS.hero}
      locations={GRADIENTS.brandLocations}
      start={start}
      end={end}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  shadow: { borderRadius: RADIUS.lg, ...SHADOWS.brand },
  card: { borderRadius: RADIUS.lg, padding: SPACING.lg, overflow: 'hidden' },
});
