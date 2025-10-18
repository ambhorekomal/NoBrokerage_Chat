// backend/utils/summarizer.js
const { config } = require('dotenv');
config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || null;

// optional external client (kept safe — will fallback)
let generativeClient = null;
if (GEMINI_API_KEY) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    generativeClient = new GoogleGenerativeAI({ apiKey: GEMINI_API_KEY });
  } catch (err) {
    console.warn('Generative client unavailable, continuing with local summarization.');
    generativeClient = null;
  }
}

function fmtPrice(v) {
  if (!v && v !== 0) return 'N/A';
  v = Number(v);
  if (isNaN(v)) return 'N/A';
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`;
  return `₹${v}`;
}

/**
 * Deterministic grounded summary derived only from rows and filters.
 * returns a plain English 2-4 sentence summary.
 */
function buildGroundedSummary(query, rows = [], filters = {}) {
  if (!rows || rows.length === 0) {
    const loc = filters.locality ? ` in ${filters.locality}` : (filters.city ? ` in ${filters.city}` : '');
    return `No matches found${loc} for your query "${query}". Try relaxing budget, BHK or locality filters.`;
  }

  const total = rows.length;

  // possession status counts
  const statusCounts = rows.reduce((acc, r) => {
    const s = (r.status || 'UNKNOWN').toLowerCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  // localities frequency
  const localityCount = {};
  rows.forEach(r => {
    const loc = (r.landmark || r.fullAddress || 'unknown').split(',')[0].trim();
    localityCount[loc] = (localityCount[loc] || 0) + 1;
  });
  const topLocalities = Object.entries(localityCount)
    .sort((a,b) => b[1] - a[1])
    .slice(0,3)
    .map(e => e[0]);

  // price stats
  const prices = rows.map(r => Number(r.price || 0)).filter(p => p > 0);
  const avgPrice = prices.length ? Math.round(prices.reduce((a,b)=>a+b,0)/prices.length) : null;
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  const parts = [];
  const bhkFrag = filters.bhk ? `${filters.bhk}BHK ` : '';
  const locFrag = filters.city ? `in ${filters.city}` : (filters.locality ? `near ${filters.locality}` : '');
  parts.push(`${total} ${bhkFrag}listing(s) ${locFrag} found${topLocalities.length ? ` — top localities: ${topLocalities.join(', ')}` : ''}.`);
  if (avgPrice) parts.push(`Price range: ${fmtPrice(minPrice)} to ${fmtPrice(maxPrice)}, average ${fmtPrice(avgPrice)}.`);
  if (Object.keys(statusCounts).length) {
    const statusFrag = Object.entries(statusCounts).map(([s,c]) => `${c} ${s.replace('_',' ')}`).join(', ');
    parts.push(`Status: ${statusFrag}.`);
  }

  return parts.join(' ');
}

/**
 * If external generative client available, rephrase the grounded summary.
 * Must NOT add facts. If client fails, return grounded summary.
 */
async function generateSummary(query, rows = [], filters = {}) {
  const grounded = buildGroundedSummary(query, rows, filters);
  if (!generativeClient) return grounded;

  try {
    const prompt = `You are given a factual summary. Rephrase it into 2-3 clear sentences WITHOUT adding, removing, or inventing any facts. Keep numbers and place names exactly as they appear.

FACTUAL SUMMARY:
${grounded}

Rephrase:`;

    const model = generativeClient.getGenerativeModel({ model: "gemini-1.5" });
    const resp = await model.generateContent({ input: prompt });
    const text = resp?.response?.text || resp?.output?.[0]?.content?.[0]?.text;
    if (!text || text.trim().length === 0) return grounded;
    return text.trim();
  } catch (err) {
    console.warn('generateSummary failed, returning grounded summary.', err.message || err);
    return grounded;
  }
}

module.exports = { buildGroundedSummary, generateSummary };
