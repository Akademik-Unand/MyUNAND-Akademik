import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { FormActions } from '../components/common/FormActions';
import { LAPORAN_CP, LAPORAN_MATRIX, FILTER_KURIKULUM, FILTER_SEMESTER } from '../constants/mockData';

export const LaporanCPFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = id ? LAPORAN_CP.find((l) => l.id === id) : null;
  const isEdit = Boolean(existing);
  const [values, setValues] = useState({
    nama: existing?.nama || '',
    keterangan: existing?.keterangan || '',
    kurikulum: existing?.kurikulum || '',
    semester: existing?.semester || '',
  });
  const [checked, setChecked] = useState(LAPORAN_MATRIX.map((r) => r.checked));

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success(isEdit ? 'Laporan CP diperbarui' : 'Laporan CP dibuat', {
      description: 'Perubahan hanya disimpan di sesi ini (data mock).',
    });
    navigate('/perkuliahan/laporan-cp');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Ubah Laporan CP' : 'Buat Laporan CP'}
        breadcrumbs={[
          { label: 'Semester & Perkuliahan' },
          { label: 'Laporan CP', path: '/perkuliahan/laporan-cp' },
          { label: isEdit ? 'Ubah' : 'Tambah' },
        ]}
      />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Judul Laporan CP" value={values.nama} onChange={(e) => setValues({ ...values, nama: e.target.value })} required />
          <Textarea label="Keterangan" value={values.keterangan} onChange={(e) => setValues({ ...values, keterangan: e.target.value })} />
          <Select
            label="Kurikulum"
            value={values.kurikulum}
            onChange={(e) => setValues({ ...values, kurikulum: e.target.value })}
            placeholder="Pilih Kurikulum"
            options={FILTER_KURIKULUM.map((k) => ({ value: k, label: k }))}
          />
          <Select
            label="Semester"
            value={values.semester}
            onChange={(e) => setValues({ ...values, semester: e.target.value })}
            placeholder="Pilih Semester"
            options={FILTER_SEMESTER.map((s) => ({ value: s, label: s }))}
          />

          <div className="overflow-x-auto">
            <table className="table table-xs table-bordered w-full">
              <thead>
                <tr>
                  <th>CP</th>
                  <th>SCP</th>
                  <th>CPMK</th>
                  <th>Mata Kuliah</th>
                  <th>Sumber Penilaian</th>
                  <th>Nilai Min</th>
                  <th>Target</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {LAPORAN_MATRIX.map((row, idx) => (
                  <tr key={`${row.cpmk}-${idx}`}>
                    <td>{row.cp}</td>
                    <td>{row.scp}</td>
                    <td>{row.cpmk}</td>
                    <td>{row.mk}</td>
                    <td className="text-xs">{row.sumber}</td>
                    <td>{row.nilaiMin}</td>
                    <td>{row.target}</td>
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs checkbox-primary"
                        checked={checked[idx]}
                        onChange={(e) =>
                          setChecked((prev) => prev.map((v, i) => (i === idx ? e.target.checked : v)))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <FormActions onCancel={() => navigate('/perkuliahan/laporan-cp')} submitLabel={isEdit ? 'Perbarui' : 'Simpan'} />
        </form>
      </Card>
    </div>
  );
};
