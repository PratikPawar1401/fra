-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- ✅ STEP 1: Add PostGIS columns to claims table (for INPUT GeoJSON)
ALTER TABLE claims ADD COLUMN IF NOT EXISTS claim_boundary GEOMETRY(POLYGON, 4326);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS claim_centroid GEOMETRY(POINT, 4326);

-- ✅ STEP 2: Create PostgreSQL tables for OUTPUT (WebGIS results)
CREATE TABLE IF NOT EXISTS gis_assets (
    id SERIAL PRIMARY KEY,
    claim_id INTEGER NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    
    -- Asset metadata
    asset_type VARCHAR(50) NOT NULL,  -- 'satellite_analysis', 'classification_map'
    asset_name VARCHAR(255) NOT NULL,
    asset_description TEXT,
    
    -- WebGIS service outputs (PostgreSQL JSON)
    satellite_image_url TEXT,
    land_classification_results JSON,
    processing_metadata JSON,
    
    -- Processing info
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    satellite_data_source VARCHAR(100),
    processing_date_range VARCHAR(100),
    gee_project_id VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS gis_analytics (
    id SERIAL PRIMARY KEY,
    claim_id INTEGER NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    asset_id INTEGER REFERENCES gis_assets(id) ON DELETE CASCADE,
    
    -- Detailed analytics (PostgreSQL columns)
    land_class_name VARCHAR(100) NOT NULL,
    area_hectares FLOAT NOT NULL,
    percentage_of_total FLOAT NOT NULL,
    confidence_score FLOAT,
    
    -- Processing metadata
    analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    model_version VARCHAR(50)
);

-- ✅ STEP 3: Create indexes
-- PostGIS spatial indexes for INPUT data
CREATE INDEX IF NOT EXISTS idx_claims_boundary ON claims USING GIST (claim_boundary);
CREATE INDEX IF NOT EXISTS idx_claims_centroid ON claims USING GIST (claim_centroid);

-- PostgreSQL indexes for OUTPUT data
CREATE INDEX IF NOT EXISTS idx_gis_assets_claim_id ON gis_assets(claim_id);
CREATE INDEX IF NOT EXISTS idx_gis_analytics_claim_id ON gis_analytics(claim_id);
CREATE INDEX IF NOT EXISTS idx_gis_analytics_land_class ON gis_analytics(land_class_name);
