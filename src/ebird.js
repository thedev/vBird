/**
 * Generates an eBird-compliant CSV string from an array of observations.
 *
 * eBird Record Format headers (POC subset):
 * Common Name, Count, Location, Date, Start Time, Protocol, Duration, Distance
 */

const EBIRD_HEADERS = [
  'Common Name',
  'Count',
  'Location',
  'Date',
  'Start Time',
  'Protocol',
  'Duration (mins)',
  'Distance (km)',
];

const DEFAULT_LOCATION = 'My Location (47.6062,-122.3321)';
const DEFAULT_PROTOCOL = 'Incidental';
const DEFAULT_DURATION = '5';
const DEFAULT_DISTANCE = '0';

function escapeCSV(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDate(isoString) {
  const d = new Date(isoString);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function formatTime(isoString) {
  const d = new Date(isoString);
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${min}`;
}

/**
 * @param {Array<{ species: string, count: number, createdAt: string }>} observations
 * @param {Object} [options]
 * @param {string} [options.location]
 * @param {string} [options.startTime]  ISO string for the session start
 * @returns {string} CSV content
 */
export function generateEBirdCSV(observations, options = {}) {
  const {
    location = DEFAULT_LOCATION,
    startTime = observations[0]?.createdAt ?? new Date().toISOString(),
  } = options;

  const rows = [EBIRD_HEADERS.map(escapeCSV).join(',')];

  for (const obs of observations) {
    const row = [
      escapeCSV(obs.species),
      escapeCSV(obs.count),
      escapeCSV(location),
      escapeCSV(formatDate(obs.createdAt ?? startTime)),
      escapeCSV(formatTime(obs.createdAt ?? startTime)),
      escapeCSV(DEFAULT_PROTOCOL),
      escapeCSV(DEFAULT_DURATION),
      escapeCSV(DEFAULT_DISTANCE),
    ];
    rows.push(row.join(','));
  }

  return rows.join('\r\n');
}

/**
 * Triggers a browser download of the CSV file.
 */
export function downloadCSV(observations) {
  const csv = generateEBirdCSV(observations);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  a.href = url;
  a.download = `vbird-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
