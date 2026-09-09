'use strict';

const validation = require('../../../src/validations/perkuliahan/penawaran-matakuliah.validation');

const id = '123e4567-e89b-12d3-a456-426614174000';

describe('offering validation', () => {
  test('accepts one period with multiple courses', () => {
    const result = validation.create.validate({
      semester_prodi_id: id,
      kuota_lintas_prodi_default: 10,
      akses: 'terpilih',
      prodi_tujuan: [{ program_studi_id: id, kuota: 5 }],
      matakuliah: [
        { matakuliah_id: id },
        { matakuliah_id: '223e4567-e89b-12d3-a456-426614174000' },
      ],
    });
    expect(result.error).toBeFalsy();
  });

  test('rejects invalid schedule time', () => {
    const result = validation.schedule.validate({
      ruang_id: id,
      hari: 'Holiday',
      jam_mulai: '25:00',
      jam_selesai: '26:00',
    });
    expect(result.error).toBeTruthy();
  });
});
