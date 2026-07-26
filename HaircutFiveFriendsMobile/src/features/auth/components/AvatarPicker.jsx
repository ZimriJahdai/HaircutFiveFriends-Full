import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { notify } from '../../../shared/utils/confirm';
import { pickProfileImage } from '../../../shared/utils/imagePicker';

// Selector de foto de perfil (galería): abre el picker y previsualiza.
export function AvatarPicker({ imageUri, onImagePicked }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);

  const handlePickImage = async () => {
    const result = await pickProfileImage();
    if (result.error) {
      notify('Permiso requerido', result.error);
      return;
    }
    if (!result.canceled) onImagePicked(result.uri);
  };

  return (
    <TouchableOpacity style={styles.avatarPicker} onPress={handlePickImage}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <MaterialIcons name="add-a-photo" size={28} color={colors.primary} />
        </View>
      )}
      <Text style={styles.link}>Foto de perfil (opcional)</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors) => StyleSheet.create({
  avatarPicker: { alignItems: 'center', marginBottom: SPACING.xl, gap: SPACING.sm },
  avatar: { width: 88, height: 88, borderRadius: RADIUS.pill },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: { color: colors.primary, fontFamily: FONTS.bold, fontWeight: '700', fontSize: FONT_SIZE.sm },
});
