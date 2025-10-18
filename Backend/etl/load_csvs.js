require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function loadCSV(filePath, tableName, columns) {
    return new Promise((resolve, reject) => {
                const rows = [];
                fs.createReadStream(path.join(__dirname, filePath))
                    .pipe(csv())
                    .on('data', (data) => {
                        const row = columns.map(col => {
                            let value = data[col];
                            if (value === undefined || value === '') value = null;

                            // Handle JSON columns
                            if ((col === 'furnishingType' || col === 'propertyImages') && value) {
                                try {
                                    value = JSON.stringify(JSON.parse(value));
                                } catch {
                                    value = JSON.stringify([]);
                                }
                            }

                            // Handle date columns
                            if (col === 'possessionDate' && value) {
                                const date = new Date(value);
                                if (isNaN(date)) value = null;
                                else value = date.toISOString().split('T')[0]; // YYYY-MM-DD
                            }

                            return value;
                        });
                        rows.push(row);
                    })
                    .on('end', async() => {
                            try {
                                for (const row of rows) {
                                    const placeholders = row.map((_, i) => `$${i + 1}`).join(', ');
                                    const query = `INSERT INTO ${tableName} (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`;
                        await client.query(query, row);
                    }
                    console.log(`✅ Finished loading ${tableName}!`);
                    resolve();
                } catch (err) {
                    console.error(`❌ Error inserting into ${tableName}:`, err.message);
                    reject(err);
                }
            });
    });
}

async function main() {
    try {
        await client.connect();
        console.log('✅ PostgreSQL Connected');

        // Truncate tables in order respecting FK constraints
        await client.query('TRUNCATE TABLE variants, configurations, project_addresses, projects RESTART IDENTITY CASCADE');
        console.log('🗑️  All tables truncated!');

        // Projects
        await loadCSV("../data/project.csv", "projects", [
            'id', 'projectType', 'projectName', 'projectCategory', 'slug', 'slugId',
            'status', 'projectAge', 'reraId', 'countryId', 'stateId', 'cityId',
            'localityId', 'subLocalityId', 'projectSummary', 'possessionDate'
        ]);

        // Project Addresses
        await loadCSV("../data/ProjectAddress.csv", "project_addresses", [
            'id', 'projectId', 'landmark', 'fullAddress', 'pincode'
        ]);

        // Configurations
        await loadCSV("../data/ProjectConfiguration.csv", "configurations", [
            'id', 'projectId', 'propertyCategory', 'type', 'customBHK'
        ]);

        // Variants
        await loadCSV("../data/ProjectConfigurationVariant.csv", "variants", [
            'id', 'configurationId', 'bathrooms', 'privateBathrooms', 'publicBathrooms',
            'balcony', 'furnishedType', 'furnishingType', 'lift', 'ageOfProperty',
            'parkingType', 'listingType', 'floorPlanImage', 'carpetArea', 'price',
            'propertyImages', 'maintenanceCharges', 'aboutProperty', 'createdAt', 'updatedAt'
        ]);

        console.log('🎉 All CSVs loaded successfully!');
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
        console.log('✅ PostgreSQL Disconnected');
    }
}

main();