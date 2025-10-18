# NoBrokerage AI Chat — Full Stack Project

## Overview
This project is an **AI-powered natural language property search system**.  
It allows users to type queries like:

- `3BHK flat in Pune under ₹1.2 Cr`  
- `ready 2BHK Mamurdi Pune under 20 L`  

The backend parses the query, applies filters on the CSV-backed PostgreSQL database, and returns:  

1. **Grounded summary** (2-4 sentences)  
2. **Property cards** with price, BHK, status, images, amenities, and CTA link  

> NOTE: `schema.sql` and `load_csvs.js` remain unchanged as per original requirements.

---

## Project Structure

```

NOBO/
├── Backend/
│   ├── config/db.js
│   ├── controller/searchController.js
│   ├── routes/search.js
│   ├── utils/parser.js
│   ├── utils/summarizer.js
│   ├── etl/load_csvs.js
│   ├── schema.sql
│   ├── server.js
│   └── .env.example
├── Frontend/
│   ├── package.json
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── components/
│   │       ├── ChatInput.jsx
│   │       ├── MessageList.jsx
│   │       └── PropertyCard.jsx
│   └── style.css
└── README.md

````

---

## Backend Setup

1. **Install dependencies**:

```bash
cd Backend
npm install
````

2. **Create PostgreSQL database** and run schema:

```bash
psql -U postgres -d nobrokerage -f schema.sql
```

3. **Copy CSVs** into `Backend/data/` (already in repo)

4. **Create `.env` file** from `.env.example` and update DB credentials:

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_NAME=nobrokerage
DB_PORT=5432
PORT=5000
GEMINI_API_KEY=   # optional, for external summary rephrasing
```

5. **Load CSVs into PostgreSQL**:

```bash
node etl/load_csvs.js
```

6. **Start backend server**:

```bash
node server.js
```

Backend API runs at `http://localhost:5000/api/search`

---

## Frontend Setup (Vite + React)

1. **Install dependencies**:

```bash
cd ../Frontend
npm install
```

2. **Start dev server**:

```bash
npm run dev
```

3. Open browser at the URL shown by Vite (usually `http://localhost:5173/`)

---

## Usage

* Type any property search query in **natural language**, e.g.:

  ```
  3BHK flat in Pune under ₹1.2 Cr
  ready 2BHK Mamurdi Pune under 20 L
  ```

* The chat interface will display:

  1. Grounded **summary** of results
  2. **Property cards** with images, BHK, price, locality, and status

---

## How it works

1. `parser.js` extracts:

   * City, Locality, BHK, Budget, Status, Project Name, Soft-Intents
2. `searchController.js` builds SQL filters for Postgres queries
3. `summarizer.js` generates a deterministic **grounded summary** (and optionally rephrases with Gemini API)
4. Frontend renders results as a **chat UI with property cards**

---

## Notes / Future Improvements

* Add **semantic search** (PGVector + sentence-transformers) for better fuzzy matching
* Add **LLM fallback** for improved query parsing and explanation
* Add **pagination** and **sorting** for property results

---

## Tech Stack

* **Backend**: Node.js, Express.js, PostgreSQL
* **Frontend**: React.js, Vite, CSS
* **Data**: CSVs (loaded into Postgres)
* **Optional**: Gemini API for AI rephrasing of summaries

---

## Quick Commands

```bash
# Backend
cd NOBO
cd Backend
npm install
node etl/load_csvs.js
node server.js

# Frontend
cd NOBO
cd Frontend
npm install
npm run dev
```

---

