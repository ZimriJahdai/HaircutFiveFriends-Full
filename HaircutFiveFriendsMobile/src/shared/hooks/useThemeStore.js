import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/theme';

const STORAGE_KEY = 'haircut-theme-storage';

const readPersistedTheme = async () => {
  try {
    const rawValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (!rawValue) return null;
    const parsed = JSON.parse(rawValue);
    return typeof parsed?.state?.isDark === 'boolean' ? parsed.state.isDark : null;
  } catch {
    return null;
  }
};

const writePersistedTheme = async (isDark) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { isDark }, version: 0 }));
  } catch {
    // noop
  }
};

// La web de referencia es 100% oscura; el móvil por defecto también arranca
// en oscuro pero permite alternar (a diferencia de la web).
export const useThemeStore = create((set, get) => ({
  isDark: true,
  colors: DARK_COLORS,
  toggleTheme: async () => {
    const nextIsDark = !get().isDark;
    await writePersistedTheme(nextIsDark);
    set({ isDark: nextIsDark, colors: nextIsDark ? DARK_COLORS : LIGHT_COLORS });
  },
  setTheme: async (isDark) => {
    await writePersistedTheme(isDark);
    set({ isDark, colors: isDark ? DARK_COLORS : LIGHT_COLORS });
  },
}));

void (async () => {
  const isDark = await readPersistedTheme();
  if (typeof isDark === 'boolean') {
    useThemeStore.setState({ isDark, colors: isDark ? DARK_COLORS : LIGHT_COLORS });
  }
})();
