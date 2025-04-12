import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { themeAtom, Theme } from '../state';

const useThemeManager = () => {
  const [theme] = useAtom(themeAtom);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    // Optional: Store the effective theme (light/dark) if needed elsewhere,
    // maybe in another atom or directly on the root element as a data attribute.
    // root.dataset.effectiveTheme = isDark ? 'dark' : 'light';

  }, [theme]); // Re-run effect when theme atom changes

  // Also listen for system theme changes if theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const root = window.document.documentElement;
      const isDark = mediaQuery.matches;
      root.classList.remove(isDark ? 'light' : 'dark');
      root.classList.add(isDark ? 'dark' : 'light');
      // root.dataset.effectiveTheme = isDark ? 'dark' : 'light';
    };

    // Initial check
    handleChange();

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup listener
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]); // Re-run effect if theme changes to/from 'system'
};

export default useThemeManager;
