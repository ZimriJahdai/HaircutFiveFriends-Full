import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Codifica un ArrayBuffer a base64 a mano (sin depender de btoa/Buffer, cuya
// disponibilidad varía entre motores/versiones de RN).
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = bytes[i + 1];
    const b3 = bytes[i + 2];
    result += BASE64_CHARS[b1 >> 2];
    result += BASE64_CHARS[((b1 & 0x03) << 4) | (b2 >> 4)];
    result += b2 !== undefined ? BASE64_CHARS[((b2 & 0x0f) << 2) | (b3 >> 6)] : '=';
    result += b3 !== undefined ? BASE64_CHARS[b3 & 0x3f] : '=';
  }
  return result;
}

// Escribe el PDF (ArrayBuffer) a un archivo temporal y abre el diálogo nativo
// de compartir/guardar. expo-file-system/expo-sharing no tienen implementación
// en web, así que ahí se dispara la descarga estándar del navegador (Blob + <a download>).
export async function saveAndSharePdf(arrayBuffer, filename) {
  if (Platform.OS === 'web') {
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  const base64 = arrayBufferToBase64(arrayBuffer);
  const fileUri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Compartir archivos no está disponible en este dispositivo');
  }
  await Sharing.shareAsync(fileUri, { mimeType: 'application/pdf', dialogTitle: 'Factura' });
}
