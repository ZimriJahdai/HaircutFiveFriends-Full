import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';

import { useThemeStore } from '../shared/hooks/useThemeStore';
import { useAuthStore } from '../shared/store/authStore';
import { notify } from '../shared/utils/confirm';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { linking } from './linking';

// Decide Auth vs MainTabs según authStore, con guarda anti-parpadeo de hidratación.
export function AppNavigator() {
  const { colors, isDark } = useThemeStore();
  const styles = createStyles(colors);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const lastLogoutReason = useAuthStore((state) => state.lastLogoutReason);
  const clearLogoutReason = useAuthStore((state) => state.clearLogoutReason);

  // No hay refresh-token (~30min de vida del JWT): un 401 fuerza logout y
  // avisamos una sola vez por qué la sesión terminó.
  useEffect(() => {
    if (lastLogoutReason === 'session-expired') {
      notify('Sesión expirada', 'Tu sesión terminó, inicia sesión de nuevo.');
      clearLogoutReason();
    }
  }, [lastLogoutReason, clearLogoutReason]);

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  // Mientras Zustand no rehidrata desde AsyncStorage, mostramos solo un
  // spinner (sin NavigationContainer) para evitar el parpadeo del Login.
  if (!hasHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={navTheme}
      linking={linking}
      fallback={
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      }
    >
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const createStyles = (colors) => StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
