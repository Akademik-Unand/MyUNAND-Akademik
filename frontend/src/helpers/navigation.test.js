import { describe, expect, it } from "vitest";
import { NAVIGATION_MENU } from "../constants/navigation";
import {
  filterNavigation,
  isPrimaryAdminDepartemen,
  isPrimaryAdminFakultas,
  isPrimaryAdminProdi,
  isPrimaryDosen,
} from "./navigation";

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
  role: "mahasiswa",
  roles: [{ name: "mahasiswa" }],
  permissions: [
    "krs.read",
    "krs.create",
    "krs.update",
    "penawaran-matakuliah.catalog",
    "cross-enrollment.read",
    "rekap-cp.read",
    "laporan-cp.read",
  ],
};

const universityAdmin = {
  role: "admin-universitas",
  roles: [{ name: "admin-universitas" }],
  permissions: [],
};

const adminFakultas = {
  role: "admin-fakultas",
  roles: [{ name: "admin-fakultas" }],
  permissions: [
    "departemen.read",
    "program-studi.read",
    "dosen.read",
    "matakuliah.read",
    "kurikulum.read",
    "cp.read",
    "cpmk.read",
    "matakuliah-kurikulum.read",
    "penawaran-matakuliah.read",
    "kelas.read",
    "shift.read",
    "nilai.read",
    "rekap-cp.read",
    "laporan-cp.read",
    "cross-enrollment.read",
  ],
};

const pimpinanFakultas = {
  role: "pimpinan-fakultas",
  roles: [{ name: "pimpinan-fakultas" }],
  permissions: [
    "matakuliah.read",
    "kurikulum.read",
    "cp.read",
    "cpmk.read",
    "matakuliah-kurikulum.read",
    "rekap-cp.read",
    "laporan-cp.read",
  ],
};

const dosen = {
  role: "dosen",
  roles: [{ name: "dosen" }],
  dosen_id: "dosen-1",
  permissions: [
    "periode.read",
    "semester.read",
    "krs.read",
    "krs.approve",
    "krs-detil.read",
    "nilai.read",
    "rekap-cp.read",
    "laporan-cp.read",
    "cross-enrollment.read",
    "bimbingan-akademik.read",
    "evaluasi-cpmk.read",
    "dokumen-evaluasi.read",
  ],
};

const adminProdi = {
  role: "admin-prodi",
  roles: [{ name: "admin-prodi" }],
  permissions: [
    "bimbingan-akademik.read",
    "bimbingan-akademik.create",
    "bimbingan-akademik.update",
    "bimbingan-akademik.delete",
  ],
};

/** Permission yang menggerbangi seluruh menu, meniru grant admin unit di DB. */
const SEMUA_MENU_PERMISSIONS = [
  "fakultas.read",
  "departemen.read",
  "program-studi.read",
  "dosen.read",
  "jenjang-akademik.read",
  "jenis-semester.read",
  "semester.read",
  "periode.read",
  "gedung.read",
  "ruang.read",
  "matakuliah.read",
  "kurikulum.read",
  "cp.read",
  "cpmk.read",
  "matakuliah-kurikulum.read",
  "penawaran-matakuliah.read",
  "kelas.read",
  "jadwal-kelas.read",
  "shift.read",
  "nilai.read",
  "rekap-cp.read",
  "laporan-cp.read",
  "krs.approve",
  "krs.create",
  "bimbingan-akademik.read",
  "bimbingan-akademik.create",
  "user.read",
  "role.read",
  "activity-log.read",
];

const adminUnit = (role) => ({
  role,
  roles: [{ name: role }],
  permissions: SEMUA_MENU_PERMISSIONS,
});

/** Sidebar yang diharapkan untuk admin departemen: unitnya sendiri, termasuk prodinya. */
const MENU_ADMIN_DEPARTEMEN = [
  "/",
  "/master/prodi",
  "/master/dosen",
  "/master/matakuliah",
  "/kurikulum/data",
  "/kurikulum/cp",
  "/kurikulum/cpmk",
  "/perkuliahan/mk-semester",
  "/perkuliahan/penawaran-mk",
  "/perkuliahan/kelas",
  "/perkuliahan/jadwal",
  "/perkuliahan/shift",
  "/perkuliahan/upload-nilai",
  "/perkuliahan/rekap-cp",
  "/perkuliahan/laporan-cp",
  "/kemahasiswaan/mahasiswa-bimbingan",
  "/kemahasiswaan/dosen-pa",
];

