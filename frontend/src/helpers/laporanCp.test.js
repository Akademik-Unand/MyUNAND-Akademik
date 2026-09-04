import { describe, expect, it } from 'vitest';
import {
  activeCheckActionKey,
  applyMatchingInGroup,
  buildCheckActions,
  formatCapaian,
  itemsFromSelected,
  mkSemesterLabel,
  selectedFromItems,
  toggleMatching,
  withGroupedCapaian,
} from './laporanCp';

const rows = [
  {
    id: 'c1:m1:s1',
    cpmk_id: 'c1',
    matakuliah_id: 'm1',
    semester_id: 's1',
    semester_label: 'Genap 2025',
    matakuliah_nama: 'Kalkulus 2',
    is_transkrip: true,
  },
  {
    id: 'c2:m2:s2',
    cpmk_id: 'c2',
    matakuliah_id: 'm2',
    semester_id: 's2',
    semester_label: 'Ganjil 2026',
    matakuliah_nama: 'Kalkulus I',
    is_transkrip: false,
  },
];

describe('laporanCp helpers', () => {
  it('formats empty capaian like the old portal', () => {
    expect(formatCapaian(null)).toBe('%');
    expect(formatCapaian(90.09)).toBe('90.09%');
  });

  it('joins MK with semester', () => {
    expect(mkSemesterLabel(rows[0])).toBe('Kalkulus 2 — Genap 2025');
  });

  it('builds check-all actions per semester and transkrip', () => {
    const labels = buildCheckActions(rows).map((item) => item.label);
    expect(labels).toEqual([
      'Check All',
      'Check All Semester Genap 2025',
      'Check All Semester Ganjil 2026',
      'Check All MK Transkrip',
      'Check All MK Transkrip Semester Genap 2025',
    ]);
  });

  it('applies a radio choice only within the SCP group', () => {
    const next = applyMatchingInGroup(new Set(['c2:m2:s2']), rows, (row) => row.is_transkrip);
    expect([...next].sort()).toEqual(['c1:m1:s1']);
  });

  it('detects the active radio from selected rows', () => {
    const actions = buildCheckActions(rows);
    expect(activeCheckActionKey(new Set(['c1:m1:s1']), rows, actions)).toBe('transkrip:s1');
    expect(activeCheckActionKey(new Set(['c1:m1:s1', 'c2:m2:s2']), rows, actions)).toBe('all');
  });

  it('toggles matching rows', () => {
    const next = toggleMatching(new Set(), rows, (row) => row.is_transkrip);
    expect([...next]).toEqual(['c1:m1:s1']);
    const off = toggleMatching(next, rows, (row) => row.is_transkrip);
    expect(off.size).toBe(0);
  });

  it('round-trips selected items', () => {
    const selected = new Set(['c1:m1:s1']);
    const items = itemsFromSelected(rows, selected);
    expect(selectedFromItems(items).has('c1:m1:s1')).toBe(true);
  });

  it('averages capaian per SCP and CP from selected rows', () => {
    const grouped = withGroupedCapaian([
      { id: 'a', cp_id: 'cp1', scp_id: 's1', capaian: 46.46 },
      { id: 'b', cp_id: 'cp1', scp_id: 's2', capaian: 56.69 },
      { id: 'c', cp_id: 'cp1', scp_id: 's2', capaian: 91.27 },
    ]);
    expect(grouped[0].capaian_scp).toBe(46.46);
    expect(grouped[1].capaian_scp).toBe(73.98);
    expect(grouped[0].capaian_cp).toBe(64.81);
  });
});
