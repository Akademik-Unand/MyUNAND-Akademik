export const formatDateTime = (value) => value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
export const participantName = (row) => row?.mahasiswa?.nama || row?.mahasiswa?.nama_lengkap || row?.nama_mahasiswa || row?.user?.name || row?.nim || 'Peserta';
export const participantProgram = (row) => row?.mahasiswa?.programStudi?.nama_resmi || row?.programStudi?.nama_resmi || row?.prodi_asal?.nama_resmi || 'Program studi tidak tersedia';
export const approvalStatusLabel = (status) => ({ menunggu_home: 'Menunggu Prodi Asal', menunggu_host: 'Menunggu Prodi Penyelenggara', disetujui: 'Disetujui', ditolak: 'Ditolak' }[status] || status || 'Menunggu');