/** Admin prodi tidak mengelola master Program Studi (termasuk kuota SKS-nya). */
const MENU_ADMIN_PRODI = MENU_ADMIN_DEPARTEMEN.filter(
  (path) => path !== "/master/prodi",
);

describe("isPrimaryDosen", () => {
  it("true untuk dosen & dosen-pa", () => {
    expect(isPrimaryDosen(dosen)).toBe(true);
    expect(isPrimaryDosen({ roles: [{ name: "dosen-pa" }] })).toBe(true);
  });

  it("true lewat dosen_id walau role tidak memuat dosen", () => {
    expect(isPrimaryDosen({ roles: [], dosen_id: "abc" })).toBe(true);
  });

  it("false untuk mahasiswa, admin, pimpinan, dan tamu", () => {
    expect(isPrimaryDosen(mahasiswa)).toBe(false);
    expect(isPrimaryDosen(universityAdmin)).toBe(false);
    expect(isPrimaryDosen(pimpinanFakultas)).toBe(false);
    expect(
      isPrimaryDosen({ roles: [{ name: "dosen" }, { name: "admin-prodi" }] }),
    ).toBe(false);
    expect(isPrimaryDosen(undefined)).toBe(false);
  });
});

describe("isPrimaryAdmin unit", () => {
  it("mengenali role admin unit", () => {
    expect(isPrimaryAdminFakultas(adminUnit("admin-fakultas"))).toBe(true);
    expect(isPrimaryAdminDepartemen(adminUnit("admin-departemen"))).toBe(true);
    expect(isPrimaryAdminProdi(adminUnit("admin-prodi"))).toBe(true);
  });

  it("false bila akun juga memegang role admin universitas", () => {
    expect(
      isPrimaryAdminProdi({ roles: [{ name: "admin-prodi" }, { name: "admin-universitas" }] }),
    ).toBe(false);
  });
});

