import { useCallback, useMemo, useState } from "react";
import { useFilterOptions } from "./useFilterOptions";
import { useOrgScope } from "./useOrgScope";
import { useOrgContext } from "./useOrgContext";
import {
  academicScopeLock,
  applyAcademicField,
  buildAcademicFilterFields,
  cascadeAcademicOptions,
  isAcademicDraftReady,
  toAcademicExtraFilter,
} from "../helpers/academicFilter";

const DEFAULT_KEYS = ["fakultas", "departemen", "prodi", "kurikulum"];
const GLOBAL_KEYS = new Set(["fakultas", "departemen", "prodi"]);
const LOCAL_STATE_KEYS = { kurikulum: "kurikulumId", semester: "semesterId" };

const pickGlobal = (value = {}) => ({
  fakultasId: value.fakultasId || "",
  departemenId: value.departemenId || "",
  prodiId: value.prodiId || "",
});

export const useAcademicFilter = ({
  keys = DEFAULT_KEYS,
  scope: scopeOverride,
  defaultSemesterToActive = false,
} = {}) => {
  const raw = useFilterOptions();
  const ownScope = useOrgScope();
  const scope = scopeOverride || ownScope;
  const org = useOrgContext();
  const scoped = Boolean(scope?.level && scope.level !== "universitas");
  const localKeys = keys.filter((key) => !GLOBAL_KEYS.has(key));
  const localKeySignature = localKeys.join("|");
  const keysSignature = keys.join("|");
  const lockedGlobal = academicScopeLock(scope);
  const global = {
    ...pickGlobal(org),
    ...Object.fromEntries(
      Object.entries(lockedGlobal).filter(([, value]) => value),
    ),
  };

  const semesterConfigurable =
    defaultSemesterToActive && localKeys.includes("semester");
  const activeSemesterId = semesterConfigurable
    ? raw.semesterRows?.find((row) => row.is_aktif)?.id || ""
    : "";
  const defaultLocal = useMemo(() => {
    const base = Object.fromEntries(
      localKeys
        .map((key) => [LOCAL_STATE_KEYS[key], ""])
        .filter(([key]) => key),
    );
    if (semesterConfigurable && global.prodiId && activeSemesterId) {
      base.semesterId = activeSemesterId;
    }
    return base;
  }, [
    localKeys,
    global.prodiId,
    activeSemesterId,
    semesterConfigurable,
  ]);

  const [draftLocal, setDraftLocal] = useState(() => ({ ...defaultLocal }));
  const [appliedLocal, setAppliedLocal] = useState(() => ({ ...defaultLocal }));
  const draft = { ...global, ...draftLocal };
  const applied = { ...global, ...appliedLocal };

  // Re-seed filter lokal bila acuan global atau default semester berubah
  // (pola resmi React: adjust state during render).
  const orgKey = `${global.fakultasId}|${global.departemenId}|${global.prodiId}`;
  const defaultLocalKey = `${orgKey}|${defaultLocal.kurikulumId || ""}|${defaultLocal.semesterId || ""}`;
  const [prevLocalKey, setPrevLocalKey] = useState(defaultLocalKey);
  if (prevLocalKey !== defaultLocalKey) {
    setPrevLocalKey(defaultLocalKey);
    setDraftLocal({ ...defaultLocal });
    setAppliedLocal({ ...defaultLocal });
  }

  const options = useMemo(
    () =>
      // draft dibuat ulang tiap render (spread global+draftLocal), jadi deps memakai
      // field-fieldnya — menyertakan draft justru mengalahkan memoization.
      cascadeAcademicOptions(
        {
          fakultas: raw.fakultasRows,
          departemen: raw.departemenRows,
          prodi: raw.prodiRows,
          kurikulum: raw.kurikulumRows,
          semester: raw.semesterRows,
        },
        draft,
        scope,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draft identity tidak stabil
    [
      raw.fakultasRows,
      raw.departemenRows,
      raw.prodiRows,
      raw.kurikulumRows,
      raw.semesterRows,
      draft.fakultasId,
      draft.departemenId,
      draft.prodiId,
      draft.kurikulumId,
      draft.semesterId,
      scope,
    ],
  );

  const setField = useCallback(
    (key, value) => {
      // global/org dibangun ulang tiap render; field-fieldnya sudah ada di deps.
      if (
        GLOBAL_KEYS.has(
          keys.find(
            (name) =>
              ({
                fakultas: "fakultasId",
                departemen: "departemenId",
                prodi: "prodiId",
              })[name] === key,
          ),
        )
      ) {
        org.setContext(pickGlobal(applyAcademicField(global, key, value)));
        return;
      }
      setDraftLocal((prev) => {
        const next = applyAcademicField({ ...global, ...prev }, key, value);
        return { kurikulumId: next.kurikulumId, semesterId: next.semesterId };
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- global/org identity tidak stabil
    [
      global.fakultasId,
      global.departemenId,
      global.prodiId,
      keys,
      org.setContext,
    ],
  );

  const fields = useMemo(
    () =>
      // sama seperti options: draft dibangun ulang tiap render.
      buildAcademicFilterFields({
        keys: localKeys,
        draft,
        options,
        onChange: setField,
        scope,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draft identity tidak stabil
    [
      localKeySignature,
      draft.kurikulumId,
      draft.semesterId,
      draft.prodiId,
      options,
      setField,
      scope,
    ],
  );

  const extraFilter = useMemo(() => {
    // applied dibangun ulang tiap render; keysSignature mewakili keys.
    const base = toAcademicExtraFilter(applied, keys);
    if (base) return base;
    return scoped ? {} : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applied identity tidak stabil
  }, [
    applied.fakultasId,
    applied.departemenId,
    applied.prodiId,
    applied.kurikulumId,
    applied.semesterId,
    keysSignature,
    scoped,
  ]);

  return {
    draft,
    applied,
    fields,
    extraFilter,
    locked: extraFilter !== undefined,
    scope,
    canApply: isAcademicDraftReady(draft) || scoped,
    apply: () => setAppliedLocal({ ...draftLocal }),
    reset: () => {
      setDraftLocal({ ...defaultLocal });
      setAppliedLocal({ ...defaultLocal });
    },
  };
};
