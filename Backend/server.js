// backend/server.js
const express = require("express");
const cors = require("cors");
const searchRoutes = require("./routes/search");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/search", searchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));