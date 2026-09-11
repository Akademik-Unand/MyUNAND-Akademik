import { can } from "../policies/defineAbility";
import {
  ADMIN_ROLE_NAMES,
  isUniversityAdminRole,
  PIMPINAN_ROLE_NAMES,
} from "../constants/roles";
import { isDosenAccount, isMahasiswaAccount } from "./accountUnit";

const STUDENT_NAV_PATHS = new Set([
  "/",
  "/krs/pengambilan",
  "/mahasiswa/katalog-lintas-prodi",
]);

// Menu yang tidak relevan untuk admin fakultas: kelola tingkat universitas,
// fasilitas sentral, semester master, pengambilan KRS (khusus mahasiswa),
// persetujuan (dosen/prodi), dan IAM sentral.
const ADMIN_FAKULTAS_HIDDEN_PATHS = new Set([
  "/master/fakultas",
  "/master/jenjang-akademik",
  "/master/gedung",
  "/master/ruang",
  "/master/semester/jenis",
  "/master/semester/setting",
  "/master/semester/periode",
  "/master/semester/prodi",
  "/krs/pengambilan",
  "/perkuliahan/persetujuan/lintas-prodi",
  "/perkuliahan/persetujuan/krs",
  "/pengaturan/pengguna",
  "/pengaturan/peran",
  "/pengaturan/aktivitas",
]);

export const isPrimaryMahasiswa = (user) => isMahasiswaAccount(user);

const roleNamesOf = (user) => {
  const set = new Set((user?.roles || []).map((role) => role.name || role));
  if (user?.role) set.add(user.role);
  return set;
};

export const isPrimaryAdminFakultas = (user) => {
  const roleNames = roleNamesOf(user);
  if ([...roleNames].some(isUniversityAdminRole)) return false;
  return roleNames.has("admin-fakultas");
};

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
// pembelajaran) dan membimbing (KRS, lintas prodi). Menu master/admin
// disembunyikan walau permission-nya diberikan (mis. `periode.read`).
const DOSEN_NAV_PATHS = new Set([
  "/",
  "/perkuliahan/upload-nilai",
  "/perkuliahan/rekap-cp",
  "/perkuliahan/laporan-cp",
  "/perkuliahan/persetujuan/lintas-prodi",
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
  if (isPrimaryAdminFakultas(user) && ADMIN_FAKULTAS_HIDDEN_PATHS.has(path))
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
