import { Card } from "../ui/Card";
import { DataTable } from "../common/DataTable";
import { kelasPesertaColumns } from "./kelasPesertaColumns";
import { NilaiPesertaMatrix } from "./NilaiPesertaMatrix";
import { NilaiPesertaToolbar } from "./NilaiPesertaToolbar";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCan } from "../../hooks/useCan";
import { useNilaiPeriodOpen } from "../../hooks/usePeriodes";
import { uploadNilaiBulk } from "../../services/api";
import { useKelasNilaiMatriks } from "../../hooks/useKelasNilaiMatriks";
import { Skeleton } from "../ui/Skeleton";

export const KelasNilaiPanel = ({ kelas, toolbar = "link" }) => {
  const kelasId = kelas?.id;
  const can = useCan();
  const queryClient = useQueryClient();
  const [savingStudentId, setSavingStudentId] = useState(null);
  const nilaiOpen = useNilaiPeriodOpen(kelas).open;
  const canNilai = can("read", "NilaiMahasiswa");
  const query = useKelasNilaiMatriks(kelasId, {
    enabled: canNilai && Boolean(kelasId),
  });

  if (!canNilai) {
    return (
      <Card title="Daftar Peserta">
        <DataTable
          resource="kelas-peserta"
          tableKey="pst_"
          columns={kelasPesertaColumns}
          extraFilter={kelasId ? { kelas_id: kelasId } : undefined}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari NIU atau nama mahasiswa..."
        />
      </Card>
    );
  }

  if (query.isPending) {
    return (
      <Card title="Nilai Peserta Matakuliah">
        <Skeleton className="h-48 w-full" />
      </Card>
    );
  }

  if (query.isError) {
    return (
      <Card title="Daftar Peserta">
        <p className="text-sm text-error mb-3">
          {query.error?.message || "Gagal memuat matriks nilai."}
        </p>
        <DataTable
          resource="kelas-peserta"
          tableKey="pst_"
          columns={kelasPesertaColumns}
          extraFilter={kelasId ? { kelas_id: kelasId } : undefined}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari NIU atau nama mahasiswa..."
        />
      </Card>
    );
  }

  const saveStudentNilai = async ({ krs_detil_id, items, nama }) => {
    setSavingStudentId(krs_detil_id);
    try {
      await uploadNilaiBulk({
        kelas_id: kelasId,
        file_name: "Input Manual",
        keterangan: `Input manual untuk ${nama}`,
        items,
      });
      await queryClient.invalidateQueries({ queryKey: ["nilai-matriks", kelasId] });
      await queryClient.invalidateQueries({ queryKey: ["table", "upload-history"] });
      toast.success(`Nilai ${nama} berhasil disimpan.`);
      return true;
    } catch (error) {
      toast.error(error.message || "Gagal menyimpan nilai mahasiswa.");
      return false;
    } finally {
      setSavingStudentId(null);
    }
  };

  const canInputNilai =
    toolbar === "upload" && can("upload", "NilaiMahasiswa") && nilaiOpen;

  return (
    <Card
      title="Nilai Peserta Matakuliah"
      actions={
        <NilaiPesertaToolbar kelas={kelas} data={query.data} mode={toolbar} />
      }
    >
      <NilaiPesertaMatrix
        data={query.data}
        editable={canInputNilai && query.data?.assessment?.ready !== false}
        savingStudentId={savingStudentId}
        onSaveStudent={saveStudentNilai}
      />
    </Card>
  );
};
