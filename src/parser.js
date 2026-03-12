// Maps spoken/written number words to integers
const NUMBER_WORDS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  'twenty-one': 21, 'twenty one': 21,
  'twenty-two': 22, 'twenty two': 22,
  'twenty-three': 23, 'twenty three': 23,
  'twenty-four': 24, 'twenty four': 24,
  'twenty-five': 25, 'twenty five': 25,
  'twenty-six': 26, 'twenty six': 26,
  'twenty-seven': 27, 'twenty seven': 27,
  'twenty-eight': 28, 'twenty eight': 28,
  'twenty-nine': 29, 'twenty nine': 29,
  thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  hundred: 100, thousand: 1000,
  a: 1, an: 1, couple: 2, few: 3, several: 5, dozen: 12,
  half: 0.5,
};

// Build a sorted lookup for greedy matching (longest first)
const NUMBER_WORD_KEYS = Object.keys(NUMBER_WORDS).sort(
  (a, b) => b.length - a.length
);

/**
 * Attempts to parse a leading number (word or digit) from the start of a string.
 * Returns { count: number, remainder: string } or null if no number found.
 */
function parseLeadingNumber(text) {
  const trimmed = text.trim();

  // Try digit first
  const digitMatch = trimmed.match(/^(\d+)\s*(.*)/s);
  if (digitMatch) {
    return { count: parseInt(digitMatch[1], 10), remainder: digitMatch[2].trim() };
  }

  // Try number words (greedy – longest match first)
  const lower = trimmed.toLowerCase();
  for (const word of NUMBER_WORD_KEYS) {
    if (lower.startsWith(word)) {
      const after = lower.slice(word.length);
      // Must be followed by whitespace or end-of-string
      if (after === '' || /^\s/.test(after)) {
        return { count: NUMBER_WORDS[word], remainder: trimmed.slice(word.length).trim() };
      }
    }
  }

  return null;
}

let speciesCache = null;

/**
 * Loads the species list from the public JSON file.
 * Cached after first load.
 */
export async function loadSpecies() {
  if (speciesCache) return speciesCache;
  const base = import.meta.env.BASE_URL || '/';
  const res = await fetch(`${base}ebird-species.json`);
  speciesCache = await res.json();
  return speciesCache;
}

/**
 * Matches a species name string against the loaded eBird species list.
 * Returns the canonical common name or null.
 */
export function matchSpecies(text, speciesList) {
  if (!text || !speciesList) return null;
  const lower = text.trim().toLowerCase();

  // Exact alias match (longest alias wins via sort)
  const allEntries = speciesList
    .flatMap((s) =>
      s.aliases.map((alias) => ({ alias: alias.toLowerCase(), commonName: s.commonName }))
    )
    .sort((a, b) => b.alias.length - a.alias.length);

  // Full match
  for (const entry of allEntries) {
    if (lower === entry.alias) return entry.commonName;
  }

  // Partial: text starts with alias
  for (const entry of allEntries) {
    if (lower.startsWith(entry.alias)) return entry.commonName;
  }

  // Partial: alias is contained in text
  for (const entry of allEntries) {
    if (lower.includes(entry.alias)) return entry.commonName;
  }

  return null;
}

/**
 * Main parser: converts a spoken string like "Ten Crows" into
 * { species: "American Crow", count: 10 } or null if no match.
 *
 * @param {string} raw - Raw transcript from speech recognition
 * @param {Array}  speciesList - Loaded species list
 * @returns {{ species: string, count: number, rawText: string } | null}
 */
export function parseObservation(raw, speciesList) {
  if (!raw || !speciesList) return null;

  const result = parseLeadingNumber(raw);
  let count = 1;
  let speciesText = raw.trim();

  if (result) {
    count = result.count;
    speciesText = result.remainder;
  }

  // Must be a positive integer count
  if (!Number.isInteger(count) || count < 1) count = 1;

  const species = matchSpecies(speciesText, speciesList);
  if (!species) return null;

  return { species, count, rawText: raw };
}
