import { Platform } from 'react-native';

// Helper para multipart/form-data en React Native.
// En RN NO existe el objeto File del navegador: las imágenes de expo-image-picker
// se adjuntan como un objeto nativo { uri, name, type }.

export const guessImagePart = (uri) => {
  if (!uri) return null;
  const lower = String(uri).toLowerCase();
  let ext = 'jpg';
  let type = 'image/jpeg';
  if (lower.endsWith('.png')) {
    ext = 'png';
    type = 'image/png';
  } else if (lower.endsWith('.jpeg')) {
    ext = 'jpeg';
    type = 'image/jpeg';
  } else if (lower.endsWith('.webp')) {
    ext = 'webp';
    type = 'image/webp';
  }
  return { uri, name: `profile.${ext}`, type };
};

/**
 * Construye un FormData a partir de campos de texto y, opcionalmente, una imagen.
 * @param {Object} fields - pares clave/valor de texto (se omiten null/undefined/'').
 * @param {Object} [image] - { uri, field } donde field por defecto es 'profilePicture'.
 */
export const buildFormData = async (fields = {}, image = null) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });

  if (image?.uri) {
    if (Platform.OS === 'web') {
      try {
        const response = await fetch(image.uri);
        const blob = await response.blob();
        const ext = image.uri.split('.').pop() || 'jpg';
        const file = new File([blob], `profile.${ext}`, { type: blob.type });
        formData.append(image.field || 'profilePicture', file);
      } catch (err) {
        console.error('Error convirtiendo la URI de imagen a File en web:', err);
      }
    } else {
      const part = guessImagePart(image.uri);
      if (part) {
        formData.append(image.field || 'profilePicture', part);
      }
    }
  }

  return formData;
};
