import { Input } from '../../../shared/components';

export function BarberSearch({ value, onChangeText }) {
  return (
    <Input
      placeholder="Buscar barbero..."
      value={value}
      onChangeText={onChangeText}
      leftIcon="search"
      autoCapitalize="none"
    />
  );
}
