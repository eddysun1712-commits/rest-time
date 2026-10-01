const number = (value) => typeof value === 'number' && Number.isFinite(value);
function score(value) {
  if (value == null) return null;
  if (!number(value) || value < 0 || value > 100) throw new Error('Index must be a number between 0 and 100.');
  return value;
}
function source(result) {
  if (!result || result.valid !== true) return null;
  const q = result.quality_score ?? result.signal_quality;
  if (q !== undefined && (!number(q) || q <= 0 || q > 1)) return null;
  return score(result.need_rest_probability_percent ?? result.probability_percent);
}
export function normalizeRecord(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Each window must be an object.');
  const c = input.camera_result ?? input.sources?.camera;
  const p = input.physiology_result ?? input.sources?.physiology;
  for (const key of ['session_id', 'window_start_utc', 'window_end_utc']) {
    const values = [input[key], c?.[key], p?.[key]].filter(v => v !== undefined && v !== null && v !== '');
    if (new Set(values).size > 1) throw new Error(`Mismatched ${key}.`);
  }
  const rawTime = input.timestamp ?? input.window_end_utc ?? c?.window_end_utc ?? p?.window_end_utc;
  // Require an explicit timezone so imports do not shift with browser settings.
  if (typeof rawTime !== 'string' || !/(Z|[+-]\d{2}:?\d{2})$/i.test(rawTime) || !Number.isFinite(Date.parse(rawTime))) throw new Error('Use an ISO timestamp with a timezone.');
  let camera, wrist;
  if (Object.hasOwn(input, 'camera_index') || Object.hasOwn(input, 'wrist_index')) {
    camera = score(input.camera_index); wrist = score(input.wrist_index);
  } else {
    camera = source(c); wrist = source(p);
    if (input.module === 'camera') camera = source(input);
    if (input.module === 'physiology') wrist = source(input);
  }
  return { timestamp: new Date(rawTime).toISOString(), camera_index: camera, wrist_index: wrist };
}
export function normalizeBatch(payload) {
  const raw = Array.isArray(payload) ? payload : Array.isArray(payload?.samples) ? payload.samples : [payload];
  if (!raw.length || raw.length > 10_000) throw new Error('Import between 1 and 10,000 windows.');
  return raw.map(normalizeRecord).sort((a,b) => Date.parse(a.timestamp)-Date.parse(b.timestamp));
}
export function mergeSamples(existing, incoming) {
  const byTime = new Map(existing.map(row => [row.timestamp, row]));
  for (const row of incoming) {
    const old = byTime.get(row.timestamp);
    byTime.set(row.timestamp, { ...row, camera_index: row.camera_index ?? old?.camera_index ?? null, wrist_index: row.wrist_index ?? old?.wrist_index ?? null });
  }
  return [...byTime.values()].sort((a,b)=>Date.parse(a.timestamp)-Date.parse(b.timestamp)).slice(-1440);
}
