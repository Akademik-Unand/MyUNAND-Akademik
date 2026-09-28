import { describe, expect, it } from "vitest";
import { registeredKrsRows } from "../utils/crossEnrollment";
import {
  buildKrsCalendar, calendarBounds, calendarTime,
  isCompleteKrsSchedule, layoutCalendarDay,
} from "./krsCalendar";

const session = (id, hari = "Senin", start = "08:00:00", end = "09:40:00") =>
  ({ id, hari, jam_mulai: start, jam_selesai: end });
const kelas = (id, sessions = [session(id)]) => ({
  id, nama: "A", jadwalKelas: sessions,
  matakuliah: { kode_matakuliah: id, nama_resmi: "Mata kuliah " + id },
});
const row = (item, extra = {}) => ({
  id: "krs-" + item?.id, kelas_id: item?.id, kelas: item, approved: "0", ...extra,
});
const calendar = (rows, preview) => buildKrsCalendar(registeredKrsRows(rows), preview);

describe("buildKrsCalendar", () => {
  it("menampilkan seluruh sesi, termasuk Minggu dan pengajuan lintas yang menunggu PA", () => {
    const result = calendar([
      row(kelas("reguler", [session("a"), session("b", "Minggu")])),
      row(kelas("lintas", [session("c", "Selasa")]), {
        is_cross_enrollment: true, cross_enrollment_status: "pending_pa",
      }),
      row(kelas("ditolak"), { is_cross_enrollment: true, cross_enrollment_status: "rejected" }),
    ]);
    expect(result.events).toHaveLength(3);
    expect(result.events.some((event) => event.hari === "Minggu")).toBe(true);
    expect(result.events.find((event) => event.kelasId === "lintas").status).toBe("pending_pa");
    expect(result.conflicts).toEqual([]);
  });

  it("menandai kedua sesi bentrok dan menghitung rentang irisannya dengan ID UUID", () => {
    const result = calendar(
      [row(kelas("uuid-existing"))],
      kelas("uuid-preview", [session("p", "Senin", "09:00:00", "10:00:00")]),
    );
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflictingIds.size).toBe(2);
    expect(result.conflicts[0]).toMatchObject({ start: 540, end: 580 });
    expect(result.events[1].preview).toBe(true);
  });

  it("tidak menganggap jam bersambung atau hari berbeda sebagai bentrok", () => {
    const result = calendar([row(kelas("a"))], kelas("b", [
      session("b1", "Senin", "09:40:00", "11:00:00"),
      session("b2", "Selasa", "08:00:00", "09:40:00"),
    ]));
    expect(result.conflicts).toEqual([]);
  });

  it("mendeteksi jadwal yang saling mencakup dan bentrok antar KRS yang sudah tersimpan", () => {
    const result = calendar([
      row(kelas("a", [session("a", "Senin", "07:00", "12:00")])),
      row(kelas("b")),
      row(kelas("c", [session("c", "Senin", "08:30", "09:00")])),
    ]);
    expect(result.conflicts).toHaveLength(3);
    expect(result.conflictingIds.size).toBe(3);
  });

  it("tidak menggandakan pratinjau kelas yang baru berhasil masuk KRS", () => {
    const item = kelas("a");
    const result = calendar([row(item)], item);
    expect(result.events).toHaveLength(1);
    expect(result.events[0].preview).toBe(false);
    expect(result.conflicts).toEqual([]);
  });

  it("tidak mengubah data sumber dan menandai jadwal parsial sebagai belum lengkap", () => {
    const item = kelas("a", [session("valid"), session("invalid", "Senin", null)]);
    const rows = [row(item), row(kelas("kosong", [])), row(null, { kelas_id: "hilang" })];
    const original = structuredClone(rows);
    const result = calendar(rows);
    expect(result.events).toHaveLength(1);
    expect(result.unscheduled).toHaveLength(3);
    expect(rows).toEqual(original);
  });

  it("tidak menghapus kelas lama ketika mempratinjau kelas lain pada MK yang sama", () => {
    const first = kelas("a");
    const candidate = { ...kelas("b"), matakuliah: first.matakuliah };
    expect(calendar([row(first)], candidate).conflicts).toHaveLength(1);
  });

  it("menghapus penanda bentrok setelah KRS dihapus atau pratinjau dibatalkan", () => {
    const rows = [row(kelas("a"))];
    expect(calendar(rows, kelas("b")).conflicts).toHaveLength(1);
    expect(calendar(rows, null).conflicts).toEqual([]);
    expect(calendar([], kelas("b")).conflicts).toEqual([]);
  });
});

describe("validasi dan tata letak kalender", () => {
  it.each([
    session("a", "Senin", "25:00", "26:00"),
    session("a", "Senin", "08:90", "10:00"),
    session("a", "Senin", "09:00", "08:00"),
    session("a", "Senin", "08:00", "08:00"),
    session("a", "Tidak diketahui"),
    session("a", "Senin", "", "09:00"),
  ])("tidak memplot sesi tidak valid: %j", (invalid) => {
    expect(isCompleteKrsSchedule(kelas("a", [invalid]))).toBe(false);
    expect(calendar([row(kelas("a", [invalid]))]).events).toEqual([]);
  });

  it("membagi kolom kelompok bentrok berantai dan mengembalikan lebar setelahnya", () => {
    const events = [
      { id: "a", start: 480, end: 600 },
      { id: "b", start: 540, end: 660 },
      { id: "c", start: 600, end: 720 },
      { id: "d", start: 720, end: 780 },
    ];
    const result = layoutCalendarDay(events);
    expect(result.map(({ column, columns }) => [column, columns])).toEqual([
      [0, 2], [1, 2], [0, 2], [0, 1],
    ]);
    expect(events[0]).not.toHaveProperty("column");
  });

  it("menyediakan tiga kolom ketika tiga sesi beririsan sekaligus", () => {
    expect(layoutCalendarDay([
      { start: 480, end: 700 }, { start: 490, end: 600 }, { start: 500, end: 560 },
    ]).map((event) => event.columns)).toEqual([3, 3, 3]);
  });

  it("memperluas rentang waktu untuk kelas pagi/malam tanpa memotongnya", () => {
    expect(calendarBounds([{ start: 390, end: 1330 }])).toEqual({ start: 360, end: 1380 });
    expect(calendarBounds([])).toEqual({ start: 420, end: 1080 });
    expect(calendarTime(580)).toBe("09:40");
  });
});