// backend/controller/searchController.js
const { pool } = require('../config/db');
const { parseFilters } = require('../utils/parser');
const { generateSummary, buildGroundedSummary } = require('../utils/summarizer');



/**
 * Helper to add SQL condition and corresponding param
 */
function addCondition(sqlParts, params, clause, value) {
    sqlParts.push(clause);
    params.push(value);
}

function formatPriceDisplay(price) {
    if (!price && price !== 0) return 'N/A';
    const p = Number(price);
    if (isNaN(p)) return 'N/A';
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
    return `₹${p}`;
}

async function searchProperties(req, res) {
    try {
        const { query } = req.body;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Request body must contain "query" string.' });
        }

        const knownCities = ['Pune', 'Mumbai', 'Bengaluru', 'Bangalore', 'Delhi', 'Thane', 'Pimpri', 'Chennai', 'Hyderabad'];
        const filters = parseFilters(query, { knownCities });

        const baseSql = `
      SELECT p.id
      , p."projectName"
      , p."projectCategory"
      , p.status
      , p."projectSummary"
      , p."possessionDate"
      , pa."fullAddress"
      , pa.landmark
      , pa.pincode
      , c."customBHK"
      , v.price
      , v."carpetArea"
      , v."aboutProperty"
      , v."propertyImages"
      , p.slug
      FROM projects p
      LEFT JOIN project_addresses pa ON pa."projectId" = p.id
      LEFT JOIN configurations c ON c."projectId" = p.id
      LEFT JOIN variants v ON v."configurationId" = c.id
      WHERE 1=1
    `;

        const sqlParts = [];
        const params = [];

        // City filter
        if (filters.city) {
            addCondition(
                sqlParts,
                params,
                `AND LOWER(COALESCE(pa."fullAddress",'') || ' ' || COALESCE(pa.landmark,'')) LIKE $${params.length + 1}`,
                `%${filters.city.toLowerCase()}%`
            );
        }

        // Locality filter
        if (filters.locality) {
            addCondition(
                sqlParts,
                params,
                `AND LOWER(COALESCE(pa."fullAddress",'') || ' ' || COALESCE(pa.landmark,'')) LIKE $${params.length + 1}`,
                `%${filters.locality.toLowerCase()}%`
            );
        }

        // BHK filter (match customBHK like '3BHK' or numeric)
        if (filters.bhk) {
            sqlParts.push(
                `AND (c."customBHK"::text ILIKE $${params.length + 1} OR c."customBHK" = $${params.length + 2})`
            );
            params.push(`%${filters.bhk}%`);
            params.push(String(filters.bhk) + 'BHK'); // sometimes stored as '3BHK'
        }

        // Status filter
        if (filters.status) {
            addCondition(
                sqlParts,
                params,
                `AND LOWER(p.status) = $${params.length + 1}`,
                filters.status.toLowerCase()
            );
        }

        // Budget filter (price in rupees)
        if (filters.budget) {
            addCondition(
                sqlParts,
                params,
                `AND v.price <= $${params.length + 1}`,
                filters.budget
            );
        }

        // Project name filter
        if (filters.projectName) {
            addCondition(
                sqlParts,
                params,
                `AND LOWER(p."projectName") LIKE $${params.length + 1}`,
                `%${filters.projectName.toLowerCase()}%`
            );
        }

        // Soft-intent (near metro/it park) -> for now search in aboutProperty & fullAddress text
        if (filters.softIntent) {
            addCondition(
                sqlParts,
                params,
                `AND (LOWER(COALESCE(v."aboutProperty",'') || ' ' || COALESCE(pa."fullAddress",'')) LIKE $${params.length + 1})`,
                `%${filters.softIntent.toLowerCase()}%`
            );
        }

        const finalSql = `${baseSql}\n${sqlParts.join('\n')}\nORDER BY v.price NULLS LAST LIMIT 100`;
        const { rows } = await pool.query(finalSql, params);

        // Build property cards
        const cards = rows.map(r => {
            const images = r.propertyImages && typeof r.propertyImages === 'string' ?
                (() => { try { return JSON.parse(r.propertyImages); } catch { return []; } })() :
                (r.propertyImages || []);

            const about = r.aboutProperty || '';
            const amenities = about.split(/[,.|;]/).map(s => s.trim()).filter(Boolean).slice(0, 3);

            return {
                id: r.id,
                title: r.projectName || r.title || 'Project',
                city_locality: `${r.landmark || r.fullAddress || ''}${r.pincode ? ', ' + r.pincode : ''}`,
                bhk: r.customBHK || 'N/A',
                priceRaw: r.price || null,
                price: formatPriceDisplay(r.price),
                projectName: r.projectName,
                possessionStatus: r.status || 'N/A',
                topAmenities: amenities,
                cta: `/project/${r.slug || r.id}`,
                slug: r.slug,
                images
            };
        });



        const groundedSummary = buildGroundedSummary(query, rows, filters);
        const rephrased = await generateSummary(query, rows, filters);

        return res.json({
            query,
            filters,
            summary: rephrased,
            groundedSummary,
            results: cards
        });


    } catch (err) {
        console.error('searchProperties error', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { searchProperties };