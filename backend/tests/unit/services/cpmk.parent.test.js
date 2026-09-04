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
const parentId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const childId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const scpId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

describe('cpmk parent and scp mapping', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Cpmk.findByPk.mockResolvedValue({ id: childId });
  });

  it('rejects a parent from a different matakuliah', async () => {
    Cpmk.findByPk.mockResolvedValueOnce({ id: parentId, matakuliah_id: otherMk, parent_cpmk_id: null });
    await expect(
      cpmkService.create({
        matakuliah_id: mkId,
        nama_cpmk: 'Sub 1',
        parent_cpmk_id: parentId,
        scp_ids: [scpId],
      })
    ).rejects.toMatchObject({ code: 422 });
  });

  it('rejects a nested parent (sub of a sub)', async () => {
    Cpmk.findByPk.mockResolvedValueOnce({
      id: parentId,
      matakuliah_id: mkId,
      parent_cpmk_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    });
    await expect(
      cpmkService.create({
        matakuliah_id: mkId,
        nama_cpmk: 'Sub 1',
        parent_cpmk_id: parentId,
        scp_ids: [scpId],
      })
    ).rejects.toMatchObject({ code: 422 });
  });

  it('syncs scp_ids for a sub-CPMK', async () => {
    Cpmk.findByPk
      .mockResolvedValueOnce({ id: parentId, matakuliah_id: mkId, parent_cpmk_id: null })
      .mockResolvedValueOnce({ id: childId, parent_cpmk_id: parentId, scp: [{ id: scpId }] });
    Cpmk.create.mockResolvedValue({ id: childId });

    await cpmkService.create({
      matakuliah_id: mkId,
      nama_cpmk: 'Sub 1',
      parent_cpmk_id: parentId,
      scp_ids: [scpId],
    });

    expect(CpmkScp.destroy).toHaveBeenCalledWith({ where: { cpmk_id: childId }, transaction: {} });
    expect(CpmkScp.bulkCreate).toHaveBeenCalledWith(
      [{ scp_id: scpId, cpmk_id: childId }],
      { transaction: {} }
    );
  });

  it('syncs scp_ids for a root CPMK', async () => {
    Cpmk.create.mockResolvedValue({ id: parentId });
    Cpmk.findByPk.mockResolvedValueOnce({ id: parentId, parent_cpmk_id: null, scp: [{ id: scpId }] });

    await cpmkService.create({
      matakuliah_id: mkId,
      nama_cpmk: 'CPMK 1',
      scp_ids: [scpId],
    });

    expect(CpmkScp.destroy).toHaveBeenCalledWith({ where: { cpmk_id: parentId }, transaction: {} });
    expect(CpmkScp.bulkCreate).toHaveBeenCalledWith(
      [{ scp_id: scpId, cpmk_id: parentId }],
      { transaction: {} }
    );
  });

  it('rejects a root CPMK without SCP and without sub-CPMK', async () => {
    await expect(
      cpmkService.create({
        matakuliah_id: mkId,
        nama_cpmk: 'CPMK 1',
        scp_ids: [],
      })
    ).rejects.toMatchObject({ code: 422 });
    expect(Cpmk.create).not.toHaveBeenCalled();
  });

  it('creates nested sub-CPMK and maps SCP only to children', async () => {
    const secondChild = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
    Cpmk.create
      .mockResolvedValueOnce({ id: parentId, matakuliah_id: mkId })
      .mockResolvedValueOnce({ id: childId })
      .mockResolvedValueOnce({ id: secondChild });
    Cpmk.findByPk.mockResolvedValue({ id: parentId, parent_cpmk_id: null, scp: [] });

    await cpmkService.create({
      matakuliah_id: mkId,
      nama_cpmk: 'CPMK 1',
      scp_ids: [scpId],
      sub_cpmk: [
        { nama_cpmk: 'Sub 1', scp_ids: [scpId] },
        { nama_cpmk: 'Sub 2', scp_ids: [scpId] },
      ],
    });

    expect(Cpmk.create).toHaveBeenCalledTimes(3);
    expect(CpmkScp.bulkCreate).toHaveBeenCalledTimes(2);
    expect(CpmkScp.bulkCreate).toHaveBeenCalledWith(
      [{ scp_id: scpId, cpmk_id: childId }],
      { transaction: {} }
    );
    expect(CpmkScp.bulkCreate).toHaveBeenCalledWith(
      [{ scp_id: scpId, cpmk_id: secondChild }],
      { transaction: {} }
    );
  });

  it('clears parent SCP when a sub-CPMK is added later', async () => {
    Cpmk.findByPk
      .mockResolvedValueOnce({ id: parentId, matakuliah_id: mkId, parent_cpmk_id: null })
      .mockResolvedValueOnce({ id: childId, parent_cpmk_id: parentId, scp: [{ id: scpId }] });
    Cpmk.create.mockResolvedValue({ id: childId });

    await cpmkService.create({
      matakuliah_id: mkId,
      nama_cpmk: 'Sub 1',
      parent_cpmk_id: parentId,
      scp_ids: [scpId],
    });

    expect(CpmkScp.destroy).toHaveBeenCalledWith({ where: { cpmk_id: parentId }, transaction: {} });
  });
});
