import { describe, expect, it } from "vitest";
import {
  analisisRuang,
  deteksiBentrokKelasKrs,
  deteksiKonflikJadwal,
  jamOverlap,
  jadwalBertabrakan,
  jadwalLabel,
  kapasitasKurang,
  labelBentrokKrs,
  ringkasanJadwalKelas,
} from "./jadwal";

const buatKelas = (id, semesterProdiId, jadwal, dosenIds = []) => ({
  id,
  semester_prodi_id: semesterProdiId,
  dosenKelas: dosenIds.map((dosenId) => ({ dosen_id: dosenId })),
  jadwalKelas: jadwal,
});

const jadwal = (id, extra = {}) => ({
  id,
  hari: "Senin",
  jam_mulai: "08:00:00",
  jam_selesai: "09:40:00",
  ruang_id: null,
  ...extra,
});

describe("jamOverlap", () => {
  it("true saat jam saling tumpang tindih", () => {
    expect(
      jamOverlap(
        { jam_mulai: "08:00:00", jam_selesai: "09:40:00" },
        { jam_mulai: "09:00:00", jam_selesai: "10:00:00" },
      ),
    ).toBe(true);
  });

  it("false saat bersebelahan tanpa tumpang tindih", () => {
    expect(
      jamOverlap(
        { jam_mulai: "08:00:00", jam_selesai: "09:40:00" },
        { jam_mulai: "09:40:00", jam_selesai: "11:20:00" },
      ),
    ).toBe(false);
  });

  it("false saat jam belum lengkap", () => {
    expect(
      jamOverlap(
        { jam_mulai: null, jam_selesai: null },
        { jam_mulai: "09:00:00", jam_selesai: "10:00:00" },
      ),
    ).toBe(false);
  });
});

describe("jadwalLabel", () => {
  it("menggabungkan shift, jam, dan ruang", () => {
    expect(
      jadwalLabel({
        shift: { kode: "S1" },
        jam_mulai: "08:00:00",
        jam_selesai: "09:40:00",
        ruang: { kode: "R1" },
      }),
    ).toBe("S1 · 08:00–09:40 · R1");
  });
});

describe("jadwalBertabrakan", () => {
  it("true saat hari sama dan jam beririsan", () => {
    expect(
      jadwalBertabrakan(
        jadwal("a"),
        jadwal("b", { jam_mulai: "09:00:00", jam_selesai: "10:00:00" }),
      ),
    ).toBe(true);
  });

  it("false saat hari berbeda walau jamnya sama", () => {
    expect(
      jadwalBertabrakan(jadwal("a"), jadwal("b", { hari: "Selasa" })),
    ).toBe(false);
  });

  it("false saat bersebelahan tanpa tumpang tindih", () => {
    expect(
      jadwalBertabrakan(
        jadwal("a"),
        jadwal("b", { jam_mulai: "09:40:00", jam_selesai: "11:20:00" }),
      ),
    ).toBe(false);
  });
});

describe("deteksiBentrokKelasKrs", () => {
  const kelasKandidat = (id, jadwalKelas) => ({ id, nama: "A", jadwalKelas });
  const barisKrs = (id, kode, nama, jadwalKelas) => ({
    id,
    kode,
    nama,
    kelas: { id: `kelas-${id}`, jadwalKelas },
  });

  it("menandai kelas yang jadwalnya bentrok dengan MK di KRS, beserta namanya", () => {
    const peta = deteksiBentrokKelasKrs(
      [kelasKandidat("k1", [jadwal("j1")])],
      [
        barisKrs("kd1", "PTN1105", "Bahasa Indonesia", [
          jadwal("j2", { jam_mulai: "09:00:00", jam_selesai: "10:40:00" }),
        ]),
      ],
    );

    expect(peta.get("k1")).toEqual([
      expect.objectContaining({ kode: "PTN1105", nama: "Bahasa Indonesia" }),
    ]);
  });

  it("tidak menandai kelas yang jadwalnya tidak bertabrakan", () => {
    const peta = deteksiBentrokKelasKrs(
      [kelasKandidat("k1", [jadwal("j1")])],
      [
        barisKrs("kd1", "PTN1105", "Bahasa Indonesia", [
          jadwal("j2", { hari: "Rabu" }),
        ]),
      ],
    );

    expect(peta.size).toBe(0);
  });

  it("aman saat kelas belum punya jadwal atau KRS kosong", () => {
    expect(
      deteksiBentrokKelasKrs(
        [kelasKandidat("k1", [])],
        [barisKrs("kd1", "X", "Y", [jadwal("j2")])],
      ).size,
    ).toBe(0);
    expect(
      deteksiBentrokKelasKrs([kelasKandidat("k1", [jadwal("j1")])], []).size,
    ).toBe(0);
  });
});

