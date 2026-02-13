-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add latitude and longitude columns to CompanyAddress
ALTER TABLE "CompanyAddress" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "CompanyAddress" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- Add latitude and longitude columns to HomeAddress
ALTER TABLE "HomeAddress" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "HomeAddress" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- Add geography columns for efficient spatial indexing
-- These are computed from lat/lng and used for PostGIS queries
ALTER TABLE "CompanyAddress" ADD COLUMN IF NOT EXISTS "location" geography(Point, 4326);
ALTER TABLE "HomeAddress" ADD COLUMN IF NOT EXISTS "location" geography(Point, 4326);

-- Create GiST indexes for fast spatial queries (sub-100ms even with thousands of rows)
CREATE INDEX IF NOT EXISTS "idx_company_address_location" ON "CompanyAddress" USING GIST("location");
CREATE INDEX IF NOT EXISTS "idx_home_address_location" ON "HomeAddress" USING GIST("location");

-- Create a function to automatically update location from lat/lng
CREATE OR REPLACE FUNCTION update_location_from_coords()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    ELSE
        NEW.location = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update location when lat/lng changes
DROP TRIGGER IF EXISTS trigger_company_address_location ON "CompanyAddress";
CREATE TRIGGER trigger_company_address_location
    BEFORE INSERT OR UPDATE OF latitude, longitude ON "CompanyAddress"
    FOR EACH ROW
    EXECUTE FUNCTION update_location_from_coords();

DROP TRIGGER IF EXISTS trigger_home_address_location ON "HomeAddress";
CREATE TRIGGER trigger_home_address_location
    BEFORE INSERT OR UPDATE OF latitude, longitude ON "HomeAddress"
    FOR EACH ROW
    EXECUTE FUNCTION update_location_from_coords();

-- Update existing rows to populate location from any existing coordinates
UPDATE "CompanyAddress" 
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

UPDATE "HomeAddress" 
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
