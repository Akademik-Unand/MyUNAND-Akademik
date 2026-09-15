'use strict';

const { assertKelasKrsReady } = require('../../../src/helpers/kelasKrsEligibility');

const readyClass = {
  jadwalKelas: [{ hari: 'Senin', jam_mulai: '08:00:00', jam_selesai: '09:40:00' }],
  dosenKelas: [{ id: 'dk-1' }],
};

describe('assertKelasKrsReady', () => {
  it('mengizinkan kelas dengan minimal satu jadwal lengkap dan satu dosen', () => {
    expect(() => assertKelasKrsReady({
      jadwalKelas: [{ hari: null, jam_mulai: null, jam_selesai: null }, ...readyClass.jadwalKelas],
      dosenKelas: readyClass.dosenKelas,
    })).not.toThrow();
  });

  it('menolak khusus jadwal saat tidak ada jadwal lengkap', () => {
    expect(() => assertKelasKrsReady({
      jadwalKelas: [{ hari: 'Senin', jam_mulai: '08:00:00', jam_selesai: null }],
      dosenKelas: readyClass.dosenKelas,
    })).toThrow(expect.objectContaining({ code: 409, message: 'Kelas belum memiliki jadwal lengkap' }));
  });

  it('menolak khusus dosen saat dosen belum ditetapkan', () => {
    expect(() => assertKelasKrsReady({ ...readyClass, dosenKelas: [] }))
      .toThrow(expect.objectContaining({ code: 409, message: 'Kelas belum memiliki dosen pengampu' }));
  });

  it('menolak dengan alasan gabungan saat jadwal dan dosen belum siap', () => {
    expect(() => assertKelasKrsReady({ jadwalKelas: [], dosenKelas: [] }))
      .toThrow(expect.objectContaining({
        code: 409,
        message: 'Kelas belum memiliki jadwal lengkap dan dosen pengampu',
      }));
  });
});
