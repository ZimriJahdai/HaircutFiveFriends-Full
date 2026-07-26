import { Controller } from 'react-hook-form';

import { Input } from '../../../shared/components';

// Conecta react-hook-form con el Input compartido. Cualquier prop extra
// (keyboardType, secureTextEntry, etc.) se reenvía al Input. `parse`, si se
// pasa, transforma el texto tecleado antes de guardarlo (ej. solo dígitos).
export function FormField({ control, name, rules, label, error, parse, ...inputProps }) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value } }) => (
        <Input
          label={label}
          value={value}
          onChangeText={(text) => onChange(parse ? parse(text) : text)}
          onBlur={onBlur}
          error={error}
          {...inputProps}
        />
      )}
    />
  );
}
