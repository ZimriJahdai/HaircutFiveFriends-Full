import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONTS, FONT_SIZE } from '../shared/constants/theme';
import { useThemeStore } from '../shared/hooks/useThemeStore';
import { BarberosStack, CatalogStack, CitasStack, GaleriaStack, HomeStack, ProfileStack, IAStack } from './stacks';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Inicio: 'home',
  Barberos: 'content-cut',
  Catálogo: 'storefront',
  IA: 'smartphone',
  Estilos: 'photo-library',
  Citas: 'event',
  Perfil: 'person',
};

// Pantalla raíz de cada tab. Al tocar el tab volvemos aquí (evita que un
// deep-link a una pantalla anidada quede "pegado" como landing del tab).
const TAB_ROOT = {
  Inicio: 'Home',
  Barberos: 'Barberos',
  Catálogo: 'Servicios',
  IA: 'ProbarCorte',
  Estilos: 'Galeria',
  Citas: 'ReservarCita',
  Perfil: 'Perfil',
};

const resetTabOnPress = ({ navigation, route }) => ({
  tabPress: (e) => {
    e.preventDefault();
    navigation.navigate(route.name, { screen: TAB_ROOT[route.name] });
  },
});

export function MainTabs() {
  const { colors } = useThemeStore();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 66 + insets.bottom,
          paddingTop: 6,
          paddingBottom: 10 + insets.bottom,
        },
        tabBarLabelStyle: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.semibold, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => (
          <MaterialIcons name={TAB_ICONS[route.name] || 'circle'} size={focused ? size + 1 : size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Inicio" component={HomeStack} listeners={resetTabOnPress} />
      <Tab.Screen name="Barberos" component={BarberosStack} listeners={resetTabOnPress} />
      <Tab.Screen name="Catálogo" component={CatalogStack} listeners={resetTabOnPress} />
      <Tab.Screen name="IA" component={IAStack} listeners={resetTabOnPress} />
      <Tab.Screen name="Estilos" component={GaleriaStack} listeners={resetTabOnPress} />
      <Tab.Screen name="Citas" component={CitasStack} listeners={resetTabOnPress} />
      <Tab.Screen name="Perfil" component={ProfileStack} listeners={resetTabOnPress} />
    </Tab.Navigator>
  );
}
