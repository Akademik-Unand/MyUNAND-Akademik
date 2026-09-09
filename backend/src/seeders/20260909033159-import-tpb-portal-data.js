'use strict';

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { QueryTypes } = require('sequelize');
const H = require('../helpers/tpbSqlImport');

const TABLES = ['users', 'dosen', 'mahasiswa', 'mata_kuliah', 'tahun_ajaran', 'tahun_ajaran_matkul', 'cpl', 'cpmk', 'cpmk_cpl', 'cpmk_mat_kul', 'cpmk_parents', 'komponen', 'bobot', 'kelas', 'dosen_pengampu_kelas', 'kelas_mahasiswa', 'nilai'];
const ownedId = H.deterministicUuid;
const stamp = (r = {}) => ({ createdAt: r.created_at || new Date(), updatedAt: r.updated_at || r.created_at || new Date() });
const by = (rows, key = 'id') => new Map(rows.map((r) => [String(r[key]), r]));
const chunk = (rows, size = 750) => Array.from({ length: Math.ceil(rows.length / size) }, (_, i) => rows.slice(i * size, (i + 1) * size));
async function insert(qi, table, rows, transaction) { for (const part of chunk(rows)) if (part.length) await qi.bulkInsert(table, part, { transaction, ignoreDuplicates: true }); }
async function select(qi, sql, replacements, transaction) { return qi.sequelize.query(sql, { replacements, transaction, type: QueryTypes.SELECT }); }
async function first(qi, sql, replacements, transaction) { return (await select(qi, sql, replacements, transaction))[0]; }
async function resolveMaster(qi, table, predicate, replacements, row, transaction) {
  const existing = await first(qi, `SELECT id FROM ${table} WHERE ${predicate} LIMIT 1`, replacements, transaction);
  if (existing) return existing.id;
  await insert(qi, table, [row], transaction);
  return row.id;
}
const actualMap = (source, targets, sourceKey, targetKey) => H.mapSourceToActualIds(source, targets, sourceKey, targetKey);
const roleName = (role) => role === 'pimpinan' ? 'pimpinan-prodi' : role === 'admin' ? 'admin-prodi' : role;
const dump = () => parseDump(path.resolve(__dirname, '../../../tpb.sql'));
function parseDump(file) { if (!fs.existsSync(file)) throw new Error(`TPB SQL dump not found: ${file}`); return H.parseSqlDump(fs.readFileSync(file, 'utf8'), TABLES); }

