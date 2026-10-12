"""CP-SAT worker. JSON stdin/stdout; no database credentials enter this process."""
import json
import sys
import time
from pathlib import Path

# Optional workspace-local install, also supports a normal virtual environment.
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / '.python-deps'))
from ortools.sat.python import cp_model


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


def solve(problem):
    started = time.monotonic()
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