describe("labelBentrokKrs", () => {
  it("menggabungkan kode, nama, hari, dan jam", () => {
    expect(
      labelBentrokKrs([
        { kode: "PTN1105", nama: "Bahasa Indonesia", jadwal: jadwal("j1") },
      ]),
    ).toBe("PTN1105 Bahasa Indonesia (Senin 08:00–09:40)");
  });

  it("menggabungkan beberapa bentrok dengan pemisah", () => {
    const label = labelBentrokKrs([
      { kode: "A1", nama: "Matkul A", jadwal: jadwal("j1") },
      {
        kode: "B1",
        nama: "Matkul B",
        jadwal: jadwal("j2", { hari: "Selasa" }),
      },
    ]);

    expect(label).toContain("A1 Matkul A (Senin 08:00–09:40)");
    expect(label).toContain("B1 Matkul B (Selasa 08:00–09:40)");
  });
});

describe("deteksiKonflikJadwal", () => {
  it("menandai konflik ruang dan kelas untuk semester prodi yang sama", () => {
    const konflik = deteksiKonflikJadwal([
      buatKelas("k1", "sp-1", [jadwal("j1", { ruang_id: "r1" })]),
      buatKelas("k2", "sp-1", [jadwal("j2", { ruang_id: "r1" })]),
    ]);

    expect([...konflik.get("j1")]).toEqual(
      expect.arrayContaining(["ruang", "kelas"]),
    );
    expect([...konflik.get("j2")]).toEqual(
      expect.arrayContaining(["ruang", "kelas"]),
    );
  });

  it("menandai konflik dosen meski beda program studi", () => {
    const konflik = deteksiKonflikJadwal([
      buatKelas("k1", "sp-1", [jadwal("j1")], ["d1"]),
      buatKelas("k2", "sp-2", [jadwal("j2")], ["d1"]),
    ]);

    expect([...konflik.get("j1")]).toContain("dosen");
    expect([...konflik.get("j1")]).not.toContain("kelas");
  });

  it("tidak menandai apa pun saat hari berbeda", () => {
    const konflik = deteksiKonflikJadwal([
      buatKelas("k1", "sp-1", [jadwal("j1", { ruang_id: "r1" })]),
      buatKelas("k2", "sp-1", [
        jadwal("j2", { hari: "Selasa", ruang_id: "r1" }),
      ]),
    ]);

    expect(konflik.size).toBe(0);
  });

  it("tidak menandai apa pun saat jam tidak tumpang tindih", () => {
    const konflik = deteksiKonflikJadwal([
      buatKelas("k1", "sp-1", [
        jadwal("j1", { jam_selesai: "09:40:00", ruang_id: "r1" }),
      ]),
      buatKelas("k2", "sp-1", [
        jadwal("j2", {
          jam_mulai: "10:00:00",
          jam_selesai: "11:40:00",
          ruang_id: "r1",
        }),
      ]),
    ]);

    expect(konflik.size).toBe(0);
  });

  it("menandai kapasitas ruang yang lebih kecil dari kebutuhan kelas", () => {
    const konflik = deteksiKonflikJadwal([
      {
        ...buatKelas("k1", "sp-1", [
          jadwal("j1", {
            ruang_id: "r1",
            ruang: { kode: "R1", kapasitas: 30 },
          }),
        ]),
        jumlah_peserta_max: 40,
      },
    ]);

    expect([...konflik.get("j1")]).toEqual(["kapasitas"]);
  });

  it("tidak menandai kapasitas saat ruang cukup atau belum diatur", () => {
    const konflik = deteksiKonflikJadwal([
      {
        ...buatKelas("k1", "sp-1", [
          jadwal("j1", { ruang: { kode: "R1", kapasitas: 50 } }),
        ]),
        jumlah_peserta_max: 40,
      },
      {
        ...buatKelas("k2", "sp-2", [
          jadwal("j2", { ruang: { kode: "R2", kapasitas: 0 } }),
        ]),
        jumlah_peserta_max: 40,
      },
    ]);

    expect(konflik.size).toBe(0);
  });
});

describe("kapasitasKurang", () => {
  it("true hanya saat kedua kapasitas terisi dan ruang lebih kecil", () => {
    expect(
      kapasitasKurang({ ruang: { kapasitas: 30 } }, { jumlah_peserta_max: 40 }),
    ).toBe(true);
    expect(
      kapasitasKurang({ ruang: { kapasitas: 40 } }, { jumlah_peserta_max: 40 }),
    ).toBe(false);
    expect(
      kapasitasKurang({ ruang: { kapasitas: 0 } }, { jumlah_peserta_max: 40 }),
    ).toBe(false);
    expect(
      kapasitasKurang({ ruang: { kapasitas: 30 } }, { jumlah_peserta_max: 0 }),
    ).toBe(false);
    expect(kapasitasKurang({}, {})).toBe(false);
  });
});