module.exports = {
  async up(queryInterface) {
    const s = dump();
    const t = await queryInterface.sequelize.transaction();
    try {
      const university = await first(queryInterface, "SELECT id FROM universitas WHERE kode_universitas = 'U001' LIMIT 1", {}, t);
      if (!university) throw new Error('Required Universitas Andalas (kode U001) was not found');
      const faculty = await first(queryInterface, "SELECT id FROM fakultas WHERE kode_fakultas = '11' LIMIT 1", {}, t);
      const department = await first(queryInterface, "SELECT id FROM departemen WHERE kode_departemen = '11-2' LIMIT 1", {}, t);
      const degree = await first(queryInterface, "SELECT id FROM jenjang_akademik WHERE UPPER(kode_jenjang) = 'S1' LIMIT 1", {}, t);
      const model = await first(queryInterface, "SELECT id FROM model_kurikulum WHERE LOWER(nama_model) LIKE '%obe%' LIMIT 1", {}, t);
      if (!faculty || !department || !degree || !model) throw new Error('Required faculty 11, department 11-2, S1 degree, or OBE curriculum model was not found');
      const prodiId = await resolveMaster(queryInterface, 'program_studi', 'kode_prodi = :code', { code: '80203' }, { id: ownedId('program_studi', '80203'), kode_prodi: '80203', jenjang_akademik_id: degree.id, model_kurikulum_id: model.id, universitas_id: university.id, fakultas_id: faculty.id, departemen_id: department.id, nama_resmi: 'S1 Teknik Pertanian dan Biosistem', nama_singkat: 'S1 Teknik Pertanian dan Biosistem', ...stamp() }, t);
      const curriculumId = await resolveMaster(queryInterface, 'kurikulum', 'program_studi_id = :prodi AND tahun = 2024 AND nama = :name', { prodi: prodiId, name: 'Kurikulum OBE TPB' }, { id: ownedId('kurikulum', 'obe-tpb'), program_studi_id: prodiId, tahun: 2024, nama: 'Kurikulum OBE TPB', masa_studi_ideal: 8, masa_studi_maksimal: 14, ...stamp() }, t);

      const typeIds = {};
      for (const [key, name, alias, urut] of [['ganjil', 'Ganjil', 'GANJIL', 1], ['genap', 'Genap', 'GENAP', 2]]) typeIds[key] = await resolveMaster(queryInterface, 'jenis_semester', 'LOWER(nama) = :name', { name: key }, { id: ownedId('jenis_semester', key), nama: name, alias, urut, ...stamp() }, t);
      const sourceSemesters = (s.tahun_ajaran || []).filter((r) => typeIds[String(r.periode).toLowerCase()]);
      await insert(queryInterface, 'semester', sourceSemesters.map((r) => ({ id: ownedId('semester', r.id), jenis_semester_id: typeIds[String(r.periode).toLowerCase()], tahun: H.academicYearStart(r.tahun), is_aktif: false, ...stamp(r) })), t);
      const semesterTargets = await select(queryInterface, 'SELECT id, tahun, jenis_semester_id FROM semester WHERE jenis_semester_id IN (:types)', { types: Object.values(typeIds) }, t);
      const semesterMap = actualMap(sourceSemesters, semesterTargets, (r) => `${H.academicYearStart(r.tahun)}:${typeIds[String(r.periode).toLowerCase()]}`, (r) => `${r.tahun}:${r.jenis_semester_id}`);
      await insert(queryInterface, 'semester_prodi', sourceSemesters.filter((r) => semesterMap.has(String(r.id))).map((r) => ({ id: ownedId('semester_prodi', r.id), program_studi_id: prodiId, semester_id: semesterMap.get(String(r.id)), is_aktif: false, sks_default: 15, sks_maksimal: 24, ...stamp(r) })), t);
      const semesterProdiTargets = await select(queryInterface, 'SELECT id, semester_id FROM semester_prodi WHERE program_studi_id = :prodi', { prodi: prodiId }, t);
      const semesterProdiBySemester = new Map(semesterProdiTargets.map((r) => [String(r.semester_id), r.id]));
      const semesterProdiMap = new Map(sourceSemesters.flatMap((r) => semesterMap.has(String(r.id)) && semesterProdiBySemester.has(String(semesterMap.get(String(r.id)))) ? [[String(r.id), semesterProdiBySemester.get(String(semesterMap.get(String(r.id))))]] : []));

      const sourceCourses = s.mata_kuliah || [];
      await insert(queryInterface, 'matakuliah', sourceCourses.map((r) => ({ id: ownedId('matakuliah', r.id), jenis_semester_id: Number(r.semester) % 2 ? typeIds.ganjil : typeIds.genap, kode_matakuliah: String(r.kodeMatkul), nama_resmi: r.namaMatkul, semester_kurikulum: Number(r.semester) || 0, jumlah_sks_kurikulum: Number(r.sks) || 0, program_studi_id: prodiId, ...stamp(r) })), t);
      const courseMap = actualMap(sourceCourses, await select(queryInterface, 'SELECT id, kode_matakuliah FROM matakuliah', {}, t), (r) => r.kodeMatkul, (r) => r.kode_matakuliah);
      await insert(queryInterface, 'matakuliah_kurikulum', sourceCourses.filter((r) => courseMap.has(String(r.id))).map((r) => ({ id: ownedId('matakuliah_kurikulum', `${curriculumId}:${courseMap.get(String(r.id))}`), matakuliah_id: courseMap.get(String(r.id)), kurikulum_id: curriculumId, ...stamp(r) })), t);

      const sourceLecturers = (s.dosen || []).filter((r) => r.nip != null);
      const sourceStudents = (s.mahasiswa || []).filter((r) => r.nim != null);
      await insert(queryInterface, 'dosen', sourceLecturers.map((r) => ({ id: ownedId('dosen', r.id), nip: String(r.nip), program_studi_id: prodiId, nama: r.nama, ...stamp(r) })), t);
      await insert(queryInterface, 'mahasiswa', sourceStudents.map((r) => ({ id: ownedId('mahasiswa', r.id), niu: String(r.nim), nama: r.nama, angkatan: Number(r.tahunMasuk) || 0, program_studi_id: prodiId, ...stamp(r) })), t);
      const lecturerMap = actualMap(sourceLecturers, await select(queryInterface, 'SELECT id, nip FROM dosen', {}, t), (r) => r.nip, (r) => r.nip);
      const studentMap = actualMap(sourceStudents, await select(queryInterface, 'SELECT id, niu FROM mahasiswa', {}, t), (r) => r.nim, (r) => r.niu);

      const sourceUsers = (s.users || []).filter((r) => r.email);
      const requiredRoles = [...new Set(sourceUsers.map((r) => roleName(r.role)))];
      const roleRows = await select(queryInterface, 'SELECT id, name FROM roles WHERE name IN (:names)', { names: requiredRoles }, t);
      const roles = new Map(roleRows.map((r) => [r.name, r.id]));
      const missingRoles = requiredRoles.filter((name) => !roles.has(name));
      if (missingRoles.length) throw new Error(`Required TPB roles not found: ${missingRoles.join(', ')}`);
      const lecturerByUser = by(sourceLecturers, 'userId'); const studentByUser = by(sourceStudents, 'userId');
      const resetHash = await bcrypt.hash('RESET', 10);
      await insert(queryInterface, 'users', sourceUsers.map((r) => ({ id: ownedId('users', r.id), name: r.name, email: r.email, email_verified_at: r.email_verified_at, password: resetHash, role: roleName(r.role), dosen_id: lecturerMap.get(String(lecturerByUser.get(String(r.id))?.id)) || null, mahasiswa_id: studentMap.get(String(studentByUser.get(String(r.id))?.id)) || null, remember_token: null, ...stamp(r) })), t);
      const userMap = actualMap(sourceUsers, await select(queryInterface, 'SELECT id, email FROM users', {}, t), (r) => r.email.toLowerCase(), (r) => r.email.toLowerCase());
      await insert(queryInterface, 'user_roles', sourceUsers.filter((r) => userMap.has(String(r.id))).map((r) => ({ id: ownedId('user_roles', `${userMap.get(String(r.id))}:${roles.get(roleName(r.role))}`), user_id: userMap.get(String(r.id)), role_id: roles.get(roleName(r.role)), ...stamp(r) })), t);

      const cps = s.cpl || [];
      await insert(queryInterface, 'cp', cps.map((r) => ({ id: ownedId('cp', r.id), kurikulum_id: curriculumId, nama_cp: r.kodeCpl, deskripsi: r.deskripsi, nilai_min: Number(r.nilaiMinimal) || 0, nilai_max: 100, ...stamp(r) })), t);
      await insert(queryInterface, 'scp', cps.map((r) => ({ id: ownedId('scp', r.id), cp_id: ownedId('cp', r.id), nama_scp: `SCP ${r.kodeCpl}`, deskripsi: `Sub-capaian sintetis untuk ${r.kodeCpl}`, persen_capai_nilai_min: Number(r.targetPersen) || 0, nilai_min: Number(r.nilaiMinimal) || 0, ...stamp(r) })), t);
      const cpSet = new Set(cps.map((r) => String(r.id))); const fallbackCp = cps[0]?.id;
      const takById = by(s.tahun_ajaran_matkul || []); const cpmkById = by(s.cpmk || []);
      const links = (s.cpmk_mat_kul || []).flatMap((r) => { const tak = takById.get(String(r.tahunAjaranMatkulId)); const cpmk = cpmkById.get(String(r.cpmkId)); const courseId = tak && courseMap.get(String(tak.mataKuliahId)); return tak && cpmk && courseId ? [{ ...r, tak, cpmk, courseId }] : []; });
      const cpmkKey = (sourceId, takId) => `${sourceId}:${takId}`;
      await insert(queryInterface, 'cpmk', links.map((x) => ({ id: ownedId('cpmk', cpmkKey(x.cpmk.id, x.tak.id)), matakuliah_id: x.courseId, nama_cpmk: x.cpmk.kodeCpmk, deskripsi: x.cpmk.deskripsi, parent_cpmk_id: null, ...stamp(x.cpmk) })), t);
      const cpByCpmk = new Map(); for (const r of s.cpmk_cpl || []) if (cpSet.has(String(r.cplId))) (cpByCpmk.get(String(r.cpmkId)) || cpByCpmk.set(String(r.cpmkId), []).get(String(r.cpmkId))).push(r.cplId);
      await insert(queryInterface, 'cpmk_scp', links.flatMap((x) => (cpByCpmk.get(String(x.cpmk.id)) || (fallbackCp == null ? [] : [fallbackCp])).map((cpId) => ({ id: ownedId('cpmk_scp', `${cpmkKey(x.cpmk.id, x.tak.id)}:${cpId}`), cpmk_id: ownedId('cpmk', cpmkKey(x.cpmk.id, x.tak.id)), scp_id: ownedId('scp', cpId), ...stamp(x.cpmk) }))), t);
      const linkByCpmkTak = new Set(links.map((x) => cpmkKey(x.cpmk.id, x.tak.id)));
      for (const relation of s.cpmk_parents || []) for (const child of links.filter((x) => String(x.cpmk.id) === String(relation.child_cpmk_id))) if (linkByCpmkTak.has(cpmkKey(relation.parent_cpmk_id, child.tak.id))) await queryInterface.bulkUpdate('cpmk', { parent_cpmk_id: ownedId('cpmk', cpmkKey(relation.parent_cpmk_id, child.tak.id)) }, { id: ownedId('cpmk', cpmkKey(child.cpmk.id, child.tak.id)) }, { transaction: t });

      const components = by(s.komponen || []);
      const validCpmks = new Set(links.map((x) => cpmkKey(x.cpmk.id, x.tak.id)));
      const weights = (s.bobot || []).filter((r) => validCpmks.has(cpmkKey(r.cpmkId, r.tahunAjaranMatkulId)) && components.has(String(r.komponenId)));
      await insert(queryInterface, 'sumber_penilaian', weights.map((r) => ({ id: ownedId('sumber_penilaian', r.id), cpmk_id: ownedId('cpmk', cpmkKey(r.cpmkId, r.tahunAjaranMatkulId)), nama_sumber_penilaian: components.get(String(r.komponenId)).nama, bobot: Number(r.bobot) || 0, ...stamp(r) })), t);
      const sourceAssessmentMap = actualMap(weights, await select(queryInterface, 'SELECT id FROM sumber_penilaian WHERE id IN (:ids)', { ids: weights.map((r) => ownedId('sumber_penilaian', r.id)) || [''] }, t), (r) => ownedId('sumber_penilaian', r.id), (r) => r.id);

      const sourceClasses = (s.kelas || []).flatMap((r) => { const tak = takById.get(String(r.tahunAjaranMatkulId)); const courseId = tak && courseMap.get(String(tak.mataKuliahId)); const semesterProdiId = tak && semesterProdiMap.get(String(tak.tahunAjaranId)); return tak && courseId && semesterProdiId ? [{ ...r, tak, courseId, semesterProdiId }] : []; });
      await insert(queryInterface, 'kelas', sourceClasses.map((r) => ({ id: ownedId('kelas', r.id), semester_prodi_id: r.semesterProdiId, matakuliah_id: r.courseId, nama: String(r.namaKelas).slice(0, 10), jumlah_peserta_min: 0, jumlah_peserta_max: 0, ...stamp(r) })), t);
      const classTargets = await select(queryInterface, 'SELECT id, semester_prodi_id, matakuliah_id, nama FROM kelas WHERE semester_prodi_id IN (:semesters)', { semesters: [...new Set(sourceClasses.map((r) => r.semesterProdiId))] }, t);
      const classMap = actualMap(sourceClasses, classTargets, (r) => `${r.semesterProdiId}:${r.courseId}:${String(r.namaKelas).slice(0, 10)}`, (r) => `${r.semester_prodi_id}:${r.matakuliah_id}:${r.nama}`);
      const sourceAssignments = (s.dosen_pengampu_kelas || []).filter((r) => lecturerMap.has(String(r.dosenId)) && classMap.has(String(r.kelasId)));
      await insert(queryInterface, 'dosen_kelas', sourceAssignments.map((r) => ({ id: ownedId('dosen_kelas', r.id), dosen_id: lecturerMap.get(String(r.dosenId)), kelas_id: classMap.get(String(r.kelasId)), dosen_ke: 1, ...stamp(r) })), t);

      const classSourceById = by(sourceClasses); const enrollments = (s.kelas_mahasiswa || []).filter((r) => studentMap.has(String(r.mahasiswaId)) && classMap.has(String(r.kelasId)));
      const krsData = new Map(); for (const e of enrollments) { const cls = classSourceById.get(String(e.kelasId)); const key = `${studentMap.get(String(e.mahasiswaId))}:${cls.semesterProdiId}`; if (!krsData.has(key)) krsData.set(key, { key, studentId: studentMap.get(String(e.mahasiswaId)), semesterProdiId: cls.semesterProdiId, source: e }); }
      await insert(queryInterface, 'krs', [...krsData.values()].map((r) => ({ id: ownedId('krs', r.key), mahasiswa_id: r.studentId, semester_prodi_id: r.semesterProdiId, approval_ke: 1, ...stamp(r.source) })), t);
      const detailMap = new Map(); const details = enrollments.map((e) => { const cls = classSourceById.get(String(e.kelasId)); const key = `${studentMap.get(String(e.mahasiswaId))}:${cls.semesterProdiId}`; const detailId = ownedId('krs_detil', e.id); detailMap.set(`${e.mahasiswaId}:${e.kelasId}`, detailId); return { id: detailId, krs_id: ownedId('krs', key), kelas_id: classMap.get(String(e.kelasId)), approved: '1', ...stamp(e) }; });
      await insert(queryInterface, 'krs_detil', details, t);
      const assignmentById = by(sourceAssignments);
      const grades = H.aggregateGrades(s.nilai || [], (r) => { const assignment = assignmentById.get(String(r.dosenPengampuKelasId)); const detailId = assignment && detailMap.get(`${r.mahasiswaId}:${assignment.kelasId}`); const assessmentId = sourceAssessmentMap.get(String(r.bobotId)); return detailId && assessmentId && `${detailId}:${assessmentId}`; });
      await insert(queryInterface, 'nilai_mahasiswa', grades.flatMap((r) => { const assignment = assignmentById.get(String(r.dosenPengampuKelasId)); const detailId = assignment && detailMap.get(`${r.mahasiswaId}:${assignment.kelasId}`); const assessmentId = sourceAssessmentMap.get(String(r.bobotId)); return detailId && assessmentId ? [{ id: ownedId('nilai_mahasiswa', `${detailId}:${assessmentId}`), krs_detil_id: detailId, sumber_penilaian_id: assessmentId, nilai: Number(r.nilai), catatan: 'Rata-rata deterministik bila sumber mengandung duplikat', ...stamp(r) }] : []; }), t);
      await t.commit();
    } catch (error) { await t.rollback(); throw error; }
  },

  async down(queryInterface) {
    const s = dump(); const t = await queryInterface.sequelize.transaction();
    try {
      const owned = (table, sourceIds) => sourceIds.map((value) => ownedId(table, value));
      const takById = by(s.tahun_ajaran_matkul || []);
      const cpmkKeys = (s.cpmk_mat_kul || []).map((r) => `${r.cpmkId}:${r.tahunAjaranMatkulId}`);
      const specifications = [
        ['nilai_mahasiswa', []], ['krs_detil', owned('krs_detil', (s.kelas_mahasiswa || []).map((r) => r.id))], ['krs', []],
        ['dosen_kelas', owned('dosen_kelas', (s.dosen_pengampu_kelas || []).map((r) => r.id))], ['kelas', owned('kelas', (s.kelas || []).map((r) => r.id))],
        ['sumber_penilaian', owned('sumber_penilaian', (s.bobot || []).map((r) => r.id))], ['cpmk_scp', []], ['cpmk', owned('cpmk', cpmkKeys)],
        ['scp', owned('scp', (s.cpl || []).map((r) => r.id))], ['cp', owned('cp', (s.cpl || []).map((r) => r.id))],
        ['matakuliah_kurikulum', []], ['matakuliah', owned('matakuliah', (s.mata_kuliah || []).map((r) => r.id))],
        ['user_roles', []], ['users', owned('users', (s.users || []).map((r) => r.id))], ['mahasiswa', owned('mahasiswa', (s.mahasiswa || []).map((r) => r.id))], ['dosen', owned('dosen', (s.dosen || []).map((r) => r.id))],
        ['semester_prodi', owned('semester_prodi', (s.tahun_ajaran || []).map((r) => r.id))], ['semester', owned('semester', (s.tahun_ajaran || []).map((r) => r.id))], ['kurikulum', [ownedId('kurikulum', 'obe-tpb')]], ['program_studi', [ownedId('program_studi', '80203')]],
      ];
      const deterministicCleanup = {
        nilai_mahasiswa: await select(queryInterface, "SELECT id FROM nilai_mahasiswa WHERE catatan = 'Rata-rata deterministik bila sumber mengandung duplikat'", {}, t).then((rows) => rows.map((r) => r.id)),
        krs: await select(queryInterface, 'SELECT id FROM krs WHERE id IN (SELECT DISTINCT krs_id FROM krs_detil WHERE id IN (:ids))', { ids: owned('krs_detil', (s.kelas_mahasiswa || []).map((r) => r.id)) || [''] }, t).then((rows) => rows.map((r) => r.id)),
        cpmk_scp: await select(queryInterface, 'SELECT id FROM cpmk_scp WHERE cpmk_id IN (:ids)', { ids: owned('cpmk', cpmkKeys) || [''] }, t).then((rows) => rows.map((r) => r.id)),
        matakuliah_kurikulum: await select(queryInterface, 'SELECT id FROM matakuliah_kurikulum WHERE kurikulum_id = :id', { id: ownedId('kurikulum', 'obe-tpb') }, t).then((rows) => rows.map((r) => r.id)),
        user_roles: await select(queryInterface, 'SELECT id FROM user_roles WHERE id IN (:ids)', { ids: (s.users || []).flatMap((u) => ['admin-prodi', 'pimpinan-prodi', 'dosen', 'mahasiswa'].map((role) => ownedId('user_roles', `${ownedId('users', u.id)}:${role}`))) }, t).then((rows) => rows.map((r) => r.id)),
      };
      for (const [table, defaults] of specifications) for (const part of chunk(deterministicCleanup[table] || defaults)) if (part.length) await queryInterface.bulkDelete(table, { id: part }, { transaction: t });
      await t.commit();
    } catch (error) { await t.rollback(); throw error; }
  },
};
