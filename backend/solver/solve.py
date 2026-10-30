"""CP-SAT worker. JSON stdin/stdout; no database credentials enter this process."""
import json
import sys
import time
from pathlib import Path

# Optional workspace-local install, also supports a normal virtual environment.
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / '.python-deps'))
try:
    from ortools.sat.python import cp_model
except ImportError:
    cp_model = None


def minutes(value):
    h, m = map(int, value[:5].split(':'))
    return h * 60 + m


def compactness(model, problem, choices):
    buckets = {}
    for i, session in enumerate(problem['sessions']):
        for j, c in enumerate(session['candidates']):
            keys = ['d:' + d for d in c.get('lecturers', [])] + ['g:' + g for g in c.get('groups', [])]
            weeks = [1, 2] if c['frekuensi'] == 'Mingguan' else [1] if c['frekuensi'] == 'Ganjil' else [2]
            for resource in keys:
                for week in weeks:
                    buckets.setdefault((resource, week, c['hari']), []).append((choices[i][j], c))
    gaps = []
    movement = []
    loads = {}
    for key, rows in buckets.items():
        starts, ends = [], []
        for x, c in rows:
            start = model.new_int_var(0, 1440, '')
            end = model.new_int_var(0, 1440, '')
            model.add(start == minutes(c['jam_mulai'])).only_enforce_if(x)
            model.add(start == 1440).only_enforce_if(x.Not())
            model.add(end == minutes(c['jam_selesai'])).only_enforce_if(x)
            model.add(end == 0).only_enforce_if(x.Not())
            starts.append(start)
            ends.append(end)
        first = model.new_int_var(0, 1440, '')
        last = model.new_int_var(0, 1440, '')
        span = model.new_int_var(0, 1440, '')
        model.add_min_equality(first, starts)
        model.add_max_equality(last, ends)
        model.add_max_equality(span, [0, last - first])
        load = sum(x * (minutes(c['jam_selesai']) - minutes(c['jam_mulai'])) for x, c in rows)
        gaps.append(span - load)
        loads[key] = load
        by_building = {}
        for x, c in rows:
            by_building.setdefault(c['gedung_id'], []).append(x)
        visits = []
        for variables in by_building.values():
            used = model.new_bool_var('')
            model.add_max_equality(used, variables)
            visits.append(used)
        active = model.new_bool_var('')
        model.add_max_equality(active, [x for x, _ in rows])
        movement.append(sum(visits) - active)
    balances = []
    for resource, week in {(k[0], k[1]) for k in loads}:
        daily = [loads.get((resource, week, day), 0) for day in ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']]
        high = model.new_int_var(0, 1440, '')
        low = model.new_int_var(0, 1440, '')
        model.add_max_equality(high, daily)
        model.add_min_equality(low, daily)
        balances.append(high - low)
    return sum(gaps) + sum(balances) + problem.get('movement_penalty_minutes', 30) * sum(movement)


def compute_compactness_value(problem, chosen):
    buckets = {}
    all_keys = set()
    for c in chosen:
        keys = ['d:' + d for d in c.get('lecturers', [])] + ['g:' + g for g in c.get('groups', [])]
        weeks = [1, 2] if c['frekuensi'] == 'Mingguan' else [1] if c['frekuensi'] == 'Ganjil' else [2]
        for resource in keys:
            for week in weeks:
                all_keys.add((resource, week))
                buckets.setdefault((resource, week, c['hari']), []).append(c)
    gaps = 0
    movement = 0
    loads = {}
    for key, rows in buckets.items():
        first = min(minutes(c['jam_mulai']) for c in rows)
        last = max(minutes(c['jam_selesai']) for c in rows)
        span = max(0, last - first)
        load = sum(minutes(c['jam_selesai']) - minutes(c['jam_mulai']) for c in rows)
        gaps += span - load
        loads[key] = load
        buildings = {c['gedung_id'] for c in rows}
        movement += len(buildings) - 1
    balances = 0
    days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
    for resource, week in all_keys:
        daily = [loads.get((resource, week, day), 0) for day in days]
        balances += max(daily) - min(daily)
    return gaps + balances + problem.get('movement_penalty_minutes', 30) * movement


def solve_pure_python(problem, started):
    empty = [s['id'] for s in problem['sessions'] if not s['candidates']]
    if empty:
        return {
            'status': 'INFEASIBLE',
            'assignments': [],
            'diagnosis': [{'session_id': s, 'verified': True, 'reason': 'Tidak ada kandidat yang memenuhi aturan wajib'} for s in empty],
        }
    n = len(problem['sessions'])
    adj = [[set() for _ in s['candidates']] for s in problem['sessions']]
    for i, a, j, b in problem['conflicts']:
        adj[i][a].add((j, b))
        adj[j][b].add((i, a))

    deadline = started + problem['max_seconds']

    def search_phase(main_only, locked_objs, target_obj_idx, initial_best_Pick=None):
        domains = []
        for i, s in enumerate(problem['sessions']):
            dom = [
                j for j, c in enumerate(s['candidates'])
                if (not main_only or c['costs'][0] == 0)
            ]
            # Sort candidates by cost tuple so good solutions are found immediately
            dom.sort(key=lambda j: tuple(s['candidates'][j]['costs']))
            domains.append(dom)
        if any(not d for d in domains):
            return 'INFEASIBLE', None, None

        best_pick = initial_best_Pick
        best_val = None
        if best_pick is not None and target_obj_idx is not None:
            if target_obj_idx < 5:
                best_val = sum(problem['sessions'][i]['candidates'][best_pick[i]]['costs'][target_obj_idx] for i in range(n))
            else:
                best_val = compute_compactness_value(problem, [problem['sessions'][i]['candidates'][best_pick[i]] for i in range(n)])

        timed_out = False
        picked = [None] * n
        cur_costs = [0] * 5

        def dfs(depth, avail):
            nonlocal best_pick, best_val, timed_out
            if time.monotonic() >= deadline:
                timed_out = True
                return
            for k, req_val in enumerate(locked_objs):
                if cur_costs[k] > req_val:
                    return
            if target_obj_idx is not None and target_obj_idx < 5 and best_val is not None:
                if cur_costs[target_obj_idx] >= best_val:
                    return
            if depth == n:
                for k, req_val in enumerate(locked_objs):
                    if cur_costs[k] != req_val:
                        return
                if target_obj_idx is None:
                    best_pick = list(picked)
                    best_val = 0
                    return
                if target_obj_idx < 5:
                    val = cur_costs[target_obj_idx]
                else:
                    val = compute_compactness_value(problem, [problem['sessions'][i]['candidates'][picked[i]] for i in range(n)])
                if best_val is None or val < best_val:
                    best_val = val
                    best_pick = list(picked)
                return

            # MRV variable ordering
            unassigned = [i for i in range(n) if picked[i] is None]
            var = min(unassigned, key=lambda i: len(avail[i]))
            if not avail[var]:
                return

            for cand_idx in avail[var]:
                if timed_out:
                    return
                if target_obj_idx is None and best_pick is not None:
                    return
                if target_obj_idx is not None and best_val == 0:
                    return
                c_costs = problem['sessions'][var]['candidates'][cand_idx]['costs']
                valid_partial = True
                for k, req_val in enumerate(locked_objs):
                    if cur_costs[k] + c_costs[k] > req_val:
                        valid_partial = False
                        break
                if not valid_partial:
                    continue
                if target_obj_idx is not None and target_obj_idx < 5 and best_val is not None:
                    if cur_costs[target_obj_idx] + c_costs[target_obj_idx] >= best_val:
                        continue

                forb = adj[var][cand_idx]
                next_avail = list(avail)
                possible = True
                for u in unassigned:
                    if u == var:
                        continue
                    if forb:
                        filtered = [c for c in avail[u] if (u, c) not in forb]
                        if not filtered:
                            possible = False
                            break
                        next_avail[u] = filtered
                if not possible:
                    continue

                picked[var] = cand_idx
                for k in range(5):
                    cur_costs[k] += c_costs[k]
                dfs(depth + 1, next_avail)
                for k in range(5):
                    cur_costs[k] -= c_costs[k]
                picked[var] = None

        dfs(0, domains)
        if best_pick is not None:
            return ('FEASIBLE' if timed_out else 'OPTIMAL'), best_pick, best_val
        return ('UNKNOWN' if timed_out else 'INFEASIBLE'), None, None

    phases = []
    status, best_pick, _ = search_phase(True, [], None)
    if status == 'INFEASIBLE':
        phases.append({'phase': 'main_only', 'status': 'INFEASIBLE'})
        main_only = False
        status, best_pick, _ = search_phase(False, [], None)
    elif status in ('OPTIMAL', 'FEASIBLE'):
        main_only = True
    else:
        return {
            'status': status,
            'assignments': [],
            'phases': [{'phase': 'main_only', 'status': status}],
            'elapsed_seconds': time.monotonic() - started,
        }

    if best_pick is None:
        final_status = status
        return {
            'status': final_status,
            'assignments': [],
            'phases': phases,
            'elapsed_seconds': time.monotonic() - started,
            'diagnosis': [{
                'verified': final_status == 'INFEASIBLE',
                'reason': 'Kombinasi batasan tidak memiliki solusi' if final_status == 'INFEASIBLE' else 'Pencarian berakhir tanpa kesimpulan; tambah waktu atau persempit cakupan',
            }],
        }

    locked_objs = []
    final_status = 'FEASIBLE'
    for k in range(6):
        if time.monotonic() >= deadline:
            break
        p_status, next_pick, next_val = search_phase(main_only, locked_objs, k, best_pick)
        phases.append({'phase': k, 'status': p_status})
        if p_status not in ('OPTIMAL', 'FEASIBLE'):
            break
        best_pick = next_pick
        final_status = 'OPTIMAL' if p_status == 'OPTIMAL' and k == 5 else 'FEASIBLE'
        if p_status != 'OPTIMAL':
            break
        if k < 5:
            locked_objs.append(next_val)

    fields = ['session_id', 'ruang_id', 'hari', 'jam_mulai', 'jam_selesai', 'frekuensi']
    best = [problem['sessions'][i]['candidates'][best_pick[i]] for i in range(n)]
    assignments = [{key: c[key] for key in fields} for c in best]
    return {
        'status': final_status,
        'assignments': assignments,
        'phases': phases,
        'elapsed_seconds': time.monotonic() - started,
        'diagnosis': [],
    }


def solve(problem):
    started = time.monotonic()
    if cp_model is None:
        return solve_pure_python(problem, started)
    model = cp_model.CpModel()
    choices = []
    empty = []
    for session in problem['sessions']:
        row = [model.new_bool_var('') for _ in session['candidates']]
        if not row:
            empty.append(session['id'])
        else:
            model.add_exactly_one(row)
        choices.append(row)
        for j, c in enumerate(session['candidates']):
            if c['costs'][1] == 0:
                model.add_hint(row[j], 1)
    if empty:
        return {'status': 'INFEASIBLE', 'assignments': [], 'diagnosis': [{'session_id': s, 'verified': True, 'reason': 'Tidak ada kandidat yang memenuhi aturan wajib'} for s in empty]}
    for i, a, j, b in problem['conflicts']:
        model.add(choices[i][a] + choices[j][b] <= 1)
    objectives = [sum(choices[i][j] * c['costs'][k] for i, s in enumerate(problem['sessions']) for j, c in enumerate(s['candidates'])) for k in range(5)]
    objectives.append(compactness(model, problem, choices))
    solver = cp_model.CpSolver()
    solver.parameters.num_search_workers = 1
    solver.parameters.random_seed = 1
    deadline = started + problem['max_seconds']
    main_only = model.new_bool_var('main_buildings_only')
    model.add(objectives[0] == 0).only_enforce_if(main_only)
    model.add_assumption(main_only)
    solver.parameters.max_time_in_seconds = max(0.001, deadline - time.monotonic())
    status = solver.solve(model)
    phases = []
    if status == cp_model.INFEASIBLE:
        phases.append({'phase': 'main_only', 'status': 'INFEASIBLE'})
        model.clear_assumptions()
        model.add(main_only == 0)
    elif status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        model.clear_assumptions()
        model.add(main_only == 1)
    else:
        return {'status': solver.status_name(status), 'assignments': [], 'phases': [{'phase': 'main_only', 'status': solver.status_name(status)}], 'elapsed_seconds': time.monotonic() - started}
    best = None
    final_status = 'UNKNOWN'
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        best = [next(c for j, c in enumerate(s['candidates']) if solver.value(choices[i][j])) for i, s in enumerate(problem['sessions'])]
        final_status = 'FEASIBLE'
    for k, objective in enumerate(objectives):
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            break
        model.minimize(objective)
        solver.parameters.max_time_in_seconds = remaining
        status = solver.solve(model)
        phases.append({'phase': k, 'status': solver.status_name(status)})
        if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            if best is None:
                final_status = solver.status_name(status)
            break
        best = [next(c for j, c in enumerate(s['candidates']) if solver.value(choices[i][j])) for i, s in enumerate(problem['sessions'])]
        final_status = 'OPTIMAL' if status == cp_model.OPTIMAL and k == len(objectives)-1 else 'FEASIBLE'
        if status != cp_model.OPTIMAL:
            break  # Never trade a higher priority for an unproven lower optimum.
        model.add(objective == round(solver.objective_value))
    if best is None and status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        best = [next(c for j, c in enumerate(s['candidates']) if solver.value(choices[i][j])) for i, s in enumerate(problem['sessions'])]
        final_status = 'FEASIBLE'
    fields = ['session_id', 'ruang_id', 'hari', 'jam_mulai', 'jam_selesai', 'frekuensi']
    assignments = [{key: c[key] for key in fields} for c in (best or [])]
    return {'status': final_status, 'assignments': assignments, 'phases': phases, 'elapsed_seconds': time.monotonic()-started,
            'diagnosis': [] if best else [{'verified': final_status == 'INFEASIBLE', 'reason': 'Kombinasi batasan tidak memiliki solusi' if final_status == 'INFEASIBLE' else 'Pencarian berakhir tanpa kesimpulan; tambah waktu atau persempit cakupan'}]}


if __name__ == '__main__':
    try:
        result = solve(json.load(sys.stdin))
        try:
            if sys.platform == 'win32':
                import ctypes
                from ctypes import wintypes
                class Counters(ctypes.Structure):
                    _fields_ = [('cb', wintypes.DWORD), ('PageFaultCount', wintypes.DWORD)] + [(n, ctypes.c_size_t) for n in ['PeakWorkingSetSize', 'WorkingSetSize', 'QuotaPeakPagedPoolUsage', 'QuotaPagedPoolUsage', 'QuotaPeakNonPagedPoolUsage', 'QuotaNonPagedPoolUsage', 'PagefileUsage', 'PeakPagefileUsage']]
                counters = Counters()
                counters.cb = ctypes.sizeof(counters)
                ctypes.windll.kernel32.GetCurrentProcess.restype = wintypes.HANDLE
                ctypes.windll.psapi.GetProcessMemoryInfo.argtypes = [wintypes.HANDLE, ctypes.POINTER(Counters), wintypes.DWORD]
                if ctypes.windll.psapi.GetProcessMemoryInfo(ctypes.windll.kernel32.GetCurrentProcess(), ctypes.byref(counters), counters.cb):
                    result['peak_rss_bytes'] = counters.PeakWorkingSetSize
            else:
                import resource
                result['peak_rss_bytes'] = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss * (1 if sys.platform == 'darwin' else 1024)
        except (ImportError, AttributeError, OSError):
            result['peak_rss_bytes'] = None
        print(json.dumps(result))
    except Exception as exc:
        print(json.dumps({'status': 'ERROR', 'error': str(exc)}))
        sys.exit(1)
