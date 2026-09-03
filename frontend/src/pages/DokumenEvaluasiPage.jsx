import { useState } from 'react';
import { Upload } from 'lucide-react';
import { MKSemesterLayout } from '../components/mk-semester/MKSemesterLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormActions } from '../components/common/FormActions';
import { DataTable } from '../components/common/DataTable';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { useResourceMutations } from '../hooks/useResourceMutations';
import { FILTER_SEMESTER } from '../constants/mockData';

export const DokumenEvaluasiPage = () => {
  const [semester, setSemester] = useState(FILTER_SEMESTER[0]);
  const [tab, setTab] = useState('daftar');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [form, setForm] = useState({ nama: '', keterangan: '', berkas: '' });
  const mutations = useResourceMutations('dokumen-evaluasi', { create: 'Dokumen berhasil diunggah.' });

  const daftarColumns = [
    { key: 'no', header: 'No', sortable: true },
    { key: 'nama', header: 'Nama Dokumen', sortable: true },
    { key: 'keterangan', header: 'Keterangan', sortable: true },
    { key: 'berkas', header: 'Nama Berkas', sortable: true },
    { key: 'uploader', header: 'Uploader', sortable: true },
    { key: 'waktu', header: 'Waktu', sortable: true },
  ];

  const jenisColumns = [
    { key: 'no', header: '#', sortable: true },
    { key: 'nama', header: 'Nama File', sortable: true },
    { key: 'tipe', header: 'Tipe', sortable: true },
    { key: 'keharusan', header: 'Keharusan', sortable: true },
    { key: 'keterangan', header: 'Keterangan', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filter: { type: 'select', options: ['Sudah diunggah', 'Belum ada'] },
      render: (row) => (
        <span className={`badge badge-sm ${row.status === 'Sudah diunggah' ? 'badge-success' : 'badge-ghost'}`}>
          {row.status}
        </span>
      ),
    },
  ];

  const submitUpload = (e) => {
    e.preventDefault();
    mutations.create.mutate({
      ...form,
      berkas: form.berkas || 'dokumen-evaluasi.pdf',
      uploader: 'Ilhamdi',
      waktu: '3 September 2026, 13:40',
    });
    setUploadOpen(false);
    setForm({ nama: '', keterangan: '', berkas: '' });
  };

  return (
    <MKSemesterLayout
      active="dokumen"
      semester={semester}
      onSemesterChange={setSemester}
      action={
        <Button size="sm" className="gap-1.5" onClick={() => setUploadOpen(true)}>
          <Upload size={14} /> Upload Dokumen
        </Button>
      }
    >
      <Card>
        <p className="mb-4 text-sm text-success">
          Masa input nilai sedang dibuka.
          <br />
          Belum ada pengaturan jenis dokumen evaluasi yang harus diupload. Upload nilai mahasiswa di Kelas boleh dilakukan.
        </p>

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
            rowKey={(row) => row.id}
            searchPlaceholder="Cari dokumen..."
          />
        ) : (
          <DataTable
            resource="jenis-dokumen"
            tableKey="jenis_"
            columns={jenisColumns}
            rowKey={(row) => row.no}
            searchPlaceholder="Cari jenis dokumen..."
          />
        )}
      </Card>

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Dokumen Evaluasi"
        footer={
          <FormActions
            onCancel={() => setUploadOpen(false)}
            submitLabel="Unggah"
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
          <Textarea
            label="Keterangan"
            rows={3}
            value={form.keterangan}
            onChange={(e) => setForm((prev) => ({ ...prev, keterangan: e.target.value }))}
          />
          <Input
            label="Nama berkas"
            placeholder="contoh: rps.pdf"
            value={form.berkas}
            onChange={(e) => setForm((prev) => ({ ...prev, berkas: e.target.value }))}
          />
        </form>
      </Modal>
    </MKSemesterLayout>
  );
};
