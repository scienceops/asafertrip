
--Create grid -- 915s
DROP TABLE IF EXISTS mel_point_grid;
CREATE TABLE mel_point_grid (
  gid SERIAL NOT NULL PRIMARY KEY,
  geom GEOMETRY('POINT', 4326, 2) NOT NULL
)
WITH (OIDS=FALSE);

INSERT INTO mel_point_grid (geom)
SELECT point_grid(50, 144.2, -38.3, 145.7, -37.4, 4326, 900913, 4326);

-- Create spatial index
CREATE INDEX mel_point_grid_geom_idx ON mel_point_grid USING gist (geom);

-- Cluster table by spatial index (for spatial query performance)
CLUSTER mel_point_grid USING mel_point_grid_geom_idx;

-- Update stats on table
ANALYZE mel_point_grid;

