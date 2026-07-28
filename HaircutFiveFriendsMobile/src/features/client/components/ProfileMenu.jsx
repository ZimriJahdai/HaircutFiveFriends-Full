import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Card } from '../../../shared/components';
import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';

const MENU = [
  { icon: 'star', label: 'Favoritos', screen: 'Favoritos' },
  { icon: 'shopping-bag', label: 'Mis compras', screen: 'MisCompras' },
  { icon: 'receipt-long', label: 'Facturas', screen: 'Facturas' },
  { icon: 'bar-chart', label: 'Reportes', screen: 'Reportes' },
  { icon: 'rate-review', label: 'Reseñas', screen: 'Reseñas' },
];

// Accesos a las pantallas secundarias anidadas bajo el tab de Perfil.
export function ProfileMenu({ navigation }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);

  return (
    <Card style={styles.menuCard}>
      {MENU.map((item) => (
        <TouchableOpacity key={item.screen} style={styles.menuRow} onPress={() => navigation.navigate(item.screen)}>
          <View style={styles.menuIcon}>
            <MaterialIcons name={item.icon} size={20} color={colors.primary} />
          </View>
          <Text style={styles.menuLabel}>{item.label}</Text>
          <MaterialIcons name="chevron-right" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      ))}
    </Card>
  );
}

const createStyles = (colors) => StyleSheet.create({
  menuCard: { gap: SPACING.xs },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: FONT_SIZE.md, fontFamily: FONTS.semibold, fontWeight: '600', color: colors.text },
});
