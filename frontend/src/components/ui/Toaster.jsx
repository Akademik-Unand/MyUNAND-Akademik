import { Toaster as SonnerToaster } from 'sonner';
import { useUIStore } from '../../store/ui.store';
import { AVAILABLE_THEMES } from '../../constants/theme';

const isDarkTheme = (id) => {
  const found = AVAILABLE_THEMES.find((t) => t.id === id);
  return found?.type === 'dark';
};

export const Toaster = () => {
  const { theme } = useUIStore();
  const isDark = isDarkTheme(theme);

  return (
    <SonnerToaster
      position="top-right"
      theme={isDark ? 'dark' : 'light'}
      richColors
      closeButton
      offset="16px"
      gap={10}
      toastOptions={{
        style: {
          fontFamily: 'inherit',
          borderRadius: '0.375rem',
        },
        classNames: {
          toast: 'myunand-toast',
          title: 'myunand-toast-title',
          description: 'myunand-toast-desc',
        },
      }}
    />
  );
};
