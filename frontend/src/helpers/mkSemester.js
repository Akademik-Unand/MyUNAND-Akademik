export const mkLabel = (row) =>
  row?.matakuliah?.nama_resmi || row?.nama_resmi || row?.nama || 'Mata kuliah';

export const mkKode = (row) =>
  row?.matakuliah?.kode_matakuliah || row?.kode_matakuliah || row?.kode || '';
