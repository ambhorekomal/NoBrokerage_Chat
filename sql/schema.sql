-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS vector;


--  Projects Table

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  project_type TEXT,
  project_name TEXT,
  project_category TEXT,
  slug TEXT,
  slug_id TEXT,
  status TEXT,
  project_age TEXT,
  rera_id TEXT,
  country_id TEXT,
  state_id TEXT,
  city_id TEXT,
  locality_id TEXT,
  sublocality_id TEXT,
  project_summary TEXT,
  possession_date DATE
);


--  Project Address Table

CREATE TABLE project_addresses (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  landmark TEXT,
  full_address TEXT,
  pincode TEXT
);

--  Configurations Table

CREATE TABLE configurations (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  property_category TEXT,
  type TEXT,
  custom_bhk TEXT
);


--  Variants Table

CREATE TABLE variants (
  id TEXT PRIMARY KEY,
  configuration_id TEXT REFERENCES configurations(id),
  bathrooms INT,
  private_bathrooms INT,
  public_bathrooms INT,
  balcony INT,
  furnished_type TEXT,
  furnishing_type TEXT,
  lift BOOLEAN,
  age_of_property TEXT,
  parking_type TEXT,
  listing_type TEXT,
  floor_plan_image TEXT,
  carpet_area NUMERIC,
  price BIGINT,
  property_images JSONB,
  maintenance_charges TEXT,
  about_property TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- Optional columns for semantic search
ALTER TABLE projects ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE variants ADD COLUMN IF NOT EXISTS embedding vector(1536);
