'use strict';

const validation = require('../../../src/validations/perkuliahan/penawaran-matakuliah.validation');

const id = '123e4567-e89b-12d3-a456-426614174000';

describe('offering validation', () => {
  test('defaults an omitted cross-enrollment option to internal-only', () => {
    const result = validation.create.validate({
      semester_id: id,
      program_studi_id: id,
      matakuliah: [{ matakuliah_id: id }],
    });
    expect(result.error).toBeFalsy();
    expect(result.value.akses).toBe('internal');
  });
  test('accepts one period with multiple courses', () => {
    const result = validation.create.validate({
      semester_id: id,
      program_studi_id: id,
      akses: 'terpilih',
      prodi_tujuan: [{ program_studi_id: '223e4567-e89b-12d3-a456-426614174000' }],
      matakuliah: [
        { matakuliah_id: id },
        { matakuliah_id: '223e4567-e89b-12d3-a456-426614174000' },
      ],
    });
    expect(result.error).toBeFalsy();
  });

  test('requires one target program when access is limited', () => {
    const result = validation.create.validate({
      semester_id: id,
      program_studi_id: id,
      akses: 'terpilih',
      prodi_tujuan: [],
      matakuliah: [{ matakuliah_id: id }],
    });
    expect(result.error).toBeTruthy();
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
