
-- Load Accidents
DROP TABLE IF EXISTS vic_accident;
CREATE TABLE vic_accident
(
  accident_no varchar(20) NOT NULL,
  accident_date date NOT NULL,
  accident_time time NOT NULL,
  accident_type smallint NOT NULL,
  day_of_week smallint NOT NULL,
  dca_code smallint NOT NULL,
  light_condition smallint NOT NULL,
  no_persons smallint NOT NULL,
  no_persons_killed smallint NOT NULL,
  no_persons_injured_2 smallint NOT NULL,
  no_persons_injured_3 smallint NOT NULL,
  no_persons_not_injured smallint NOT NULL,
  no_vehicles smallint NOT NULL,
  police_attended smallint NOT NULL,
  road_geometry smallint NOT NULL,
  severity smallint NOT NULL,
  directory varchar(10) NOT NULL,
  edition varchar(10) NOT NULL,
  page varchar(10) NOT NULL,
  grid_ref_x varchar(1) NOT NULL,
  grid_ref_y varchar(2) NOT NULL,
  speed_zone smallint NOT NULL,
  node_id integer NOT NULL,
  CONSTRAINT vic_accident_pkey PRIMARY KEY (accident_no)
) WITH (OIDS=FALSE);
ALTER TABLE vic_accident OWNER TO postgres;

COPY vic_accident FROM E'C:\\minus34\\govhack2015\\data\\crash-stats\\vic\\accident.csv' CSV HEADER; -- 102597 

ANALYSE vic_accident;


-- Accident Nodes
DROP TABLE IF EXISTS vic_accident_node;
CREATE TABLE vic_accident_node
(
  accident_no varchar(20) NOT NULL,
  node_id integer NOT NULL,
  node_type char(1) NOT NULL,
  amg_latitude numeric(9,2) NULL,
  amg_longitude numeric(10,2) NULL,
  lga_name varchar(50) NOT NULL,
  CONSTRAINT vic_accident_node_pkey PRIMARY KEY (accident_no)
) WITH (OIDS=FALSE);
ALTER TABLE vic_accident_node OWNER TO postgres;

COPY vic_accident_node FROM E'C:\\minus34\\govhack2015\\data\\crash-stats\\vic\\node.csv' CSV HEADER; -- 102597 

--Remove those with no location -- 925
DELETE FROM vic_accident_node WHERE amg_latitude IS NULL OR amg_longitude IS NULL;

ANALYSE vic_accident_node;


--Add VicRoads Psuedo AMG Projection to PostGIS
DELETE FROM spatial_ref_sys WHERE srid = 97852;
INSERT INTO spatial_ref_sys (srid, auth_name, auth_srid, proj4text, srtext)
  VALUES (
    97852, 'sr-org', 7852,
    --'+proj=tmerc +lat_0=0 +lon_0=145 +k=1 +x_0=500000 +y_0=10000000 +ellps=WGS84 +towgs84=-117.808,-51.536,137.784,0.303,0.446,0.234,-0.29 +units=m +no_defs ',
      '+proj=tmerc +lat_0=0 +lon_0=145 +k=1 +x_0=500002 +y_0=9999985 +ellps=WGS84 +towgs84=-117.808,-51.536,137.784,0.303,0.446,0.234,-0.29 +units=m +no_defs ',
    ''
  );

ANALYSE spatial_ref_sys;


-- Create Accidents with geometries
DROP TABLE IF EXISTS vic_accident_working;
CREATE TABLE vic_accident_working
(
  accident_no varchar(20) NOT NULL,
  accident_date date NOT NULL,
  accident_time time NOT NULL,
  accident_type smallint NOT NULL,
  day_of_week smallint NOT NULL,
  dca_code smallint NOT NULL,
  light_condition smallint NOT NULL,
  no_persons smallint NOT NULL,
  no_persons_killed smallint NOT NULL,
  no_persons_injured_2 smallint NOT NULL,
  no_persons_injured_3 smallint NOT NULL,
  no_persons_not_injured smallint NOT NULL,
  no_vehicles smallint NOT NULL,
  police_attended smallint NOT NULL,
  road_geometry smallint NOT NULL,
  severity smallint NOT NULL,
--   directory varchar(10) NOT NULL,
--   edition varchar(10) NOT NULL,
--   page varchar(10) NOT NULL,
--   grid_ref_x varchar(1) NOT NULL,
--   grid_ref_y varchar(2) NOT NULL,
  speed_zone smallint NOT NULL,
  node_id integer NOT NULL,
  node_type char(1) NOT NULL,
  lga_name varchar(50) NOT NULL,
  geom geometry(POINT, 4326),
  intersection_gid integer NULL,
  road_ufi integer NULL,
  gid serial NOT NULL,
  CONSTRAINT vic_accident_working_pkey PRIMARY KEY (accident_no)
) WITH (OIDS=FALSE);
ALTER TABLE vic_accident_working OWNER TO postgres;

