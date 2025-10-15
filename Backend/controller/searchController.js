// backend/controllers/searchController.js
const pool = require("../config/db");
const parseQuery = require("../utils/parser");
const summarizeResults = require("../utils/summarizer");

async function searchProperties(req, res) {
    try {
        const { query } = req.body;
        const filters = parseQuery(query);

        let sql = `
      SELECT p.projectName, c.customBHK, v.price, p.localityId
      FROM projects p
      JOIN configurations c ON p.id = c.projectId
      JOIN variants v ON c.id = v.configurationId
      WHERE 1=1
    `;

        const values = [];
        let i = 1;

        if (filters.custombhk) {
            sql += ` AND c.customBHK = $${i++}`;
            values.push(filters.custombhk);
        }

        if (filters.furnishedtype) {
            sql += ` AND LOWER(v.furnishedType) = $${i++}`;
            values.push(filters.furnishedtype);
        }

        if (filters.price) sql += ` AND v.price ${filters.price}`;
        if (filters.locality) sql += ` AND LOWER(p.localityId) LIKE LOWER('%${filters.locality}%')`;

        const { rows } = await pool.query(sql, values);
        const summary = summarizeResults(rows);

        res.json({ summary, rows });
    } catch (err) {
        console.error("❌ Search error:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { searchProperties };