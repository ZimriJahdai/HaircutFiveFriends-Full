import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

// Abre la galería y devuelve la URI de la imagen elegida (objeto nativo para
// FormData). Solo galería: no se pidió soporte de cámara en esta app.
export async function pickProfileImage() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { canceled: true, error: 'Necesitamos permiso para acceder a tus fotos.' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled) {
    return { canceled: true };
  }

  return { canceled: false, uri: result.assets[0].uri };
}

const EXT_TO_MIME = { png: 'image/png', webp: 'image/webp', jpeg: 'image/jpeg', jpg: 'image/jpeg' };

// AuthService's PUT /users/profile expects `profilePicture` as a JSON string
// (an existing URL, or a `data:image/...;base64,...` URI it uploads to
// Cloudinary itself) — unlike HaircutFiveFriends' multer/multipart endpoints.
// expo-file-system's readAsStringAsync has no web implementation, así que en
// web usamos fetch+FileReader (que ya produce directamente un data: URI).
export async function imageUriToDataUri(uri) {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  const ext = (uri.split('.').pop() || 'jpg').toLowerCase();
  const mime = EXT_TO_MIME[ext] || 'image/jpeg';
  return `data:${mime};base64,${base64}`;
}
