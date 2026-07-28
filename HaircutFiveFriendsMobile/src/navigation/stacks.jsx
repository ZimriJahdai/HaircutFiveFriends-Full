import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FONTS, FONT_SIZE } from '../shared/constants/theme';
import { useThemeStore } from '../shared/hooks/useThemeStore';
import { S } from './screens';

const getStackScreenOptions = (colors) => ({
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { fontFamily: FONTS.displayBold, fontWeight: '700', fontSize: FONT_SIZE.lg },
  headerShadowVisible: true,
  contentStyle: { backgroundColor: colors.background },
});

// --- Stack: Inicio ---
const HomeStackNav = createNativeStackNavigator();
export function HomeStack() {
  const { colors } = useThemeStore();
  return (
    <HomeStackNav.Navigator screenOptions={getStackScreenOptions(colors)}>
      <HomeStackNav.Screen name="Home" component={S.Home} options={{ title: 'Inicio' }} />
    </HomeStackNav.Navigator>
  );
}

// --- Stack: Barberos ---
const BarberosStackNav = createNativeStackNavigator();
export function BarberosStack() {
  const { colors } = useThemeStore();
  return (
    <BarberosStackNav.Navigator screenOptions={getStackScreenOptions(colors)}>
      <BarberosStackNav.Screen name="Barberos" component={S.Barberos} options={{ title: 'Barberos' }} />
    </BarberosStackNav.Navigator>
  );
}

// --- Stack: Catálogo (Servicios + Productos) ---
const CatalogStackNav = createNativeStackNavigator();
export function CatalogStack() {
  const { colors } = useThemeStore();
  return (
    <CatalogStackNav.Navigator screenOptions={getStackScreenOptions(colors)}>
      <CatalogStackNav.Screen name="Servicios" component={S.Servicios} options={{ title: 'Servicios' }} />
      <CatalogStackNav.Screen name="Productos" component={S.Productos} options={{ title: 'Productos' }} />
      <CatalogStackNav.Screen name="Carrito" component={S.Carrito} options={{ title: 'Carrito' }} />
    </CatalogStackNav.Navigator>
  );
}

// --- Stack: Citas (Reservar + Mis Citas) ---
const CitasStackNav = createNativeStackNavigator();
export function CitasStack() {
  const { colors } = useThemeStore();
  return (
    <CitasStackNav.Navigator screenOptions={getStackScreenOptions(colors)}>
      <CitasStackNav.Screen name="ReservarCita" component={S.ReservarCita} options={{ title: 'Reservar Cita' }} />
      <CitasStackNav.Screen name="MisCitas" component={S.MisCitas} options={{ title: 'Mis Citas' }} />
    </CitasStackNav.Navigator>
  );
}

// --- Stack: IA (Probar corte) ---
const IAStackNav = createNativeStackNavigator();
export function IAStack() {
  const { colors } = useThemeStore();
  return (
    <IAStackNav.Navigator screenOptions={getStackScreenOptions(colors)}>
      <IAStackNav.Screen name="ProbarCorte" component={S.ProbarCorte} options={{ title: 'Probar Corte' }} />
    </IAStackNav.Navigator>
  );
}

// --- Stack: Estilos ---
const GaleriaStackNav = createNativeStackNavigator();
export function GaleriaStack() {
  const { colors } = useThemeStore();
  return (
    <GaleriaStackNav.Navigator screenOptions={getStackScreenOptions(colors)}>
      <GaleriaStackNav.Screen name="Galeria" component={S.Galeria} options={{ title: 'Estilos' }} />
    </GaleriaStackNav.Navigator>
  );
}

// --- Stack: Perfil (+ Favoritos, Facturas, Reseñas) ---
const ProfileStackNav = createNativeStackNavigator();
export function ProfileStack() {
  const { colors } = useThemeStore();
  return (
    <ProfileStackNav.Navigator screenOptions={getStackScreenOptions(colors)}>
      <ProfileStackNav.Screen name="Perfil" component={S.Perfil} options={{ title: 'Mi Perfil' }} />
      <ProfileStackNav.Screen name="Favoritos" component={S.Favoritos} options={{ title: 'Favoritos' }} />
      <ProfileStackNav.Screen name="MisCompras" component={S.MisCompras} options={{ title: 'Mis compras' }} />
      <ProfileStackNav.Screen name="Facturas" component={S.Facturas} options={{ title: 'Facturas' }} />
      <ProfileStackNav.Screen name="Reportes" component={S.Reportes} options={{ title: 'Reportes' }} />
      <ProfileStackNav.Screen name="Reseñas" component={S.Reseñas} options={{ title: 'Reseñas' }} />
    </ProfileStackNav.Navigator>
  );
}
