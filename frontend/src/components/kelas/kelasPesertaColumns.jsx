import { Badge } from '../ui/Badge';
import { jenisKelaminLabel } from '../../helpers/mahasiswa';
import { krsApprovedLabel, krsApprovedVariant } from '../../helpers/krsStatus';

export const kelasPesertaColumns = [
  { header: '#', render: (_, idx) => idx + 1 },
  {
    key: 'niu',
    header: 'NIU',
    render: (row) => row.krs?.mahasiswa?.niu || '—',
  },
  {
    key: 'nama',
    header: 'Nama',
    cellClassName: 'font-semibold',
    render: (row) => row.krs?.mahasiswa?.nama || '—',
  },
  {
    key: 'angkatan',
    header: 'Angkatan',
    render: (row) => row.krs?.mahasiswa?.angkatan || '—',
  },
  {
    key: 'jenis_kelamin',
    header: 'JK',
    render: (row) => jenisKelaminLabel(row.krs?.mahasiswa?.jenis_kelamin),
  },
  {
    key: 'prodi',
    header: 'Prodi',
    render: (row) =>
      row.krs?.mahasiswa?.programStudi?.nama_singkat ||
      row.krs?.mahasiswa?.programStudi?.nama_resmi ||
      '—',
  },
  {
    key: 'approved',
    header: 'Status',
    sortable: true,
    filter: {
      type: 'select',
      options: [
        { value: '0', label: 'Menunggu' },
        { value: '1', label: 'Disetujui' },
        { value: '2', label: 'Ditolak' },
      ],
    },
    render: (row) => (
      <Badge variant={krsApprovedVariant(row.approved)} outline>
        {krsApprovedLabel(row.approved)}
      </Badge>
    ),
  },
];