CREATE INDEX vic_accident_working_geom_idx ON vic_accident_working USING gist (geom);
ALTER TABLE vic_accident_working CLUSTER ON vic_accident_working_geom_idx;

INSERT INTO vic_accident_working
SELECT acc.accident_no, acc.accident_date, acc.accident_time, acc.accident_type, acc.day_of_week, acc.dca_code, acc.light_condition,
       acc.no_persons, acc.no_persons_killed, acc.no_persons_injured_2, acc.no_persons_injured_3, acc.no_persons_not_injured,
       acc.no_vehicles, acc.police_attended, acc.road_geometry, acc.severity, acc.speed_zone, acc.node_id, nod.node_type, trim(nod.lga_name),
       ST_Transform(ST_SetSRID(ST_MakePoint(nod.amg_latitude, nod.amg_longitude), 97852), 4326) AS geom
       --ST_Transform(ST_Transform(ST_SetSRID(ST_MakePoint(nod.amg_latitude, nod.amg_longitude), 97852), 3110), 4326) AS geom
  FROM vic_accident AS acc
  INNER JOIN vic_accident_node as nod
  ON acc.accident_no = nod.accident_no;

ANALYSE vic_accident_working;


-- 
-- -- Create Accidents with geometries
-- DROP TABLE IF EXISTS vic_accident_geoms;
-- CREATE TABLE vic_accident_geoms
-- (
--   no_persons smallint NOT NULL,
--   no_persons_killed smallint NOT NULL,
--   no_persons_injured_2 smallint NOT NULL,
--   no_persons_injured_3 smallint NOT NULL,
--   no_persons_not_injured smallint NOT NULL,
--   no_vehicles smallint NOT NULL,
--   latitude numeric(7,4),
--   longitude numeric(8,4),
--   geom geometry(POINT, 4326),
--   CONSTRAINT vic_accident_geoms_pkey PRIMARY KEY (latitude, longitude)
-- ) WITH (OIDS=FALSE);
-- ALTER TABLE vic_accident_geoms OWNER TO postgres;
-- 
-- CREATE INDEX vic_accident_geoms_geom_idx ON vic_accident_geoms USING gist (geom);
-- ALTER TABLE vic_accident_geoms CLUSTER ON vic_accident_geoms_geom_idx;
-- 
-- INSERT INTO vic_accident_geoms
-- SELECT SUM(no_persons),
--        SUM(no_persons_killed),
--        SUM(no_persons_injured_2), 
--        SUM(no_persons_injured_3),
--        SUM(no_persons_not_injured),
--        SUM(no_vehicles),
--        ST_Y(ST_SnapToGrid(geom, 0.0001))::numeric(7,4) AS latitude,
--        ST_X(ST_SnapToGrid(geom, 0.0001))::numeric(8,4) AS longitude,
--        ST_SetSRID(ST_MakePoint(ST_X(ST_SnapToGrid(geom, 0.0001))::numeric(8,4), ST_Y(ST_SnapToGrid(geom, 0.0001))::numeric(7,4)), 4326) AS geom
--   FROM vic_accident_working
--   GROUP BY ST_SnapToGrid(geom, 0.0001);
-- 
-- COPY ( 
-- SELECT no_persons, no_persons_killed, no_persons_injured_2, no_persons_injured_3, 
--        no_persons_not_injured, no_vehicles, latitude, longitude, geom
--   FROM vic_accident_geoms
-- ) TO E'C:\\minus34\\govhack2015\\data\\crash-stats\\vic\\vic_accident_geoms.csv' CSV HEADER; -- 70213        
-- 


