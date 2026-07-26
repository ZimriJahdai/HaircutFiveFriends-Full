import { Input } from '../../../shared/components';

export function ServiceSearch({ value, onChangeText }) {
  return (
    <Input
      placeholder="Buscar servicio..."
      value={value}
      onChangeText={onChangeText}
      leftIcon="search"
      autoCapitalize="none"
    />
  );
}
