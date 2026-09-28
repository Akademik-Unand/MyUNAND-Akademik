'use strict';

const isPendingKrsDetail = (detail = {}) => {
  if (detail.is_cross_enrollment) {
    return !['approved', 'rejected'].includes(detail.cross_enrollment_status);
  }
  return !['1', '2'].includes(String(detail.approved ?? '0'));
};

const krsApprovalStatus = (krs = {}) => {
  if (Number(krs.approval_ke) > 0) return 'approved';
  const details = krs.krsDetil || [];
  if (details.some(isPendingKrsDetail)) return 'pending_pa';
  if (
    details.some(
      (row) =>
        row.cross_enrollment_status === 'rejected' ||
        String(row.approved) === '2'
    )
  ) {
    return 'rejected';
  }
  return 'pending_pa';
};

module.exports = { isPendingKrsDetail, krsApprovalStatus };
