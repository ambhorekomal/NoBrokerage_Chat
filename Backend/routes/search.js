// backend/routes/search.js
const express = require('express');
const router = express.Router();
const { searchProperties } = require('../controller/searchController');

router.post('/', searchProperties);

module.exports = router;
