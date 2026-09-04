import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Can } from '../auth/Can';
import { csvToNilaiItems, matrixToCsv } from '../../helpers/nilaiCsv';
import { matakuliahKurikulumId } from '../../helpers/kelasInfo';
import { uploadNilaiBulk } from '../../services/api';

const downloadCsv = (filename, content) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const NilaiPesertaToolbar = ({ kelas, data, mode = 'link' }) => {
  const inputRef = useRef(null);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const mkId = matakuliahKurikulumId(kelas);
  const kelasId = kelas?.id;

  const onDownload = () => {
    if (!data?.peserta?.length) {
      toast.error('Belum ada peserta untuk template.');
      return;
    }
    downloadCsv(`nilai-${kelasId}.csv`, matrixToCsv(data));
    toast.success('Template diunduh.');
  };

  const onUploadFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !data) return;
    setBusy(true);
    try {
      const text = await file.text();
      const items = csvToNilaiItems(text, data);
      if (!items.length) {
        toast.error('Tidak ada nilai yang bisa diunggah dari berkas itu.');
        return;
      }
      await uploadNilaiBulk({
        kelas_id: kelasId,
        file_name: file.name,
        keterangan: `Unggah ${items.length} nilai dari CSV`,
        items,
      });
      await queryClient.invalidateQueries({ queryKey: ['nilai-matriks', kelasId] });
      await queryClient.invalidateQueries({ queryKey: ['table', 'upload-history'] });
      toast.success(`Berhasil mengunggah ${items.length} nilai.`);
    } catch (err) {
      toast.error(err.message || 'Gagal mengunggah nilai.');
    } finally {
      setBusy(false);
    }
  };

  if (mode === 'link') {
    return (
      <Can any={[{ I: 'update', a: 'NilaiMahasiswa' }, { I: 'upload', a: 'NilaiMahasiswa' }]}>
        <Link to={`/perkuliahan/upload-nilai/${kelasId}`} className="btn btn-success btn-sm">
          Upload Nilai
        </Link>
      </Can>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Can I="read" a="NilaiMahasiswa">
        <button type="button" className="btn btn-success btn-sm" onClick={onDownload}>
          Download Template
        </button>
      </Can>
      <Can I="upload" a="NilaiMahasiswa">
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={onUploadFile}
          />
          <button
            type="button"
            className="btn btn-success btn-sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? 'Mengunggah...' : 'Upload Nilai'}
          </button>
        </>
      </Can>
      {mkId && (
        <Can I="read" a="DokumenEvaluasi">
          <Link to={`/perkuliahan/mk-semester/${mkId}/dokumen`} className="btn btn-success btn-sm">
            Lengkapi Dokumen
          </Link>
        </Can>
      )}
    </div>
  );
};