describe("filterNavigation", () => {
  it("menampilkan hanya menu relevan untuk dosen/pembimbing", () => {
    expect(pathsOf(filterNavigation(NAVIGATION_MENU, dosen))).toEqual([
      "/",
      "/perkuliahan/upload-nilai",
      "/perkuliahan/rekap-cp",
      "/perkuliahan/laporan-cp",
      "/perkuliahan/persetujuan/krs",
      "/kemahasiswaan/mahasiswa-bimbingan",
    ]);
  });

  it("menu master tetap tersembunyi walau dosen diberi permission tambahan", () => {
    const dosenDenganAksesLuas = {
      ...dosen,
      permissions: [
        ...dosen.permissions,
        "kelas.read",
        "matakuliah.read",
        "dosen.read",
      ],
    };
    expect(
      pathsOf(filterNavigation(NAVIGATION_MENU, dosenDenganAksesLuas)),
    ).toEqual(pathsOf(filterNavigation(NAVIGATION_MENU, dosen)));
  });

  it("dosen-pa mendapat sidebar yang sama dengan dosen", () => {
    const dosenPa = {
      ...dosen,
      role: "dosen-pa",
      roles: [{ name: "dosen-pa" }],
    };
    expect(pathsOf(filterNavigation(NAVIGATION_MENU, dosenPa))).toEqual(
      pathsOf(filterNavigation(NAVIGATION_MENU, dosen)),
    );
  });

  it("tetap menampilkan penetapan PA untuk admin unit yang punya hak tulis", () => {
    expect(pathsOf(filterNavigation(NAVIGATION_MENU, adminProdi))).toEqual([
      "/",
      "/kemahasiswaan/mahasiswa-bimbingan",
      "/kemahasiswaan/dosen-pa",
    ]);
  });

  it("keeps only student KRS pages for mahasiswa", () => {
    expect(pathsOf(filterNavigation(NAVIGATION_MENU, mahasiswa))).toEqual([
      "/",
      "/krs/pengambilan",
    ]);
  });

  it("keeps the full menu for admin-universitas", () => {
    expect(pathsOf(filterNavigation(NAVIGATION_MENU, universityAdmin))).toEqual(
      pathsOf(NAVIGATION_MENU),
    );
  });

  it("menyempitkan sidebar admin-prodi walau permission-nya seluas admin universitas", () => {
    expect(pathsOf(filterNavigation(NAVIGATION_MENU, adminUnit("admin-prodi")))).toEqual(
      MENU_ADMIN_PRODI,
    );
  });

  it("admin-prodi tidak melihat master Program Studi", () => {
    expect(
      pathsOf(filterNavigation(NAVIGATION_MENU, adminUnit("admin-prodi"))),
    ).not.toContain("/master/prodi");
  });

  it("admin-departemen tetap mengelola Program Studi di departemennya", () => {
    expect(
      pathsOf(filterNavigation(NAVIGATION_MENU, adminUnit("admin-departemen"))),
    ).toEqual(MENU_ADMIN_DEPARTEMEN);
  });

  it("sidebar admin-prodi berbeda dari admin universitas", () => {
    const prodiPaths = pathsOf(
      filterNavigation(NAVIGATION_MENU, adminUnit("admin-prodi")),
    );
    expect(prodiPaths).not.toEqual(pathsOf(NAVIGATION_MENU));
    for (const hidden of [
      "/master/fakultas",
      "/master/departemen",
      "/master/prodi",
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
    ]) {
      expect(prodiPaths).not.toContain(hidden);
    }
  });

  it("hides university-level & IAM menus for admin-fakultas", () => {
    expect(pathsOf(filterNavigation(NAVIGATION_MENU, adminFakultas))).toEqual([
      "/",
      "/master/departemen",
      "/master/prodi",
      "/master/dosen",
      "/master/matakuliah",
      "/kurikulum/data",
      "/kurikulum/cp",
      "/kurikulum/cpmk",
      "/perkuliahan/mk-semester",
      "/perkuliahan/penawaran-mk",
      "/perkuliahan/kelas",
      "/perkuliahan/shift",
      "/perkuliahan/upload-nilai",
      "/perkuliahan/rekap-cp",
      "/perkuliahan/laporan-cp",
    ]);
  });

  it("keeps the full menu when admin-fakultas also holds a university admin role", () => {
    const multiRole = {
      role: "admin-fakultas",
      roles: [{ name: "admin-fakultas" }, { name: "admin-universitas" }],
      permissions: [],
    };
    expect(pathsOf(filterNavigation(NAVIGATION_MENU, multiRole))).toEqual(
      pathsOf(NAVIGATION_MENU),
    );
  });

  it("keeps only monitoring menus for pimpinan", () => {
    expect(
      pathsOf(filterNavigation(NAVIGATION_MENU, pimpinanFakultas)),
    ).toEqual([
      "/",
      "/master/matakuliah",
      "/kurikulum/data",
      "/kurikulum/cp",
      "/kurikulum/cpmk",
      "/perkuliahan/mk-semester",
      "/perkuliahan/rekap-cp",
      "/perkuliahan/laporan-cp",
    ]);
  });

  it("keeps the admin-fakultas sidebar when user holds both admin-fakultas and pimpinan", () => {
    const both = {
      role: "pimpinan-fakultas",
      roles: [{ name: "pimpinan-fakultas" }, { name: "admin-fakultas" }],
      permissions: adminFakultas.permissions,
    };
    expect(pathsOf(filterNavigation(NAVIGATION_MENU, both))).toEqual(
      pathsOf(filterNavigation(NAVIGATION_MENU, adminFakultas)),
    );
  });

  it("hides permissioned items when the user has no grants", () => {
    expect(
      pathsOf(filterNavigation(NAVIGATION_MENU, { permissions: [] })),
    ).toEqual(["/"]);
  });
});
