'use strict';

const {
  jamBertabrakan,
  cariBentrokJadwalKrs,
  pesanBentrokJadwal,
  assertJadwalKrsTidakBentrok,
} = require('../../../src/helpers/jadwalBentrok');

const kelas = (id, kode, nama, jadwalKelas, kelasNama = 'A') => ({
  id,
  nama: kelasNama,
  matakuliah: { kode_matakuliah: kode, nama_resmi: nama },
  jadwalKelas,
});

const jadwal = (hari, mulai, selesai) => ({ hari, jam_mulai: mulai, jam_selesai: selesai });

describe('jamBertabrakan', () => {
  it('true saat hari sama dan jam beririsan', () => {
    expect(jamBertabrakan(jadwal('Senin', '08:00:00', '09:40:00'), jadwal('Senin', '09:00:00', '10:00:00'))).toBe(true);
  });

  it('false saat berbeda hari', () => {
    expect(jamBertabrakan(jadwal('Senin', '08:00:00', '09:40:00'), jadwal('Selasa', '08:00:00', '09:40:00'))).toBe(false);
  });

  it('false saat bersebelahan tanpa tumpang tindih', () => {
    expect(jamBertabrakan(jadwal('Senin', '08:00:00', '09:40:00'), jadwal('Senin', '09:40:00', '11:20:00'))).toBe(false);
  });

  it('false saat jam tidak lengkap', () => {
    expect(jamBertabrakan({ hari: 'Senin' }, jadwal('Senin', '08:00:00', '09:40:00'))).toBe(false);
  });
});

describe('cariBentrokJadwalKrs', () => {
  const mkBaru = kelas('k-baru', 'PTN1105', 'Bahasa Indonesia', [jadwal('Senin', '08:00:00', '09:40:00')]);

  it('menemukan mata kuliah yang jadwalnya bertabrakan', () => {
    const hasil = cariBentrokJadwalKrs(mkBaru, [
      { kelas: kelas('k-1', 'PTN1205', 'Sosiologi Pedesaan', [jadwal('Senin', '09:00:00', '10:40:00')]) },
    ]);

    expect(hasil).toHaveLength(1);
    expect(hasil[0].kelas.matakuliah.kode_matakuliah).toBe('PTN1205');
  });

  it('tidak menganggap bentrok saat hari/jam berbeda', () => {
    expect(cariBentrokJadwalKrs(mkBaru, [
      { kelas: kelas('k-1', 'PTN1205', 'Sosiologi', [jadwal('Selasa', '08:00:00', '09:40:00')]) },
      { kelas: kelas('k-2', 'PTN1305', 'Ekonomi', [jadwal('Senin', '10:00:00', '11:40:00')]) },
    ])).toEqual([]);
  });

  it('hanya sekali melaporkan MK yang sama walau dua sesinya bentrok', () => {
    const hasil = cariBentrokJadwalKrs(mkBaru, [
      {
        kelas: kelas('k-1', 'PTN1205', 'Sosiologi', [
          jadwal('Senin', '09:00:00', '10:40:00'),
          jadwal('Senin', '08:30:00', '10:00:00'),
        ]),
      },
    ]);

    expect(hasil).toHaveLength(1);
  });

  it('aman saat kelas baru belum punya jadwal', () => {
    expect(cariBentrokJadwalKrs({ id: 'x', jadwalKelas: [] }, [
      { kelas: kelas('k-1', 'PTN1205', 'Sosiologi', [jadwal('Senin', '08:00:00', '09:40:00')]) },
    ])).toEqual([]);
  });
});

describe('pesanBentrokJadwal', () => {
  it('menyebut MK, kelas, hari, dan jam', () => {
    const bentrok = cariBentrokJadwalKrs(
      kelas('k-baru', 'PTN1105', 'Bahasa Indonesia', [jadwal('Senin', '08:00:00', '09:40:00')]),
      [{ kelas: kelas('k-1', 'PTN1205', 'Sosiologi Pedesaan', [jadwal('Senin', '09:00:00', '10:40:00')]) }]
    );

    expect(pesanBentrokJadwal(bentrok)).toBe(
      'Jadwal bentrok dengan PTN1205 Sosiologi Pedesaan (kelas A) pada Senin jam 09:00–10:40'
    );
  });

  it('menyebut beberapa mata kuliah sekaligus', () => {
    const bentrok = cariBentrokJadwalKrs(
      kelas('k-baru', 'PTN1105', 'Bahasa Indonesia', [jadwal('Senin', '08:00:00', '09:40:00')]),
      [
        { kelas: kelas('k-1', 'PTN1205', 'Sosiologi', [jadwal('Senin', '09:00:00', '10:40:00')]) },
        { kelas: kelas('k-2', 'PTN1305', 'Ekonomi', [jadwal('Senin', '08:30:00', '10:10:00')]) },
      ]
    );

    const pesan = pesanBentrokJadwal(bentrok);
    expect(pesan).toContain('PTN1205 Sosiologi');
    expect(pesan).toContain('PTN1305 Ekonomi');
  });
});

describe('assertJadwalKrsTidakBentrok', () => {
  it('melempar error 409 dengan nama mata kuliah yang bentrok', () => {
    expect(() =>
      assertJadwalKrsTidakBentrok(
        kelas('k-baru', 'PTN1105', 'Bahasa Indonesia', [jadwal('Senin', '08:00:00', '09:40:00')]),
        [{ kelas: kelas('k-1', 'PTN1205', 'Sosiologi Pedesaan', [jadwal('Senin', '09:00:00', '10:40:00')]) }]
      )
    ).toThrow(
      expect.objectContaining({
        code: 409,
        message: expect.stringContaining('PTN1205 Sosiologi Pedesaan'),
      })
    );
  });

  it('tidak melempar saat jadwal aman', () => {
    expect(() =>
      assertJadwalKrsTidakBentrok(
        kelas('k-baru', 'PTN1105', 'Bahasa Indonesia', [jadwal('Senin', '08:00:00', '09:40:00')]),
        [{ kelas: kelas('k-1', 'PTN1205', 'Sosiologi', [jadwal('Rabu', '08:00:00', '09:40:00')]) }]
      )
    ).not.toThrow();
  });
});
