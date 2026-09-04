'use strict';

jest.mock('../../../src/helpers/academicPeriod', () => ({
  assertCpmkPeriod: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../src/models', () => ({
  sequelize: {
    transaction: jest.fn((fn) => fn({})),
  },
  Cpmk: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  CpmkScp: {
    destroy: jest.fn(),
    bulkCreate: jest.fn(),
  },
  Matakuliah: {},
  SumberPenilaian: {},
  Scp: {},
  Cp: {},
}));

const { Cpmk, CpmkScp } = require('../../../src/models');
const cpmkService = require('../../../src/services/obe/cpmk.service');

const mkId = '11111111-1111-1111-1111-111111111111';
const otherMk = '22222222-2222-2222-2222-222222222222';
const scpId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const rootA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const rootB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const item = (nama_cpmk, extra = {}) => ({
  matakuliah_id: mkId,
  nama_cpmk,
  deskripsi: `Deskripsi ${nama_cpmk}`,
  scp_ids: [scpId],
  ...extra,
});

describe('cpmk createBulk', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Cpmk.findByPk.mockImplementation((id) =>
      Promise.resolve({ id, matakuliah_id: mkId, parent_cpmk_id: null, scp: [] })
    );
    Cpmk.create.mockImplementation((attrs) => Promise.resolve({ id: attrs.id || undefined, ...attrs }));
  });

  it('membuat beberapa root CPMK dalam satu transaksi', async () => {
    Cpmk.create
      .mockResolvedValueOnce({ id: rootA, matakuliah_id: mkId })
      .mockResolvedValueOnce({ id: rootB, matakuliah_id: mkId });

    const result = await cpmkService.createBulk([item('CPMK 1'), item('CPMK 2')]);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(rootA);
    expect(result[1].id).toBe(rootB);
    expect(Cpmk.create).toHaveBeenCalledTimes(2);
    expect(CpmkScp.bulkCreate).toHaveBeenCalledTimes(2);
    expect(CpmkScp.bulkCreate).toHaveBeenNthCalledWith(
      1,
      [{ scp_id: scpId, cpmk_id: rootA }],
      { transaction: {} }
    );
  });

  it('menolak batch berisi mata kuliah yang berbeda', async () => {
    await expect(
      cpmkService.createBulk([item('CPMK 1'), item('CPMK 2', { matakuliah_id: otherMk })])
    ).rejects.toMatchObject({ code: 422 });
    expect(Cpmk.create).not.toHaveBeenCalled();
  });

  it('membuat CPMK ber-Sub-CPMK bersama CPMK SCP langsung dalam satu batch', async () => {
    const childA = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
    const childB = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
    Cpmk.create
      .mockResolvedValueOnce({ id: rootA, matakuliah_id: mkId })
      .mockResolvedValueOnce({ id: childA, matakuliah_id: mkId })
      .mockResolvedValueOnce({ id: childB, matakuliah_id: mkId })
      .mockResolvedValueOnce({ id: rootB, matakuliah_id: mkId });

    const result = await cpmkService.createBulk([
      item('CPMK 1', {
        scp_ids: [],
        sub_cpmk: [
          { nama_cpmk: 'Sub 1', deskripsi: 'D', scp_ids: [scpId] },
          { nama_cpmk: 'Sub 2', deskripsi: 'D', scp_ids: [scpId] },
        ],
      }),
      item('CPMK 2'),
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(rootA);
    expect(result[1].id).toBe(rootB);
    expect(Cpmk.create).toHaveBeenCalledTimes(4);
    expect(CpmkScp.bulkCreate).toHaveBeenCalledTimes(3);
    expect(CpmkScp.bulkCreate).toHaveBeenCalledWith(
      [{ scp_id: scpId, cpmk_id: childA }],
      { transaction: {} }
    );
    expect(CpmkScp.bulkCreate).toHaveBeenCalledWith(
      [{ scp_id: scpId, cpmk_id: childB }],
      { transaction: {} }
    );
    expect(CpmkScp.bulkCreate).toHaveBeenCalledWith(
      [{ scp_id: scpId, cpmk_id: rootB }],
      { transaction: {} }
    );
  });

  it('membatalkan batch bila ada item tanpa SCP dan tanpa Sub-CPMK', async () => {
    Cpmk.create.mockResolvedValue({ id: rootA, matakuliah_id: mkId });
    await expect(
      cpmkService.createBulk([item('CPMK 1'), item('CPMK 2', { scp_ids: [] })])
    ).rejects.toMatchObject({ code: 422 });
    expect(Cpmk.create).toHaveBeenCalledTimes(1);
  });
});
