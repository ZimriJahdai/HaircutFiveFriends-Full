import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';

// Avatar + nombre/correo del cliente. Si `editable`, tocar el avatar dispara
// `onPress` (abre el selector de galería desde el screen).
export function ProfileAvatar({ avatar, name, email, onPress, editable = false }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const Wrapper = editable ? TouchableOpacity : View;

  return (
    <View style={styles.container}>
      <Wrapper style={styles.avatarWrapper} onPress={editable ? onPress : undefined} activeOpacity={0.8}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholder}>
            <MaterialIcons name="person" size={36} color={colors.primary} />
          </View>
        )}
        {editable ? (
          <View style={styles.editBadge}>
            <MaterialIcons name="edit" size={14} color={colors.textOnPrimary} />
          </View>
        ) : null}
      </Wrapper>
      <Text style={styles.name}>{name || 'Cliente'}</Text>
      {email ? <Text style={styles.email}>{email}</Text> : null}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 88, height: 88, borderRadius: RADIUS.pill },
  placeholder: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: RADIUS.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  name: { fontSize: FONT_SIZE.lg, fontFamily: FONTS.displayBold, fontWeight: '700', color: colors.text, marginTop: SPACING.xs },
  email: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: colors.textSecondary },
});
