import { Controller, useForm } from 'react-hook-form';

import { Button, Card, Input } from '../../../shared/components';

// Formulario de nombre/teléfono. El correo no es editable: es la identidad de login.
export function ProfileInfoForm({ defaultValues, onSubmit, saving }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <Card>
      <Controller
        control={control}
        name="name"
        rules={{ required: 'El nombre es requerido', minLength: { value: 2, message: 'Mínimo 2 caracteres' } }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Nombre" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
        )}
      />
      <Controller
        control={control}
        name="phone"
        rules={{ pattern: { value: /^\d{8}$/, message: 'Debe tener exactamente 8 dígitos' } }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Teléfono"
            value={value}
            onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 8))}
            onBlur={onBlur}
            keyboardType="number-pad"
            maxLength={8}
            error={errors.phone?.message}
          />
        )}
      />
      <Button title="Guardar cambios" gradient onPress={handleSubmit(onSubmit)} loading={saving} />
    </Card>
  );
}
