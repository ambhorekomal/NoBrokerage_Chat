const fs = require("fs");
const csv = require("csv-parser");
const pool = require("../config/db");

async function loadCSV(filePath, tableName, columns) {
    const rows = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", async() => {
            console.log(`📥 Loading ${rows.length} rows into ${tableName}...`);

            for (const row of rows) {
                // Handle missing columns safely
                const values = columns.map((c) => (row[c] ? row[c] : null));
                const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

                try {
                    const query = `
            INSERT INTO ${tableName} (${columns.join(", ")})
            VALUES (${placeholders})
            ON CONFLICT DO NOTHING;
          `;
                    await pool.query(query, values);
                } catch (err) {
                    console.error(`❌ Error inserting into ${tableName}:`, err.message);
                }
            }

            console.log(`✅ Finished loading ${tableName}!`);
        });
}

(async() => {
    try {
        //  Projects
        await loadCSV("backend/data/Project.csv", "projects", [
            "id",
            "projectType",
            "projectName",
            "projectCategory",
            "slug",
            "slugId",
            "status",
            "projectAge",
            "reraId",
            "countryId",
            "stateId",
            "cityId",
            "localityId",
            "subLocalityId",
            "projectSummary",
            "possessionDate"
        ]);

        // Addresses
        await loadCSV("backend/data/ProjectAddress.csv", "project_addresses", [
            "id",
            "projectId",
            "landmark",
            "fullAddress",
            "pincode"
        ]);

        //  Configurations
        await loadCSV("backend/data/ProjectConfiguration.csv", "configurations", [
            "id",
            "projectId",
            "propertyCategory",
            "type",
            "customBHK"
        ]);

        //  Variants
        await loadCSV("backend/data/ProjectConfigurationVariant.csv", "variants", [
            "id",
            "configurationId",
            "bathrooms",
            "privateBathrooms",
            "publicBathrooms",
            "balcony",
            "furnishedType",
            "furnishingType",
            "lift",
            "ageOfProperty",
            "parkingType",
            "listingType",
            "floorPlanImage",
            "carpetArea",
            "price",
            "propertyImages",
            "maintenanceCharges",
            "aboutProperty",
            "createdAt",
            "updatedAt"
        ]);
    } catch (err) {
        console.error("ETL Load Failed ❌", err.message);
    }
})();