-- Create intersection table

-- First create cut down road tables to use
DROP TABLE IF EXISTS tr_road2;
CREATE UNLOGGED TABLE tr_road2
(
  gid integer NOT NULL,
  ezirdnmlbl character varying(65),
  geom geometry(LINESTRING,4326),
  CONSTRAINT tr_road2_pkey PRIMARY KEY (gid)
)
WITH (OIDS=FALSE);
ALTER TABLE tr_road2 OWNER TO postgres;

CREATE INDEX tr_road2_geom_idx ON tr_road2 USING gist(geom);
ALTER TABLE tr_road2 CLUSTER ON tr_road2_geom_idx;

insert into tr_road2
SELECT gid, ezirdnmlbl, (ST_Dump(ST_SetSRID(geom, 4326))).geom FROM tr_road ORDER BY class_code, ezirdnmlbl;

ANALYSE tr_road2;


DROP TABLE IF EXISTS tr_road3;
CREATE UNLOGGED TABLE tr_road3
(
  gid integer NOT NULL,
  ezirdnmlbl character varying(65),
  geom geometry(LINESTRING,4326),
  CONSTRAINT tr_road3_pkey PRIMARY KEY (gid)
)
WITH (OIDS=FALSE);
ALTER TABLE tr_road3 OWNER TO postgres;

CREATE INDEX tr_road3_geom_idx ON tr_road3 USING gist(geom);
ALTER TABLE tr_road3 CLUSTER ON tr_road3_geom_idx;

insert into tr_road3
SELECT gid, ezirdnmlbl, (ST_Dump(ST_SetSRID(geom, 4326))).geom FROM tr_road ORDER BY class_code, ezirdnmlbl;

ANALYSE tr_road2;


-- Get intersections
DROP TABLE IF EXISTS temp_road_intersections;
CREATE UNLOGGED TABLE temp_road_intersections
(
  roadname varchar(60) NOT NULL,
  geom geometry(POINT, 4326)
) WITH (OIDS=FALSE);
ALTER TABLE temp_road_intersections OWNER TO postgres;
COMMIT;

SELECT parsel('tr_road2' -- 460s
      ,'gid'
      ,'SELECT a.ezirdnmlbl, (ST_Dump(ST_Intersection(a.geom, b.geom))).geom AS geom FROM tr_road3 as a, tr_road2 as b WHERE ST_Touches(a.geom, b.geom) AND a.gid != b.gid'
      ,'temp_road_intersections'
      ,'r2'
      ,6);

DROP TABLE IF EXISTS tr_road2;
DROP TABLE IF EXISTS tr_road3;

ANALYSE temp_road_intersections;


DROP TABLE IF EXISTS temp_road_intersections2;
CREATE UNLOGGED TABLE temp_road_intersections2
(
  roadname varchar(60) NOT NULL,
  latitude numeric(11,8),
  longitude numeric(12,8)
) WITH (OIDS=FALSE);
ALTER TABLE temp_road_intersections2 OWNER TO postgres;
COMMIT;

INSERT INTO temp_road_intersections2 -- 46s
SELECT DISTINCT roadname, ST_Y(geom), ST_X(geom) FROM temp_road_intersections;

DROP TABLE IF EXISTS temp_road_intersections;

ANALYSE temp_road_intersections2;


DROP TABLE IF EXISTS vic_road_intersections;
CREATE UNLOGGED TABLE vic_road_intersections
(
  gid serial NOT NULL,
  intersection varchar(255) NOT NULL,
  no_accidents smallint NULL,
  no_persons smallint NULL,
  no_persons_killed smallint NULL,
  no_persons_injured_2 smallint NULL,
  no_persons_injured_3 smallint NULL,
  no_persons_not_injured smallint NULL,
  no_vehicles smallint NULL,
  police_attended smallint NULL,
  geom geometry(POINT, 4326) NOT NULL
) WITH (OIDS=FALSE);
ALTER TABLE vic_road_intersections OWNER TO postgres;
COMMIT;

