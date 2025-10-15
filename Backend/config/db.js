// backend/config/db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

pool
    .connect()
    .then(() => console.log("✅ PostgreSQL Connected"))
    .catch((err) => console.error("❌ DB Connection Error:", err.message));

module.exports = pool;