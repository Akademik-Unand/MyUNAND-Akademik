import { describe, expect, it } from 'vitest';
import {
  organizationContextLabel,
  organizationUserKey,
  reconcileOrganizationContext,
  updateOrganizationDraft,
} from './organizationContext';

const rows = {
  fakultas: [{ id: 'f1', nama_singkat: 'FTI' }],
  departemen: [{ id: 'd1', fakultas_id: 'f1', nama_singkat: 'Sistem Informasi' }],
  prodi: [{ id: 'p1', fakultas_id: 'f1', departemen_id: 'd1', nama_singkat: 'S1 SI' }],
};

describe('organization context helpers', () => {
  it('uses a stable user-specific persistence key', () => {
    expect(organizationUserKey({ id: 42 })).toBe('42');
    expect(organizationUserKey(null)).toBe('');
  });

  it('clears descendants when a parent draft changes', () => {
    expect(updateOrganizationDraft({ fakultasId: 'f1', departemenId: 'd1', prodiId: 'p1' }, 'fakultasId', 'f2'))
      .toEqual({ fakultasId: 'f2', departemenId: '', prodiId: '' });
  });

  it('reconciles invalid and mismatched persisted selections', () => {
    expect(reconcileOrganizationContext({ fakultasId: 'missing', departemenId: 'd1', prodiId: 'p1' }, rows))
      .toEqual({ fakultasId: '', departemenId: 'd1', prodiId: 'p1' });
    expect(reconcileOrganizationContext({ fakultasId: 'f1', departemenId: 'other', prodiId: 'p1' }, rows))
      .toEqual({ fakultasId: 'f1', departemenId: '', prodiId: 'p1' });
  });

  it('uses the most specific selected organization label', () => {
    expect(organizationContextLabel({ fakultasId: 'f1', departemenId: 'd1', prodiId: 'p1' }, rows)).toBe('S1 SI');
    expect(organizationContextLabel({}, rows)).toBe('Pilih unit');
  });
});