CREATE INDEX vic_road_intersections_geom_idx ON vic_road_intersections USING gist (geom);
ALTER TABLE vic_road_intersections CLUSTER ON vic_road_intersections_geom_idx;

INSERT INTO vic_road_intersections (intersection, geom) -- 15s
SELECT string_agg(roadname, ' / '), ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  FROM temp_road_intersections2
  GROUP BY latitude, longitude;

DROP TABLE IF EXISTS temp_road_intersections2;

ANALYSE vic_road_intersections;


--Nearest intersection query
DROP TABLE IF EXISTS vic_accident_intersections;
CREATE UNLOGGED TABLE vic_accident_intersections
(
  accident_no varchar(20) NOT NULL,
  intersection_gid integer NOT NULL,
  intersection varchar(255) NULL,
  dist numeric(5,1) NULL,
  geom geometry(POINT, 4326) NULL,
  CONSTRAINT vic_accident_intersections_pkey PRIMARY KEY (accident_no)  
) WITH (OIDS=FALSE);
ALTER TABLE vic_accident_intersections OWNER TO postgres;
COMMIT;

CREATE INDEX vic_accident_intersections_geom_idx ON vic_accident_intersections USING gist (geom);
ALTER TABLE vic_accident_intersections CLUSTER ON vic_accident_intersections_geom_idx;
COMMIT;

