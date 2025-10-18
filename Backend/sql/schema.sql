-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop tables first (cascade to remove dependencies)
DROP TABLE IF EXISTS variants CASCADE;
DROP TABLE IF EXISTS configurations CASCADE;
DROP TABLE IF EXISTS project_addresses CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Projects Table
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    "projectType" TEXT,
    "projectName" TEXT,
    "projectCategory" TEXT,
    slug TEXT,
    "slugId" TEXT,
    status TEXT,
    "projectAge" TEXT,
    "reraId" TEXT,
    "countryId" TEXT,
    "stateId" TEXT,
    "cityId" TEXT,
    "localityId" TEXT,
    "subLocalityId" TEXT,
    "projectSummary" TEXT,
    "possessionDate" DATE,
    embedding vector(1536)
);

-- Project Addresses Table
CREATE TABLE project_addresses (
    id TEXT PRIMARY KEY,
    "projectId" TEXT REFERENCES projects(id),
    landmark TEXT,
    "fullAddress" TEXT,
    pincode TEXT
);

-- Configurations Table
CREATE TABLE configurations (
    id TEXT PRIMARY KEY,
    "projectId" TEXT REFERENCES projects(id),
    "propertyCategory" TEXT,
    type TEXT,
    "customBHK" TEXT
);

-- Variants Table
CREATE TABLE variants (
    id TEXT PRIMARY KEY,
    "configurationId" TEXT REFERENCES configurations(id),
    bathrooms INT,
    "privateBathrooms" INT,
    "publicBathrooms" INT,
    balcony INT,
    "furnishedType" TEXT,
    "furnishingType" JSONB,
    lift BOOLEAN,
    "ageOfProperty" TEXT,
    "parkingType" TEXT,
    "listingType" TEXT,
    "floorPlanImage" TEXT,
    "carpetArea" NUMERIC,
    price BIGINT,
    "propertyImages" JSONB,
    "maintenanceCharges" TEXT,
    "aboutProperty" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    embedding vector(1536)
);
