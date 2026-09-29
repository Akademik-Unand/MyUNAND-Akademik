'use strict';

jest.mock('../../../src/models', () => ({
  User: { findByPk: jest.fn() },
  Dosen: { findByPk: jest.fn(), update: jest.fn().mockResolvedValue([1]) },
  Mahasiswa: { findByPk: jest.fn(), update: jest.fn().mockResolvedValue([1]) },
}));

const { User, Dosen, Mahasiswa } = require('../../../src/models');
const { getUserAcademicIdentity, linkUserAcademicProfile } = require('../../../src/helpers/userAcademicProfile');

describe('userAcademicProfile', () => {
  beforeEach(() => jest.clearAllMocks());

  it('resolves profile IDs through the user one-to-one associations', async () => {
    User.findByPk.mockResolvedValue({ dosen: { id: 'dosen-1' }, mahasiswa: null });
    await expect(getUserAcademicIdentity('user-1')).resolves.toEqual({ dosen_id: 'dosen-1', mahasiswa_id: null });
  });

  it('links one academic profile to an account and clears previous profile links', async () => {
    Mahasiswa.findByPk.mockResolvedValue({ id: 'mhs-1', user_id: null });
    await linkUserAcademicProfile({ userId: 'user-1', mahasiswaId: 'mhs-1', transaction: {} });
    expect(Dosen.update).toHaveBeenCalledWith({ user_id: null }, expect.objectContaining({ where: { user_id: 'user-1' } }));
    expect(Mahasiswa.update).toHaveBeenNthCalledWith(2, { user_id: 'user-1' }, expect.objectContaining({ where: { id: 'mhs-1' } }));
  });

  it('rejects linking a profile already owned by another account', async () => {
    Dosen.findByPk.mockResolvedValue({ id: 'dosen-1', user_id: 'user-other' });
    await expect(linkUserAcademicProfile({ userId: 'user-1', dosenId: 'dosen-1' }))
      .rejects.toMatchObject({ code: 409 });
  });
});