describe("ringkasanJadwalKelas", () => {
  it("merangkum sesi, shift, ruang, dan kekurangan kapasitas", () => {
    const ringkasan = ringkasanJadwalKelas({
      jumlah_peserta_max: 50,
      jadwalKelas: [
        jadwal("j1", {
          hari: "Senin",
          ruang_id: "r1",
          ruang: { kode: "R1", kapasitas: 30 },
          shift: { kode: "S1" },
        }),
        jadwal("j2", {
          hari: "Rabu",
          ruang_id: "r2",
          ruang: { kode: "R2", kapasitas: 60 },
          shift: { kode: "S1" },
        }),
      ],
    });

    expect(ringkasan).toMatchObject({
      sesi: 2,
      shift: ["S1"],
      ruang: ["R1", "R2"],
      kurangKapasitas: 1,
      kebutuhanKapasitas: 50,
    });
  });

  it("aman saat kelas belum punya jadwal", () => {
    expect(ringkasanJadwalKelas({})).toMatchObject({
      sesi: 0,
      shift: [],
      ruang: [],
      kurangKapasitas: 0,
    });
  });
});

describe("analisisRuang", () => {
  const ruang = (id, kapasitas) => ({ id, kode: id, kapasitas });
  const kelas = (id, jadwalList) => ({
    id,
    jadwalKelas: jadwalList.map((j, index) => ({
      id: `${id}-j${index}`,
      hari: "Senin",
      jam_mulai: "08:00:00",
      jam_selesai: "09:40:00",
      ...j,
    })),
  });

  it("menandai ruang yang belum dipakai sama sekali di semester ini", () => {
    const hasil = analisisRuang({
      ruangList: [ruang("r1", 60), ruang("r2", 60)],
      kelasSemester: [kelas("k1", [{ ruang_id: "r1" }])],
      kebutuhanKapasitas: 40,
      hari: "Selasa",
      jamMulai: "08:00:00",
      jamSelesai: "09:40:00",
    });

    expect(hasil.find((item) => item.ruang.id === "r1")).toMatchObject({
      jumlahPakai: 1,
      belumDipakai: false,
    });
    expect(hasil.find((item) => item.ruang.id === "r2")).toMatchObject({
      jumlahPakai: 0,
      belumDipakai: true,
      bentrokSlot: false,
      disarankan: true,
    });
  });

  it("menandai bentrok saat ruang sudah dipakai pada hari & jam yang sama", () => {
    const hasil = analisisRuang({
      ruangList: [ruang("r1", 60)],
      kelasSemester: [
        kelas("k1", [
          {
            ruang_id: "r1",
            hari: "Senin",
            jam_mulai: "08:00:00",
            jam_selesai: "09:40:00",
          },
        ]),
      ],
      kebutuhanKapasitas: 40,
      hari: "Senin",
      jamMulai: "09:00:00",
      jamSelesai: "10:00:00",
    });

    expect(hasil[0]).toMatchObject({ bentrokSlot: true, disarankan: false });
  });

  it("tidak menyarankan ruang yang kapasitasnya kurang", () => {
    const hasil = analisisRuang({
      ruangList: [ruang("r1", 30), ruang("r2", 0)],
      kelasSemester: [],
      kebutuhanKapasitas: 50,
    });

    expect(hasil.find((item) => item.ruang.id === "r1")).toMatchObject({
      cukupKapasitas: false,
      disarankan: false,
    });
    // Kapasitas 0 = belum diatur, jadi tidak dianggap kurang.
    expect(hasil.find((item) => item.ruang.id === "r2")).toMatchObject({
      cukupKapasitas: true,
      disarankan: true,
    });
  });

  it("mengabaikan jadwal yang sedang diubah", () => {
    const hasil = analisisRuang({
      ruangList: [ruang("r1", 60)],
      kelasSemester: [kelas("k1", [{ ruang_id: "r1" }])],
      kebutuhanKapasitas: 40,
      hari: "Senin",
      jamMulai: "08:00:00",
      jamSelesai: "09:40:00",
      excludeJadwalId: "k1-j0",
    });

    expect(hasil[0]).toMatchObject({
      jumlahPakai: 0,
      belumDipakai: true,
      bentrokSlot: false,
      disarankan: true,
    });
  });
});