--Find nearest intersection using KNN
INSERT INTO vic_accident_intersections (accident_no, intersection_gid)
SELECT acc.accident_no, (SELECT int.gid FROM vic_road_intersections AS int WHERE int.intersection LIKE '% / %' ORDER BY int.geom <#> acc.geom LIMIT 1) AS intersection_gid FROM vic_accident_working AS acc WHERE acc.node_type = 'I';

ANALYSE vic_accident_intersections;

-- Update remainging fields
UPDATE vic_accident_intersections AS accint
  SET intersection = int.intersection,
      dist = ST_Distance(int.geom::geography, acc.geom::geography),
      geom = int.geom
  FROM vic_road_intersections AS int,
  vic_accident_working AS acc
  WHERE accint.intersection_gid = int.gid
  AND accint.accident_no = acc.accident_no;

ANALYSE vic_accident_intersections;

  
--select * from vic_accident_intersections order by dist desc limit 100;


--Update main accident table with intersection gid
UPDATE vic_accident_working AS acc
  SET intersection_gid = int.intersection_gid
  FROM vic_accident_intersections AS int
  WHERE acc.accident_no = int.accident_no;


--Update intersections with stats
UPDATE vic_road_intersections AS rdint
  SET no_accidents = sqt.no_accidents,
      no_persons = sqt.no_persons,
      no_persons_killed = sqt.no_persons_killed,
      no_persons_injured_2 = sqt.no_persons_injured_2,
      no_persons_injured_3 = sqt.no_persons_injured_3,
      no_persons_not_injured = sqt.no_persons_not_injured,
      no_vehicles = sqt.no_vehicles,
      police_attended = sqt.police_attended
  FROM (
    SELECT int.gid,
           Count(*) AS no_accidents,
           SUM(acc.no_persons) AS no_persons,
           SUM(acc.no_persons_killed) AS no_persons_killed,
           SUM(acc.no_persons_injured_2) AS no_persons_injured_2,
           SUM(acc.no_persons_injured_3) AS no_persons_injured_3,
           SUM(acc.no_persons_not_injured) AS no_persons_not_injured,
           SUM(acc.no_vehicles) AS no_vehicles,
           SUM(acc.police_attended) AS police_attended
    FROM vic_road_intersections as int,
    vic_accident_working AS acc
    WHERE int.gid = acc.intersection_gid
    GROUP BY int.gid
  ) as sqt
  WHERE rdint.gid = sqt.gid;


--select *, ST_Y(geom) AS latitude, ST_X(geom) AS longitude from vic_road_intersections where no_persons_injured_2 IS NOT NULL order by no_persons_injured_2 desc limit 100;



--Nearest intersection query
DROP TABLE IF EXISTS temp_accident_roads;
CREATE UNLOGGED TABLE temp_accident_roads
(
  accident_no varchar(20) NOT NULL,
  road_ufi integer NOT NULL,
  dist numeric(5,1) NULL,
  geom geometry(POINT, 4326) NULL,
  line geometry(LINESTRING, 4326) NULL,
  CONSTRAINT temp_accident_roads_pkey PRIMARY KEY (accident_no) 
) WITH (OIDS=FALSE);
ALTER TABLE temp_accident_roads OWNER TO postgres;

CREATE INDEX temp_accident_roads_geom_idx ON temp_accident_roads USING gist (geom);
CREATE INDEX temp_accident_roads_line_idx ON temp_accident_roads USING gist (line);
ALTER TABLE temp_accident_roads CLUSTER ON temp_accident_roads_geom_idx;
COMMIT;

-- SELECT acc.accident_no, rd.ufi, ST_ClosestPoint(ST_SetSRID(rd.geom, 4326), acc.geom) AS geom
--   FROM vic_accident_working AS acc, tr_road AS rd
--   WHERE ST_Intersects(ST_Buffer(acc.geom, 0.00001), ST_SetSRID(rd.geom, 4326))
--   AND acc.node_type <> 'I'
--   LIMIT 10;


--SELECT acc.accident_no, (SELECT rd.ufi FROM tr_road AS rd ORDER BY ST_ClosestPoint(ST_SetSRID(rd.geom, 4326), acc.geom) <#> acc.geom LIMIT 1) AS road_ufi FROM vic_accident_working AS acc WHERE acc.node_type <> 'I' LIMIT 10;

-- DROP VIEW IF EXISTS temp_view;
-- CREATE VIEW temp_view AS
-- SELECT accident_no, geom FROM vic_accident_working WHERE node_type <> 'I';

--SELECT acc.accident_no, (SELECT rd.ufi FROM tr_road AS rd ORDER BY ST_ClosestPoint(ST_SetSRID(rd.geom, 4326), acc.geom) <#> acc.geom LIMIT 1) AS road_ufi FROM vic_accident_working AS acc WHERE acc.node_type <> 'I' AND accident_no = 'T20060045995'

SELECT parsel('vic_accident_working' -- 460s
      ,'gid'
      ,'SELECT acc.accident_no, (SELECT rd.ufi FROM tr_road AS rd ORDER BY ST_ClosestPoint(ST_SetSRID(rd.geom, 4326), acc.geom) <#> acc.geom LIMIT 1) AS road_ufi FROM vic_accident_working AS acc WHERE acc.node_type <> ''I'''
      ,'temp_accident_roads'
      ,'acc'
      ,16);

-- Update remainging fields -- 50899 
UPDATE temp_accident_roads AS accrd
  SET geom = ST_ClosestPoint(ST_SetSRID(rd.geom, 4326), acc.geom),
      line = ST_ShortestLine(ST_SetSRID(rd.geom, 4326), acc.geom)
  FROM tr_road AS rd,
  vic_accident_working AS acc
  WHERE accrd.road_ufi = rd.ufi
  AND accrd.accident_no = acc.accident_no;


--Output roads with accidents stats
DROP TABLE IF EXISTS vic_accident_roads;
CREATE UNLOGGED TABLE vic_accident_roads
(
  ufi integer NOT NULL,
  no_accidents smallint NULL,
  no_persons smallint NULL,
  no_persons_killed smallint NULL,
  no_persons_injured_2 smallint NULL,
  no_persons_injured_3 smallint NULL,
  no_persons_not_injured smallint NULL,
  no_vehicles smallint NULL,
  police_attended smallint NULL,
  geom geometry(LINESTRING, 4326) NOT NULL,
  CONSTRAINT vic_accident_roads_pkey PRIMARY KEY (ufi) 
) WITH (OIDS=FALSE);
ALTER TABLE vic_accident_roads OWNER TO postgres;

CREATE INDEX vic_accident_roads_geom_idx ON vic_accident_roads USING gist (geom);
ALTER TABLE vic_accident_roads CLUSTER ON vic_accident_roads_geom_idx;
COMMIT;

--Insert road data
INSERT INTO vic_accident_roads (ufi, geom) -- 34360
SELECT DISTINCT rd.ufi, (ST_Dump(ST_SetSRID(rd.geom, 4326))).geom
  FROM tr_road AS rd
  INNER JOIN temp_accident_roads AS tmp
  ON rd.ufi = tmp.road_ufi;

--Update Accidents with road UFI -- 50899
UPDATE vic_accident_working AS acc
  SET road_ufi = rd.road_ufi
  FROM temp_accident_roads AS rd
  WHERE acc.accident_no = rd.accident_no;

--DROP TABLE IF EXISTS temp_accident_roads;

--Update roads with stats
UPDATE vic_accident_roads AS rdacc
  SET no_accidents = sqt.no_accidents,
      no_persons = sqt.no_persons,
      no_persons_killed = sqt.no_persons_killed,
      no_persons_injured_2 = sqt.no_persons_injured_2,
      no_persons_injured_3 = sqt.no_persons_injured_3,
      no_persons_not_injured = sqt.no_persons_not_injured,
      no_vehicles = sqt.no_vehicles,
      police_attended = sqt.police_attended
  FROM (
    SELECT rd.ufi,
           Count(*) AS no_accidents,
           SUM(acc.no_persons) AS no_persons,
           SUM(acc.no_persons_killed) AS no_persons_killed,
           SUM(acc.no_persons_injured_2) AS no_persons_injured_2,
           SUM(acc.no_persons_injured_3) AS no_persons_injured_3,
           SUM(acc.no_persons_not_injured) AS no_persons_not_injured,
           SUM(acc.no_vehicles) AS no_vehicles,
           SUM(acc.police_attended) AS police_attended
    FROM vic_accident_roads as rd,
    vic_accident_working AS acc
    WHERE rd.ufi = acc.road_ufi
    GROUP BY rd.ufi
  ) as sqt
  WHERE rdacc.ufi = sqt.ufi;

ANALYSE vic_accident_roads;


--select node_type, Count(*) from vic_accident_working group by node_type;





--select * from temp_accident_roads;



--select SUM(no_accidents) from vic_road_intersections;

--Killed at intersections -- 630
select SUM(no_persons_killed) from vic_road_intersections;
--Killed along roads -- 2231
select SUM(no_persons_killed) from vic_accident_working;

--Seriously injured at intersections -- 21525
select SUM(no_persons_injured_2) from vic_road_intersections;
--Seriously injured along roads -- 46758
select SUM(no_persons_injured_2) from vic_accident_working;

--Injured at intersections -- 45300
select SUM(no_persons_injured_3) from vic_road_intersections;
--Injured along roads -- 83920
select SUM(no_persons_injured_3) from vic_accident_working;






-- 
-- COPY ( 
--   SELECT accident_no, accident_date, accident_time, accident_type, day_of_week, 
--        dca_code, light_condition, no_persons, no_persons_killed, no_persons_injured_2, 
--        no_persons_injured_3, no_persons_not_injured, no_vehicles, police_attended, 
--        road_geometry, severity, speed_zone, node_id, node_type, lga_name, intersection_gid, road_ufi,
--        ST_Y(geom) AS latitude, ST_X(geom) AS longitude FROM vic_accident_working
-- ) TO E'C:\\minus34\\govhack2015\\data\\crash-stats\\vic\\vic_accident_working.csv' CSV HEADER; -- 102597 











--     AND a.left_loc = 'TULLAMARINE'
--     AND a.right_loc = 'TULLAMARINE';
    
--     AND a.ezirdnmlbl <> 'Unnamed'
--     AND b.ezirdnmlbl <> 'Unnamed';
-- 
-- select * from (
--   select ezirdnmlbl, Count(*) as cnt from tr_road group by ezirdnmlbl
-- ) as sqt
-- order by cnt desc;
-- 
-- 
-- select max(length(ezirdnmlbl)) from tr_road;

-- CREATE INDEX tr_road_class_code_ezirdnmlbl_idx ON tr_road USING btree (class_code, ezirdnmlbl);
-- CREATE INDEX tr_road_ezirdnmlbl_idx ON tr_road USING btree (ezirdnmlbl);

--select * from tr_road where ezirdnmlbl = 'Airport - Western Ring Out Ramp';


-- select Count(*) from vic_road_intersections where intersection LIKE '% / %';


