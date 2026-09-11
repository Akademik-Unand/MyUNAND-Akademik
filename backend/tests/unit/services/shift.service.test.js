'use strict';

jest.mock('../../../src/models', () => ({
  Shift: { create: jest.fn(), findByPk: jest.fn() },
  Fakultas: {},
}));

const { Shift } = require('../../../src/models');
const { assertShiftValid } = require('../../../src/services/perkuliahan/shift.service');

describe('assertShiftValid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mengizinkan jam selesai setelah jam mulai', () => {
    expect(() =>
      assertShiftValid({ jam_mulai: '08:00:00', jam_selesai: '09:40:00' })
    ).not.toThrow();
  });

  it('menolak saat jam selesai tidak setelah jam mulai', () => {
    expect(() =>
      assertShiftValid({ jam_mulai: '10:00:00', jam_selesai: '08:00:00' })
    ).toThrow('Jam selesai harus setelah jam mulai');
  });

  it('tidak mengecek saat jam belum diisi', () => {
    expect(() => assertShiftValid({ kode: 'Shift 1' })).not.toThrow();
  });
});