import { useState } from 'react';
import { Users } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { DetailList } from '../common/DetailList';
import { Skeleton } from '../ui/Skeleton';
import { useLaporanCpMatakuliahDetail } from '../../hooks/useLaporanCpMatakuliahDetail';
import { LaporanCpCpmkSemesterTab } from './LaporanCpCpmkSemesterTab';
import { LaporanCpRangkumanTab } from './LaporanCpRangkumanTab';
import { LaporanCpGrafikTab } from './LaporanCpGrafikTab';
import { LaporanCpNilaiPesertaTab } from './LaporanCpNilaiPesertaTab';
import { LaporanCpDokumenTab } from './LaporanCpDokumenTab';

const TABS = [
  { key: 'cpmk', label: 'CPMK Semester' },
  { key: 'rangkuman', label: 'Rangkuman Evaluasi CPMK' },
  { key: 'grafik', label: 'Grafik Rangkuman Evaluasi' },
  { key: 'nilai', label: 'Nilai Peserta Matakuliah' },
  { key: 'dokumen', label: 'Dokumen Evaluasi' },
];

export const LaporanCpMatakuliahModal = ({ matakuliahId, semesterId, kurikulumId, onClose }) => {
  const [tab, setTab] = useState('cpmk');
  const query = useLaporanCpMatakuliahDetail(
    matakuliahId,
    {
      semester_id: semesterId || undefined,
      kurikulum_id: kurikulumId || undefined,
    },
    { enabled: Boolean(matakuliahId) }
  );
  const data = query.data;

  return (
    <Modal
      open={Boolean(matakuliahId)}
      onClose={onClose}
      size="full"
      title={data?.matakuliah?.nama_resmi || 'Detail Mata Kuliah'}
      subtitle={data?.matakuliah?.kode_matakuliah}
    >
      {query.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : query.isError ? (
        <p className="text-sm text-error">{query.error?.message || 'Gagal memuat detail mata kuliah.'}</p>
      ) : (
        <div className="space-y-5">
          <DetailList
            items={[
              { label: 'Mata Kuliah', value: data?.matakuliah?.nama_resmi },
              { label: 'Kode MK', value: data?.matakuliah?.kode_matakuliah },
              { label: 'SKS', value: data?.matakuliah?.jumlah_sks_kurikulum },
              { label: 'Program Studi', value: data?.program_studi },
              { label: 'Kurikulum', value: data?.kurikulum?.nama },
              { label: 'Semester', value: data?.semester?.label || 'Semua semester' },
              { label: 'Jumlah Peserta', value: data?.jumlah_peserta ?? 0 },
            ]}
          />

          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Users size={15} className="text-base-content/60" />
              Kelas Penyelenggara Mata Kuliah
            </h4>
            {data?.kelas?.length ? (
              <ul className="divide-y divide-base-200 rounded-lg border border-base-200">
                {data.kelas.map((kelas) => (
                  <li key={kelas.id} className="flex flex-col gap-2 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-medium">
                      {data.matakuliah?.kode_matakuliah} {kelas.nama}
                    </span>
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                      <span className="badge badge-ghost badge-sm">{kelas.jumlah_peserta} peserta</span>
                      {kelas.dosen?.length > 0 && (
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs text-base-content/60">Dosen:</span>
                          {kelas.dosen.map((nama) => (
                            <span key={nama} className="badge badge-outline badge-sm font-normal">
                              {nama}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-base-content/60">Belum ada kelas penyelenggara.</p>
            )}
          </div>

          <div>
            <div className="tabs tabs-box mb-4 w-fit max-w-full overflow-x-auto bg-base-200">
              {TABS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`tab whitespace-nowrap ${tab === item.key ? 'tab-active' : ''}`}
                  onClick={() => setTab(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === 'cpmk' && <LaporanCpCpmkSemesterTab cpmk={data?.cpmk || []} />}
            {tab === 'rangkuman' && (
              <LaporanCpRangkumanTab evaluasi={data?.evaluasi || []} semesterLabel={data?.semester?.label} />
            )}
            {tab === 'grafik' && <LaporanCpGrafikTab evaluasi={data?.evaluasi || []} />}
            {tab === 'nilai' && <LaporanCpNilaiPesertaTab nilai={data?.nilai} />}
            {tab === 'dokumen' && <LaporanCpDokumenTab dokumen={data?.dokumen || []} />}
          </div>
        </div>
      )}
    </Modal>
  );
};