import { Alert, Platform } from 'react-native';

// Confirmación cross-platform (ej. cancelar cita, logout). En web Alert.alert
// con botones es no-op, así que usamos window.confirm (síncrono y bloqueante).
export function confirmAction({
  title,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  destructive = false,
  onConfirm,
}) {
  if (Platform.OS === 'web') {
    if (window.confirm(message ? `${title}\n\n${message}` : title)) onConfirm?.();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel' },
    { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}

// Aviso simple cross-platform con callback opcional.
export function notify(title, message, onConfirm) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    onConfirm?.();
    return;
  }
  Alert.alert(title, message, [{ text: 'Aceptar', onPress: onConfirm }]);
}
