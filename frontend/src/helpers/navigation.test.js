import { describe, expect, it } from 'vitest';
import { NAVIGATION_MENU } from '../constants/navigation';
import { filterNavigation } from './navigation';

const pathsOf = (menu) => {
  const paths = [];
  for (const item of menu) {
    if (item.path) paths.push(item.path);
    for (const sub of item.items || []) {
      if (sub.path) paths.push(sub.path);
      for (const child of sub.children || []) {
        if (child.path) paths.push(child.path);
      }
    }
  }
  return paths;
};

const mahasiswa = {
  role: 'mahasiswa',
  roles: [{ name: 'mahasiswa' }],
  permissions: ['krs.read', 'krs.create', 'krs.update', 'rekap-cp.read', 'laporan-cp.read'],
};

const superadmin = {
  role: 'superadmin',
  roles: [{ name: 'superadmin' }],
  permissions: [],
};

describe('filterNavigation', () => {
  it('keeps dashboard and laporan for mahasiswa', () => {
    expect(pathsOf(filterNavigation(NAVIGATION_MENU, mahasiswa))).toEqual([
      '/',
      '/perkuliahan/rekap-cp',
      '/perkuliahan/laporan-cp',
    ]);
  });

  it('keeps the full menu for superadmin', () => {
    expect(pathsOf(filterNavigation(NAVIGATION_MENU, superadmin))).toEqual(
      pathsOf(NAVIGATION_MENU),
    );
  });

  it('hides permissioned items when the user has no grants', () => {
    expect(pathsOf(filterNavigation(NAVIGATION_MENU, { permissions: [] }))).toEqual(['/']);
  });
});
