import { useState } from 'react';
import { Upload } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { MKSemesterLayout } from '../../components/mk-semester/MKSemesterLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FormActions } from '../../components/common/FormActions';
import { DataTable } from '../../components/common/DataTable';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ResourceSelect } from '../../components/common/ResourceSelect';
import { Can } from '../../components/auth/Can';
import { useResourceMutations } from '../../hooks/useResourceMutations';

export const DokumenEvaluasiPage = () => {
  const { id } = useParams();
  const [semester, setSemester] = useState('');
  const [tab, setTab] = useState('daftar');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [form, setForm] = useState({
    nama: '',
    keterangan: '',
    file_path: '',
    jenis_dokumen_evaluasi_id: '',
  });
  const mutations = useResourceMutations('dokumen-evaluasi', { create: 'Dokumen berhasil disimpan.' });

  const daftarColumns = [
    { key: 'nama', header: 'Nama Dokumen', sortable: true },
    { key: 'keterangan', header: 'Keterangan', sortable: true },
    { key: 'file_path', header: 'Berkas', sortable: true },
    {
      key: 'user_id',
      header: 'Uploader',
      render: (row) => row.uploader?.name || '—',
    },
    { key: 'createdAt', header: 'Waktu', sortable: true },
  ];

  const jenisColumns = [
    { key: 'nama', header: 'Nama', sortable: true },
    { key: 'tipe', header: 'Tipe', sortable: true },
    { key: 'keterangan', header: 'Keterangan', sortable: true },
  ];

  const submitUpload = async (e) => {
    e.preventDefault();
    if (mutations.create.isPending) return;
    await mutations.create.mutateAsync({
      nama: form.nama,
      keterangan: form.keterangan || null,
      file_path: form.file_path || null,
      jenis_dokumen_evaluasi_id: form.jenis_dokumen_evaluasi_id || null,
      matakuliah_id: id || null,
      semester_id: semester || null,
    });
    setUploadOpen(false);
    setForm({ nama: '', keterangan: '', file_path: '', jenis_dokumen_evaluasi_id: '' });
  };

  return (
    <MKSemesterLayout
      semester={semester}
      onSemesterChange={setSemester}
      action={
        <Can I="create" a="DokumenEvaluasi">
          <Button size="sm" className="gap-1.5" onClick={() => setUploadOpen(true)}>
            <Upload size={14} /> Simpan Dokumen
          </Button>
        </Can>
      }
    >
      <Card>
        <div className="tabs tabs-box mb-4 w-fit bg-base-200">
          <button type="button" className={`tab ${tab === 'daftar' ? 'tab-active' : ''}`} onClick={() => setTab('daftar')}>
            Daftar Dokumen Evaluasi
          </button>
          <button type="button" className={`tab ${tab === 'jenis' ? 'tab-active' : ''}`} onClick={() => setTab('jenis')}>
            Informasi Jenis Dokumen
          </button>
        </div>

        {tab === 'daftar' ? (
          <DataTable
            resource="dokumen-evaluasi"
            tableKey="doc_"
            columns={daftarColumns}
            extraFilter={id ? { matakuliah_id: id } : undefined}
            rowKey={(row) => row.id}
            searchPlaceholder="Cari dokumen..."
          />
        ) : (
          <DataTable
            resource="jenis-dokumen"
            tableKey="jenis_"
            columns={jenisColumns}
            rowKey={(row) => row.id}
            searchPlaceholder="Cari jenis dokumen..."
          />
        )}
      </Card>

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Simpan Dokumen Evaluasi"
        closeOnBackdrop={!mutations.create.isPending}
        footer={
          <FormActions
            onCancel={() => setUploadOpen(false)}
            submitLabel="Simpan"
            isLoading={mutations.create.isPending}
            onSubmitClick={() => document.getElementById('upload-dokumen-form')?.requestSubmit()}
          />
        }
      >
        <form id="upload-dokumen-form" className="space-y-3" onSubmit={submitUpload}>
          <Input
            label="Nama dokumen"
            value={form.nama}
            onChange={(e) => setForm((prev) => ({ ...prev, nama: e.target.value }))}
            required
          />
          <ResourceSelect
            resource="jenis-dokumen"
            label="Jenis dokumen"
            value={form.jenis_dokumen_evaluasi_id}
            onChange={(e) => setForm((prev) => ({ ...prev, jenis_dokumen_evaluasi_id: e.target.value }))}
            getLabel={(row) => row.nama}
          />
          <Textarea
            label="Keterangan"
            rows={3}
            value={form.keterangan}
            onChange={(e) => setForm((prev) => ({ ...prev, keterangan: e.target.value }))}
          />
          <Input
            label="Path berkas"
            placeholder="contoh: rps.pdf"
            value={form.file_path}
            onChange={(e) => setForm((prev) => ({ ...prev, file_path: e.target.value }))}
          />
        </form>
      </Modal>
    </MKSemesterLayout>
  );
};
