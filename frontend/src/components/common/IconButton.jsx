import { Link } from 'react-router-dom';

const SIZE_CLASS = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: 'btn-md',
};

const ICON_SIZE = {
  xs: 14,
  sm: 16,
  md: 18,
};

/**
 * Tombol ikon dengan tooltip DaisyUI, supaya maksud tombol terbaca saat hover.
 */
export const IconButton = ({
  label,
  icon: Icon,
  onClick,
  tone = '',
  size = 'xs',
  tooltipPosition = 'tooltip-top',
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`tooltip ${tooltipPosition}`} data-tip={label}>
      <button
        type="button"
        className={`btn btn-ghost btn-square ${SIZE_CLASS[size] || SIZE_CLASS.xs} ${tone} ${className}`}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
      >
        <Icon size={ICON_SIZE[size] || ICON_SIZE.xs} />
      </button>
    </div>
  );
};

/** Versi tautan dari IconButton, untuk aksi yang berpindah halaman. */
export const IconLink = ({
  label,
  icon: Icon,
  to,
  tone = '',
  size = 'xs',
  tooltipPosition = 'tooltip-top',
  className = '',
}) => {
  return (
    <div className={`tooltip ${tooltipPosition}`} data-tip={label}>
      <Link
        to={to}
        className={`btn btn-ghost btn-square ${SIZE_CLASS[size] || SIZE_CLASS.xs} ${tone} ${className}`}
        aria-label={label}
      >
        <Icon size={ICON_SIZE[size] || ICON_SIZE.xs} />
      </Link>
    </div>
  );
};
