import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { EmptyState, LoadingSpinner, Selector } from '../../../shared/components';
import { RADIUS, SHADOWS, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { getId } from '../../../shared/api';
import { confirmAction, notify } from '../../../shared/utils/confirm';
import { EditReviewModal, ReviewCard, ReviewForm } from '../components';
import { useReviews } from '../hooks/useReviews';

const TABS = [
  { value: 'all', label: 'Todas' },
  { value: 'mine', label: 'Mías' },
];

export function ReseñasScreen() {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const { reviews, myReviews, loading, error, submitting, refetch, createReview, updateReview, deleteReview } = useReviews();
  const [tab, setTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const list = tab === 'all' ? reviews : myReviews;
  const myReviewIds = new Set(myReviews.map((review) => String(getId(review))));

  const onCreate = async (payload) => {
    const result = await createReview(payload);
    if (!result.ok) {
      notify('Error', result.error);
      return;
    }
    setShowForm(false);
    notify('¡Gracias por tu reseña!', 'Tu opinión ya está publicada.');
  };

  const onSaveEdit = async (patch) => {
    const result = await updateReview(getId(editingReview), patch);
    setEditingReview(null);
    if (!result.ok) notify('Error', result.error);
  };

  const onDelete = (review) => {
    confirmAction({
      title: 'Eliminar reseña',
      message: '¿Seguro que deseas eliminar esta reseña?',
      confirmText: 'Eliminar',
      destructive: true,
      onConfirm: async () => {
        const result = await deleteReview(getId(review));
        if (!result.ok) notify('Error', result.error);
      },
    });
  };

  if (loading && list.length === 0) return <LoadingSpinner message="Cargando reseñas..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={list}
        keyExtractor={(item) => String(getId(item))}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Selector options={TABS} value={tab} onChange={setTab} />
            {showForm ? (
              <ReviewForm onSubmit={onCreate} submitting={submitting} onCancel={() => setShowForm(false)} />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="rate-review" title="Sin reseñas" message={error || 'Sé el primero en dejar una reseña.'} />
        }
        renderItem={({ item }) => (
          <ReviewCard
            review={item}
            isMine={myReviewIds.has(String(getId(item)))}
            onEdit={() => setEditingReview(item)}
            onDelete={() => onDelete(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
      />

      {!showForm ? (
        <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)} activeOpacity={0.85}>
          <MaterialIcons name="add" size={26} color={colors.textOnPrimary} />
        </TouchableOpacity>
      ) : null}

      <EditReviewModal review={editingReview} onSave={onSaveEdit} onClose={() => setEditingReview(null)} saving={submitting} />
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  header: { gap: SPACING.md, marginBottom: SPACING.sm },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: RADIUS.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.floating,
  },
});
