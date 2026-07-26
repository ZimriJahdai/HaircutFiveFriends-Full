import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { Button, EmptyState, LoadingSpinner, Selector } from '../../../shared/components';
import { SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { getId } from '../../../shared/api';
import { FAVORITE_TYPE_OPTIONS } from '../../../shared/constants';
import { confirmAction, notify } from '../../../shared/utils/confirm';
import { FavoriteCard } from '../components';
import { useFavorites } from '../hooks/useFavorites';

export function FavoritosScreen() {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const { favorites, loading, error, refetch, removeFavorite, clearAll } = useFavorites();
  const [type, setType] = useState(FAVORITE_TYPE_OPTIONS[0].value);
  const [removingId, setRemovingId] = useState(null);

  const list = favorites.filter((fav) => fav.typeFavorite === type);

  const onRemove = async (favorite) => {
    setRemovingId(getId(favorite));
    const result = await removeFavorite(getId(favorite));
    setRemovingId(null);
    if (!result.ok) notify('Error', result.error);
  };

  const onClearAll = () => {
    confirmAction({
      title: 'Vaciar favoritos',
      message: '¿Eliminar todos tus favoritos? Esta acción no se puede deshacer.',
      confirmText: 'Vaciar',
      destructive: true,
      onConfirm: clearAll,
    });
  };

  if (loading && favorites.length === 0) return <LoadingSpinner message="Cargando favoritos..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={list}
        keyExtractor={(item) => String(getId(item))}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Selector options={FAVORITE_TYPE_OPTIONS} value={type} onChange={setType} />
            {favorites.length > 0 ? <Button title="Vaciar todos" variant="ghost" onPress={onClearAll} /> : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="star-border" title="Sin favoritos" message={error || 'Marca elementos como favoritos para verlos aquí.'} />
        }
        renderItem={({ item }) => (
          <FavoriteCard favorite={item} onRemove={() => onRemove(item)} removing={removingId === getId(item)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
      />
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: SPACING.lg },
  header: { gap: SPACING.sm, marginBottom: SPACING.sm },
});
