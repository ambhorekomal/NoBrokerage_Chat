// backend/routes/search.js
const express = require("express");
const { searchProperties } = require("../controllers/searchController");

const router = express.Router();
router.post("/", searchProperties);

module.exports = router;