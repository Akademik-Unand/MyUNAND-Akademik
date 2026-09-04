const APPROVED_LABEL = {
  0: 'Menunggu',
  1: 'Disetujui',
  2: 'Ditolak',
};

const APPROVED_VARIANT = {
  0: 'warning',
  1: 'success',
  2: 'error',
};

export const krsApprovedLabel = (value) => APPROVED_LABEL[String(value)] || '—';

export const krsApprovedVariant = (value) => APPROVED_VARIANT[String(value)] || 'ghost';
