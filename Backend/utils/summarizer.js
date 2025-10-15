// backend/utils/summarizer.js
function summarizeResults(rows) {
    if (!rows.length) return "No matching properties found.";

    return rows
        .map(
            (r) =>
            `${r.projectname} (${r.custombhk || "N/A"} BHK) - ₹${r.price || "N/A"} in ${r.localityid || "Unknown"}`
        )
        .join("\n");
}

module.exports = summarizeResults;