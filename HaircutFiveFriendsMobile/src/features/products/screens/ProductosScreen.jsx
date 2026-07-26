import { useLayoutEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState, LoadingSpinner, Selector } from '../../../shared/components';
import { SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { getId } from '../../../shared/api';
import { notify } from '../../../shared/utils/confirm';
import { FAVORITE_TYPES } from '../../../shared/constants';
import { useFavorites } from '../../favorites/hooks/useFavorites';
import { ProductCard, ProductDetailModal } from '../components';
import { useProducts } from '../hooks/useProducts';
import { useCartStore } from '../../../shared/store/cartStore';
import { CartButton } from '../../cart/components/CartButton';

const TABS = [
  { value: 'catalog', label: 'Catálogo' },
  { value: 'redeemable', label: 'Canjeables' },
];

const CATALOG_NAV_TABS = [
  { value: 'Servicios', label: 'Servicios' },
  { value: 'Productos', label: 'Productos' },
];

export function ProductosScreen({ navigation }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const { products, redeemable, loading, error, refetch } = useProducts();
  const { isFavorite, toggleFavorite } = useFavorites();
  const addItem = useCartStore((state) => state.addItem);
  const [tab, setTab] = useState('catalog');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const list = tab === 'catalog' ? products : redeemable;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <CartButton />,
    });
  }, [navigation]);

  const onToggleFavorite = async (productId) => {
    const result = await toggleFavorite(FAVORITE_TYPES.PRODUCT, productId);
    if (!result.ok) notify('Error', result.error);
  };

  const handleAddToCart = (product) => {
    addItem({
      id: getId(product),
      type: 'PRODUCT',
      name: product.name,
      price: Number(product.price) || 0,
      image: product.image || null,
      quantity: 1,
    });
    setSelectedProduct(null);
    notify('Agregado al carrito', `${product.name} se agregó correctamente.`);
  };

  if (loading && list.length === 0) return <LoadingSpinner message="Cargando productos..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={list}
        keyExtractor={(item) => String(getId(item))}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Selector
              options={CATALOG_NAV_TABS}
              value="Productos"
              onChange={(routeName) => navigation.navigate(routeName)}
            />
            <Selector options={TABS} value={tab} onChange={setTab} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="shopping-bag"
            title="Sin productos"
            message={error || (tab === 'redeemable' ? 'No hay productos canjeables por ahora.' : 'No hay productos disponibles.')}
          />
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => setSelectedProduct(item)}
            isFavorite={isFavorite(FAVORITE_TYPES.PRODUCT, getId(item))}
            onToggleFavorite={() => onToggleFavorite(getId(item))}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={selectedProduct ? () => handleAddToCart(selectedProduct) : undefined}
      />
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: SPACING.lg },
  header: { marginBottom: SPACING.sm },
});
