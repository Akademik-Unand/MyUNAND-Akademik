'use strict';

jest.mock('../../../src/models', () => ({
  DosenKelas: { findOne: jest.fn() },
  Kelas: {},
}));
jest.mock('../../../src/helpers/userAcademicProfile', () => ({
  getUserAcademicIdentity: jest.fn(),
}));

const { DosenKelas } = require('../../../src/models');
const { getUserAcademicIdentity } = require('../../../src/helpers/userAcademicProfile');
const { assertTeachesClass, assertTeachesCourse, enforceDosenClassScope } = require('../../../src/helpers/dosenScope');

describe('dosenScope', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects a lecturer who is not assigned to the class', async () => {
    getUserAcademicIdentity.mockResolvedValue({ dosen_id: 'dosen-a' });
    DosenKelas.findOne.mockResolvedValue(null);
    await expect(assertTeachesClass('user-a', 'kelas-b')).rejects.toMatchObject({ code: 403 });
    expect(DosenKelas.findOne).toHaveBeenCalledWith({ where: { dosen_id: 'dosen-a', kelas_id: 'kelas-b' }, transaction: undefined });
  });

  it('checks lecturer assignment through the class course relation', async () => {
    getUserAcademicIdentity.mockResolvedValue({ dosen_id: 'dosen-a' });
    DosenKelas.findOne.mockResolvedValue({ id: 'assignment' });
    await expect(assertTeachesCourse('user-a', 'mk-1')).resolves.toBeUndefined();
    expect(DosenKelas.findOne).toHaveBeenCalledWith(expect.objectContaining({
      where: { dosen_id: 'dosen-a' },
      include: [expect.objectContaining({ as: 'kelas', where: { matakuliah_id: 'mk-1' } })],
    }));
  });

  it('requires a class context for a lecturer and allows explicit manage-any', async () => {
    getUserAcademicIdentity.mockResolvedValue({ dosen_id: 'dosen-a' });
    await expect(enforceDosenClassScope('user-a', null)).rejects.toMatchObject({ code: 403 });
    await expect(enforceDosenClassScope('user-a', null, { manageAny: true })).resolves.toBeUndefined();
    expect(DosenKelas.findOne).not.toHaveBeenCalled();
  });
});
