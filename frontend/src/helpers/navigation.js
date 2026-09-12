import { can } from "../policies/defineAbility";
import {
  ADMIN_ROLE_NAMES,
  isUniversityAdminRole,
  PIMPINAN_ROLE_NAMES,
  ROLE_NAMES,
} from "../constants/roles";
import { isDosenAccount, isMahasiswaAccount } from "./accountUnit";

const STUDENT_NAV_PATHS = new Set([
  "/",
  "/krs/pengambilan",
  "/mahasiswa/katalog-lintas-prodi",
]);

// Menu yang tidak relevan untuk admin unit (fakultas/departemen/prodi): kelola
// tingkat universitas, fasilitas sentral, semester master (global universitas),
// pengambilan KRS (khusus mahasiswa), persetujuan KRS (dosen PA), dan IAM
// sentral. Permission-nya memang dimiliki role ini (lihat docs/permissions.md),
// jadi sidebar-lah yang memisahkan admin unit dari admin universitas.
const ADMIN_UNIT_HIDDEN_PATHS = new Set([
  "/master/fakultas",
  "/master/jenjang-akademik",
  "/master/gedung",
  "/master/ruang",
  "/master/semester/jenis",
  "/master/semester/setting",
  "/master/semester/periode",
  "/krs/pengambilan",
  "/perkuliahan/persetujuan/krs",
  "/pengaturan/pengguna",
  "/pengaturan/peran",
  "/pengaturan/aktivitas",
]);

// Admin departemen & prodi tidak mengelola master departemen: bagi prodi itu
// unit di atasnya, bagi departemen itu unitnya sendiri (read-only).
const ADMIN_UNIT_LEVEL_HIDDEN_PATHS = new Set(["/master/departemen"]);

// Admin prodi tidak mengelola master Program Studi (termasuk kuota SKS-nya yang
// merupakan kebijakan universitas). Data prodinya tetap terbaca lewat scope
// organisasi, tapi tidak bisa diubah atau ditambah dari sidebar ini.
const ADMIN_PRODI_HIDDEN_PATHS = new Set(["/master/prodi"]);

export const isPrimaryMahasiswa = (user) => isMahasiswaAccount(user);

const roleNamesOf = (user) => {
  const set = new Set((user?.roles || []).map((role) => role.name || role));
  if (user?.role) set.add(user.role);
  return set;
};

/**
 * Role admin unit murni: dipakai untuk mempersempit sidebar per level
 * (fakultas → departemen → prodi). Tidak berlaku bila akun juga memegang role
 * admin yang lebih luas (`admin-universitas`/`superadmin`), karena role
 * itu memang membuka semua menu — sama seperti aturan pada pimpinan di bawah.
 */
const isPrimaryAdminRole = (user, roleName) => {
  const roleNames = roleNamesOf(user);
  const broad = [...roleNames].some((name) => isUniversityAdminRole(name));
  if (broad) return false;
  return roleNames.has(roleName);
};

export const isPrimaryAdminFakultas = (user) =>
  isPrimaryAdminRole(user, ROLE_NAMES.ADMIN_FAKULTAS);

export const isPrimaryAdminDepartemen = (user) =>
  isPrimaryAdminRole(user, ROLE_NAMES.ADMIN_DEPARTEMEN);

export const isPrimaryAdminProdi = (user) =>
  isPrimaryAdminRole(user, ROLE_NAMES.ADMIN_PRODI);

// Pimpinan (fakultas/departemen/prodi) bersifat read-only; sidebar dipersempit
// ke menu monitoring akademik saja.
const PIMPINAN_NAV_PATHS = new Set([
  "/",
  "/master/matakuliah",
  "/kurikulum/data",
  "/kurikulum/cp",
  "/kurikulum/cpmk",
  "/perkuliahan/mk-semester",
  "/perkuliahan/rekap-cp",
  "/perkuliahan/laporan-cp",
]);

export const isPrimaryPimpinan = (user) => {
  const roleNames = roleNamesOf(user);
  if ([...roleNames].some((name) => ADMIN_ROLE_NAMES.has(name))) return false;
  return [...roleNames].some((name) => PIMPINAN_ROLE_NAMES.has(name));
};

/**
 * Dosen pengampu & dosen PA berbagi satu area kerja (menu mengikuti permission),
 * jadi keduanya memakai dashboard yang sama. Admin/pimpinan/mahasiswa dikecualikan
 * supaya yang punya peran campuran tetap mendapat tampilan sesuai peran utamanya.
 */
export const isPrimaryDosen = (user) => isDosenAccount(user);

// Dosen & dosen PA hanya melihat pekerjaannya sendiri: mengajar (nilai, capaian
// pembelajaran) dan membimbing (persetujuan KRS, termasuk pengajuan lintas
// prodi di dalamnya). Menu master/admin disembunyikan walau permission-nya
// diberikan (mis. `periode.read`).
const DOSEN_NAV_PATHS = new Set([
  "/",
  "/perkuliahan/upload-nilai",
  "/perkuliahan/rekap-cp",
  "/perkuliahan/laporan-cp",
  "/perkuliahan/persetujuan/krs",
  "/kemahasiswaan/mahasiswa-bimbingan",
]);

const isAllowed = (user, item) => {
  if (!item?.permission) return true;
  return can(user, item.permission.action, item.permission.subject);
};

const isNavHiddenForRole = (user, path) => {
  if (isPrimaryMahasiswa(user) && !STUDENT_NAV_PATHS.has(path)) return true;
  if (isPrimaryDosen(user) && !DOSEN_NAV_PATHS.has(path)) return true;
  const adminUnitHidden =
    ADMIN_UNIT_HIDDEN_PATHS.has(path) ||
    ADMIN_UNIT_LEVEL_HIDDEN_PATHS.has(path);
  if (isPrimaryAdminFakultas(user) && ADMIN_UNIT_HIDDEN_PATHS.has(path))
    return true;
  if (isPrimaryAdminDepartemen(user) && adminUnitHidden) return true;
  if (
    isPrimaryAdminProdi(user) &&
    (adminUnitHidden || ADMIN_PRODI_HIDDEN_PATHS.has(path))
  )
    return true;
  if (isPrimaryPimpinan(user) && !PIMPINAN_NAV_PATHS.has(path)) return true;
  return false;
};

export const filterNavigation = (menu, user) =>
  (menu || [])
    .map((item) => {
      if (item.type === "link") {
        if (isNavHiddenForRole(user, item.path)) return null;
        return isAllowed(user, item) ? item : null;
      }

      if (item.type === "group") {
        const items = (item.items || [])
          .map((sub) => {
            if (sub.children) {
              const children = sub.children.filter((child) => {
                if (isNavHiddenForRole(user, child.path)) return false;
                return isAllowed(user, child);
              });
              if (!children.length) return null;
              return { ...sub, children };
            }
            if (isNavHiddenForRole(user, sub.path)) return null;
            return isAllowed(user, sub) ? sub : null;
          })
          .filter(Boolean);

        if (!items.length) return null;
        return { ...item, items };
      }

      return item;
    })
    .filter(Boolean);
