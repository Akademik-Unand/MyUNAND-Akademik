# LAPORAN KEGIATAN HARIAN PEKERJA HARIAN LEPAS

**Pengembang Aplikasi MYUNAND KURIKULUM**  
**PADA DIREKTORAT PENDIDIKAN DAN PEMBELAJARAN UNIVERSITAS ANDALAS**

**Periode: 1–30 September 2026**

> **Catatan penyusunan:** Rincian pekerjaan yang sudah dikembangkan dijabarkan dan dialokasikan ke 22 hari kerja untuk penyusunan logbook, karena beberapa fitur dikerjakan sekaligus dalam satu hari. Tanggal pada tabel merupakan pembagian administratif kegiatan, bukan tanggal realisasi harian atau tanggal commit. Sabtu dan Minggu dicatat sebagai libur. Cakupan pekerjaan sampai fitur cross enrollment; aplikasi masih dalam pengembangan.

| Tanggal | Kegiatan |
| --- | --- |
| Selasa, 1 September 2026 | Menyusun cakupan modul MYUNAND KURIKULUM berdasarkan struktur aplikasi: data institusi dan program studi, kurikulum dan mata kuliah, capaian pembelajaran, perkuliahan, nilai, serta KRS. Memetakan hubungan fakultas–departemen–program studi dan keterkaitannya dengan dosen, mahasiswa, serta hak akses pengguna. |
| Rabu, 2 September 2026 | Menyiapkan struktur basis data akademik menggunakan model dan migrasi Sequelize, meliputi kurikulum, mata kuliah, CP, SCP, CPMK, kelas, KRS, dan nilai mahasiswa. Menata relasi antartabel, indeks, serta data awal untuk mendukung pengembangan modul secara terhubung. |
| Kamis, 3 September 2026 | Menyiapkan backend Express dan frontend React–Vite; membangun kerangka halaman, navigasi, serta formulir pengelolaan data. Menyiapkan autentikasi dan pola layanan API agar halaman frontend dapat berkomunikasi dengan backend. |
| Jumat, 4 September 2026 | Menghubungkan halaman aplikasi dengan API dan menyelaraskan respons daftar data, pencarian, pengurutan, filter, serta pagination. Menyiapkan Redis dan konfigurasi Docker Compose, serta merapikan jarak antarkomponen dan tampilan halaman. |
| Sabtu, 5 September 2026 | **Libur akhir pekan.** |
| Minggu, 6 September 2026 | **Libur akhir pekan.** |
| Senin, 7 September 2026 | Mengembangkan pengelolaan data master fakultas, departemen, program studi, jenjang akademik, dan dosen. Menyediakan formulir tambah/ubah, tampilan detail, penghapusan data master secara soft delete, serta filter data berdasarkan hierarki unit akademik. |
| Selasa, 8 September 2026 | Mengembangkan pengelolaan kurikulum program studi, termasuk nama, tahun kurikulum, masa studi ideal, dan masa studi maksimal. Menghubungkan data mata kuliah beserta kode, SKS, sifat, dan tipe mata kuliah dengan struktur kurikulum. |
| Rabu, 9 September 2026 | Mengembangkan pengelolaan capaian pembelajaran kurikulum berupa CP dan sub-CP (SCP). Menambahkan isian deskripsi, batas nilai, serta target persentase capaian SCP, dengan pemilihan kurikulum melalui filter fakultas, departemen, dan program studi. |
| Kamis, 10 September 2026 | Mengembangkan pengaturan CPMK mata kuliah dan pemetaannya ke SCP. Menyediakan pengelolaan sumber penilaian beserta bobot pada pengaturan CPMK semester, termasuk pemeriksaan agar total bobot sumber penilaian tidak melebihi 100 persen. |
| Jumat, 11 September 2026 | Mengembangkan pengelolaan pengguna dengan banyak peran, matriks permission, dan penugasan unit organisasi. Menyelaraskan akses menu, tombol, halaman, dan API berdasarkan izin; membatasi data sesuai unit pengguna serta menyediakan pencatatan aktivitas perubahan data. |
| Sabtu, 12 September 2026 | **Libur akhir pekan.** |
| Minggu, 13 September 2026 | **Libur akhir pekan.** |
| Senin, 14 September 2026 | Mengembangkan pengaturan semester aktif universitas dan periode pengisian CPMK, nilai, serta KRS. Menetapkan pembatasan perubahan data sesuai jenis periode dan tanggal buka/tutup, serta memisahkan pengaturan kuota SKS program studi dari pengelolaan profil prodi. |
| Selasa, 15 September 2026 | Mengembangkan pengelolaan nilai per kelas melalui daftar kelas, matriks nilai mahasiswa berdasarkan sumber penilaian, dan riwayat unggah nilai. Menghubungkan nilai dengan CPMK dan bobot sumber penilaian serta menerapkan pembatasan perubahan nilai berdasarkan periode pengisian. |
| Rabu, 16 September 2026 | Mengembangkan evaluasi CPMK, rekap CP, dan grafik capaian terhadap target. Menyusun pratinjau laporan berdasarkan keterkaitan CP–SCP–CPMK–mata kuliah, serta detail evaluasi mata kuliah yang memuat kelas, dosen, peserta, sumber penilaian, dan dokumen evaluasi. |
| Kamis, 17 September 2026 | Mengembangkan pengelolaan kelas yang terhubung dengan mata kuliah, semester, program studi, dan detail penawaran. Menambahkan pengaturan dosen pengampu per kelas, kapasitas peserta, serta pemeriksaan kesesuaian mata kuliah dan semester pada penawaran yang dipilih. |
| Jumat, 18 September 2026 | Merinci pengelolaan jadwal kuliah melalui master gedung, ruang, dan shift per fakultas. Menghubungkan hari dan jam perkuliahan dengan kelas serta menerapkan pemeriksaan bentrok penggunaan ruang pada hari dan rentang waktu yang sama. |
| Sabtu, 19 September 2026 | **Libur akhir pekan.** |
| Minggu, 20 September 2026 | **Libur akhir pekan.** |
| Senin, 21 September 2026 | Mengembangkan penetapan dosen pembimbing akademik secara individual dan massal. Menyediakan daftar mahasiswa yang belum memiliki PA aktif, ringkasan beban bimbingan, pemeriksaan kesesuaian prodi/departemen dosen, serta penutupan bimbingan lama ketika PA diganti. |
| Selasa, 22 September 2026 | Mengembangkan alur penawaran mata kuliah oleh prodi penyelenggara, meliputi detail mata kuliah, pilihan prodi yang boleh mengakses, rentang semester mahasiswa, dan kuota lintas prodi. Menghubungkan status publikasi penawaran dengan katalog mata kuliah yang dapat dipilih mahasiswa. |
| Rabu, 23 September 2026 | Mengembangkan halaman pengambilan KRS mahasiswa yang menampilkan semester aktif, periode KRS, batas SKS, daftar mata kuliah yang tersedia, dan mata kuliah yang sudah diambil. Menghubungkan pemilihan kelas dengan penawaran yang telah dipublikasikan dan menampilkan status pengajuan reguler maupun lintas prodi. |
| Kamis, 24 September 2026 | Merinci validasi pengajuan cross enrollment: penawaran harus dipublikasikan, prodi penyelenggara berbeda dari prodi mahasiswa, akses prodi tujuan sesuai, rentang semester memenuhi syarat, mata kuliah tidak berprasyarat, dan mahasiswa memiliki PA aktif. Menyimpan pengajuan pada detail KRS dengan status awal pending_pa. |
| Jumat, 25 September 2026 | Mengembangkan pemeriksaan kuota lintas prodi, akumulasi SKS, pengambilan kelas yang sama, serta bentrok jadwal terhadap mata kuliah dalam KRS. Memisahkan kuota lintas prodi dari kapasitas mahasiswa prodi sendiri dan menggunakan transaksi basis data dalam proses pengajuan. |
| Sabtu, 26 September 2026 | **Libur akhir pekan.** |
| Minggu, 27 September 2026 | **Libur akhir pekan.** |
| Senin, 28 September 2026 | Mengembangkan tampilan persetujuan KRS dan daftar mahasiswa bimbingan untuk dosen PA. Menghubungkan persetujuan dengan pembaruan status detail KRS reguler dan pengajuan lintas prodi yang masih menunggu, serta pencatatan pengguna dan waktu persetujuan PA. |
| Selasa, 29 September 2026 | Memperbaiki penerapan filter unit pada halaman akademik, termasuk evaluasi CPMK, laporan CP, kelas, nilai, dan bimbingan akademik. Menyelaraskan pilihan organisasi dengan filter backend serta menyiapkan skenario pengujian end-to-end untuk login, penawaran mata kuliah, dan KRS. |
| Rabu, 30 September 2026 | Memperbaiki kelayakan kelas untuk pengambilan KRS: kelas harus memiliki jadwal lengkap dan dosen pengampu. Menyelaraskan pemeriksaan pada KRS reguler dan cross enrollment, memperjelas alasan kelas belum dapat dipilih, serta menyesuaikan ringkasan dashboard dan navigasi pengguna. |

Rujukan cakupan pekerjaan: [dokumentasi API](backend/docs/api.md), [konsolidasi semester global](backend/docs/semester-global.md), [hak akses pengguna](backend/docs/permissions.md), [implementasi cross enrollment](backend/src/services/krs/cross-enrollment.service.js), dan [implementasi KRS serta persetujuan PA](backend/src/services/krs/krs.service.js).
