import { useRef, useState } from 'react';

/**
 * Atomic Button. Saat isLoading atau onClick mengembalikan Promise,
 * tombol menampilkan spinner dan menolak klik berikutnya.
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  onClick,
  type = 'button',
  ...props
}) => {
  const [innerBusy, setInnerBusy] = useState(false);
  const lockRef = useRef(false);
  const busy = Boolean(disabled || isLoading || innerBusy);

  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    neutral: 'btn-neutral',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
    error: 'btn-error',
  }[variant] || 'btn-primary';

  const sizeClass = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  }[size] || 'btn-md';

  const handleClick = async (event) => {
    if (busy || lockRef.current) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    lockRef.current = true;
    try {
      const result = onClick?.(event);
      if (result && typeof result.then === 'function') {
        setInnerBusy(true);
        try {
          await result;
        } finally {
          setInnerBusy(false);
        }
      }
    } finally {
      queueMicrotask(() => {
        lockRef.current = false;
      });
    }
  };

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${busy ? 'pointer-events-none' : ''} ${className}`}
      {...props}
      disabled={busy}
      aria-busy={isLoading || innerBusy}
      onClick={handleClick}
    >
      {(isLoading || innerBusy) && <span className="loading loading-spinner loading-xs" />}
      {children}
    </button>
  );
};
