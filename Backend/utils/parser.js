// backend/utils/parser.js
// Improved parser with more robust number parsing and soft-intent detection.

const numberFromString = (s) => {
  if (!s) return null;
  s = String(s).replace(/[,₹\s]/g, "").toLowerCase();

  // crores (cr)
  const croreMatch = s.match(/([\d\.]+)\s*(cr|crore|crores)/i);
  if (croreMatch) return Math.round(Number(croreMatch[1]) * 10000000);

  // lakhs / l / lakh
  const lakhMatch = s.match(/([\d\.]+)\s*(l|lakh|lakhs|lac)/i);
  if (lakhMatch) return Math.round(Number(lakhMatch[1]) * 100000);

  // explicit numeric rupees
  const num = s.match(/(\d+)/);
  return num ? Number(num[1]) : null;
};

// Budget parser
function parseBudget(text) {
  if (!text) return null;
  // "under 1.2 cr", "below 80 L", "upto 12000000"
  const under = text.match(/\b(?:under|below|upto|up to|less than|<=)\s+([₹\d\.,\s]*(?:cr|crore|lakh|l|lakhs)?)/i);
  if (under) return numberFromString(under[1]);

  // phrase like "budget 1.2cr" or "max 1.5cr"
  const num = text.match(/\b(?:budget|max)\s*[:=]?\s*([₹\d\.,\s]*(?:cr|crore|lakh|l|lakhs)?)/i);
  if (num) return numberFromString(num[1]);

  // fallback: last numeric in the sentence if preceded by currency sign
  const rupeeMatch = text.match(/₹\s*([\d\.,]+)/);
  if (rupeeMatch) return numberFromString(rupeeMatch[1]);

  return null;
}

// BHK parser
function parseBHK(text) {
  if (!text) return null;
  const m = text.match(/(\d+)(?:[\s-]*BHK|\s*bhk|\s*bhks|\s*bed(?:rooms?)?)/i) || text.match(/(\d+)\s*(?:BHK)/i);
  if (m) return Number(m[1]);
  return null;
}

// Status parser
function parseStatus(text) {
  if (!text) return null;
  if (/\b(ready to move|ready|ready-to-move|ready_move)\b/i.test(text)) return "READY_TO_MOVE";
  if (/\b(under construction|under-construction|underconstruction|under way)\b/i.test(text)) return "UNDER_CONSTRUCTION";
  return null;
}

// City parser
function parseCity(text, knownCities = []) {
  if (!text) return null;
  // check known cities first
  for (const c of knownCities) {
    const re = new RegExp(`\\b${c}\\b`, "i");
    if (re.test(text)) return c;
  }
  // fallback: common city words
  const cityMatch = text.match(/\b(in|at|from)\s+([A-Z][a-z]{2,}\b)/i);
  if (cityMatch) return cityMatch[2];
  return null;
}

// Locality parser (improved)
function parseLocality(text, knownCities = []) {
  if (!text) return null;
  // capture "in XYZ", "at XYZ", "near XYZ", "around XYZ" (stop early)
  const m = text.match(/\b(?:in|at|near|around|around the|nearby)\s+([A-Za-z0-9\-\s]{2,60})/i);
  if (!m) return null;
  let loc = m[1].trim();

  // strip known city tokens if included
  for (const city of knownCities) {
    loc = loc.replace(new RegExp(`\\b${city}\\b`, "i"), "").trim();
  }

  // remove trailing budget word fragments or 'bhk'
  loc = loc.replace(/\b(under|below|upto|less than|₹|\d+\.?\d*\s*(cr|l|lakhs?))\b/gi, '').trim();
  loc = loc.replace(/\b\d+ ?BHK\b/i, '').trim();

  // limit length
  if (loc.length > 45) loc = loc.slice(0,45).trim();

  return loc || null;
}

// Project name parser
function parseProjectName(text) {
  if (!text) return null;
  const quoted = text.match(/"(.*?)"/);
  if (quoted) return quoted[1];
  // attempt "project <name>" or "at <projectname>"
  const m1 = text.match(/\bproject\s+([A-Za-z0-9\-\s]{2,60})/i);
  if (m1) return m1[1].trim();
  const m2 = text.match(/\bat\s+([A-Za-z0-9\-\s]{2,60})/i);
  if (m2) return m2[1].trim();
  return null;
}

// Detect soft intents like "near metro", "near it park", "close to school"
function parseSoftIntent(text) {
  if (!text) return null;
  const intents = ['metro', 'near metro', 'it park', 'IT park', 'highway', 'school', 'river', 'club', 'lake', 'station', 'bus stop'];
  for (const it of intents) {
    if (new RegExp(`\\b${it}\\b`, 'i').test(text)) return it;
  }
  return null;
}

function parseFilters(text, options = {}) {
  const knownCities = options.knownCities || [];
  const filters = {
    raw: text,
    city: parseCity(text, knownCities),
    locality: parseLocality(text, knownCities),
    bhk: parseBHK(text),
    budget: parseBudget(text),
    status: parseStatus(text),
    projectName: parseProjectName(text),
    softIntent: parseSoftIntent(text)
  };

  // If locality is just a number or budget phrase, null it
  if (!filters.locality || /\b(under|below|upto|₹|\d+)/i.test(filters.locality)) {
    filters.locality = null;
  }

  return filters;
}

module.exports = { parseFilters, numberFromString };
