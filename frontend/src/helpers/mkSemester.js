import { MK_SEMESTER } from '../constants/mockData';

export const findMataKuliah = (kode) =>
  MK_SEMESTER.find((item) => item.kode === decodeURIComponent(kode || '')) || MK_SEMESTER[0];
