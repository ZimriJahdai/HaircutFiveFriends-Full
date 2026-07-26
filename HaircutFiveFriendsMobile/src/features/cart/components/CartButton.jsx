import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../../../shared/store/cartStore';
import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';

export function CartButton() {
  const navigation = useNavigation();
  const itemsCount = useCartStore((state) => state.getCount());
  const { colors } = useThemeStore();
  const styles = createStyles(colors);

  return (
    <Pressable style={styles.button} onPress={() => navigation.navigate('Carrito')}>
      <MaterialIcons name="shopping-cart" size={24} color={colors.onPrimary} />
      {itemsCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemsCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const createStyles = (colors) => StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.textOnPrimary,
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
});
