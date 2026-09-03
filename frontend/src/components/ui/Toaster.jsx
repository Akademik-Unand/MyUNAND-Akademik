import { Toaster as SonnerToaster } from 'sonner';
import { useUIStore } from '../../store/ui.store';
import { isDarkTheme } from '../../constants/theme';

export const Toaster = () => {
  const { theme } = useUIStore();

  return (
    <SonnerToaster
      position="top-right"
      theme={isDarkTheme(theme) ? 'dark' : 'light'}
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
