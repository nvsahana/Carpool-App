-- ============================================
-- CARPOOL GROUP SYSTEM MIGRATION
-- Implements multi-passenger groups with atomic consensus
-- Uses PostGIS for "on the way" calculations (FREE - no Google Maps API needed)
-- ============================================

-- Create CarpoolGroup table
CREATE TABLE "CarpoolGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "driverId" INTEGER NOT NULL,
    "maxSeats" INTEGER NOT NULL DEFAULT 4,
    "currentOccupancy" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "originLat" DOUBLE PRECISION,
    "originLng" DOUBLE PRECISION,
    "destLat" DOUBLE PRECISION,
    "destLng" DOUBLE PRECISION,
    "baseDistanceMiles" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarpoolGroup_pkey" PRIMARY KEY ("id")
);

-- Create GroupMember table
CREATE TABLE "GroupMember" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pickupLat" DOUBLE PRECISION,
    "pickupLng" DOUBLE PRECISION,
    "pickupOrder" INTEGER,
    "detourMiles" DOUBLE PRECISION,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- Create GroupRequest table
CREATE TABLE "GroupRequest" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "votesRequired" INTEGER NOT NULL,
    "votesReceived" INTEGER NOT NULL DEFAULT 0,
    "detourMiles" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupRequest_pkey" PRIMARY KEY ("id")
);

-- Create GroupVote table
CREATE TABLE "GroupVote" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "voterId" INTEGER NOT NULL,
    "vote" TEXT NOT NULL,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupVote_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX "GroupMember_groupId_userId_key" ON "GroupMember"("groupId", "userId");
CREATE UNIQUE INDEX "GroupRequest_groupId_userId_key" ON "GroupRequest"("groupId", "userId");
CREATE UNIQUE INDEX "GroupVote_requestId_voterId_key" ON "GroupVote"("requestId", "voterId");

-- Create indexes for performance
CREATE INDEX "CarpoolGroup_status_idx" ON "CarpoolGroup"("status");
CREATE INDEX "CarpoolGroup_driverId_idx" ON "CarpoolGroup"("driverId");
CREATE INDEX "GroupMember_groupId_idx" ON "GroupMember"("groupId");
CREATE INDEX "GroupMember_userId_idx" ON "GroupMember"("userId");
CREATE INDEX "GroupRequest_groupId_status_idx" ON "GroupRequest"("groupId", "status");
CREATE INDEX "GroupVote_requestId_idx" ON "GroupVote"("requestId");

-- Add foreign key constraints
ALTER TABLE "CarpoolGroup" ADD CONSTRAINT "CarpoolGroup_driverId_fkey" 
    FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" 
    FOREIGN KEY ("groupId") REFERENCES "CarpoolGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GroupRequest" ADD CONSTRAINT "GroupRequest_groupId_fkey" 
    FOREIGN KEY ("groupId") REFERENCES "CarpoolGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GroupRequest" ADD CONSTRAINT "GroupRequest_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "GroupVote" ADD CONSTRAINT "GroupVote_requestId_fkey" 
    FOREIGN KEY ("requestId") REFERENCES "GroupRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GroupVote" ADD CONSTRAINT "GroupVote_voterId_fkey" 
    FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- ============================================
-- POSTGIS: "ON THE WAY" CALCULATION FUNCTION
-- This is the FREE alternative to Google Maps Route API
-- Calculates how far a point deviates from the direct path
-- ============================================

-- Function to calculate detour distance in miles
-- Given: origin (A), destination (B), and pickup point (P)
-- Returns: perpendicular distance from P to line AB in miles
-- This approximates "how much out of the way" a pickup would be

CREATE OR REPLACE FUNCTION calculate_detour_miles(
    origin_lng DOUBLE PRECISION,
    origin_lat DOUBLE PRECISION,
    dest_lng DOUBLE PRECISION,
    dest_lat DOUBLE PRECISION,
    pickup_lng DOUBLE PRECISION,
    pickup_lat DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
    route_line geography;
    pickup_point geography;
    distance_meters DOUBLE PRECISION;
BEGIN
    -- Create a line from origin to destination
    route_line := ST_MakeLine(
        ST_SetSRID(ST_MakePoint(origin_lng, origin_lat), 4326)::geometry,
        ST_SetSRID(ST_MakePoint(dest_lng, dest_lat), 4326)::geometry
    )::geography;
    
    -- Create the pickup point
    pickup_point := ST_SetSRID(ST_MakePoint(pickup_lng, pickup_lat), 4326)::geography;
    
    -- Calculate perpendicular distance from point to line
    distance_meters := ST_Distance(route_line, pickup_point);
    
    -- Convert to miles
    RETURN distance_meters / 1609.34;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- Function to check if a point is "on the way" (within threshold)
-- Returns TRUE if pickup point adds less than X miles detour

CREATE OR REPLACE FUNCTION is_on_the_way(
    origin_lng DOUBLE PRECISION,
    origin_lat DOUBLE PRECISION,
    dest_lng DOUBLE PRECISION,
    dest_lat DOUBLE PRECISION,
    pickup_lng DOUBLE PRECISION,
    pickup_lat DOUBLE PRECISION,
    max_detour_miles DOUBLE PRECISION DEFAULT 3.0
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN calculate_detour_miles(
        origin_lng, origin_lat,
        dest_lng, dest_lat,
        pickup_lng, pickup_lat
    ) <= max_detour_miles;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- Trigger to auto-update "updatedAt" on CarpoolGroup
CREATE OR REPLACE FUNCTION update_carpool_group_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_carpool_group_updated
    BEFORE UPDATE ON "CarpoolGroup"
    FOR EACH ROW
    EXECUTE FUNCTION update_carpool_group_timestamp();

-- Trigger to auto-update "updatedAt" on GroupRequest
CREATE TRIGGER trigger_group_request_updated
    BEFORE UPDATE ON "GroupRequest"
    FOR EACH ROW
    EXECUTE FUNCTION update_carpool_group_timestamp();


-- ============================================
-- AUTO-HIDE FULL GROUPS FROM SEARCH
-- Updates status to 'FULL' when capacity reached
-- ============================================

CREATE OR REPLACE FUNCTION check_group_capacity()
RETURNS TRIGGER AS $$
BEGIN
    -- When occupancy reaches max, mark as FULL
    IF NEW."currentOccupancy" >= NEW."maxSeats" THEN
        NEW."status" = 'FULL';
    -- When occupancy drops below max and status was FULL, reopen
    ELSIF NEW."currentOccupancy" < NEW."maxSeats" AND OLD."status" = 'FULL' THEN
        NEW."status" = 'OPEN';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_group_capacity
    BEFORE UPDATE OF "currentOccupancy" ON "CarpoolGroup"
    FOR EACH ROW
    EXECUTE FUNCTION check_group_capacity();
