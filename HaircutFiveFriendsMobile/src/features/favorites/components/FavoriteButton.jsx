import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useThemeStore } from '../../../shared/hooks/useThemeStore';

// Corazón reutilizable para tarjetas de Barbero/Servicio/Producto/Corte.
// Presentacional: recibe estado y callback, no conoce el tipo de entidad.
export function FavoriteButton({ active, onToggle, loading, size = 22 }) {
  const { colors } = useThemeStore();

  if (loading) {
    return <ActivityIndicator size="small" color={colors.primary} />;
  }

  return (
    <TouchableOpacity onPress={onToggle} hitSlop={8}>
      <MaterialIcons name={active ? 'favorite' : 'favorite-border'} size={size} color={active ? colors.danger : colors.textMuted} />
    </TouchableOpacity>
  );
}
