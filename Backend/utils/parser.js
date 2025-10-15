// backend/utils/parser.js
function parseQuery(text) {
    text = text.toLowerCase();

    const filters = {};

    if (text.includes("1 bhk")) filters.custombhk = "1";
    if (text.includes("2 bhk")) filters.custombhk = "2";
    if (text.includes("3 bhk")) filters.custombhk = "3";

    if (text.includes("furnished")) filters.furnishedtype = "furnished";
    if (text.includes("semi-furnished")) filters.furnishedtype = "semi-furnished";

    if (text.includes("under 50 lakh")) filters.price = "< 5000000";
    if (text.includes("under 1 crore")) filters.price = "< 10000000";

    if (text.includes("kharadi")) filters.locality = "Kharadi";
    if (text.includes("baner")) filters.locality = "Baner";

    return filters;
}

module.exports = parseQuery;