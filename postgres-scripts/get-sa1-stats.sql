
drop table if exists sa1_ages;
CREATE TABLE sa1_ages
(
  gid serial not null,
  sa1_7digit character varying(7) not null,
  toddlers double precision,
  kids double precision,
  seniors double precision,
  latitude numeric(7,5),
  longitude numeric(8,5),
  geom geometry(MultiPolygon, 4326, 2)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE sa1_ages
  OWNER TO postgres;


CREATE INDEX sa1_ages_geom_idx
  ON sa1_ages
  USING gist
  (geom);
ALTER TABLE sa1_ages CLUSTER ON sa1_ages_geom_idx;

insert into sa1_ages (sa1_7digit, toddlers, kids, seniors, latitude, longitude, geom)
--SELECT bdy.sa1_7digit, stat.b6 - 27 as toddlers, stat.b9 - 50 as kids, stat.b33 + stat.b34 - 21 as seniors,
SELECT bdy.sa1_7digit, stat.b6 as toddlers, stat.b9 as kids, stat.b33 + stat.b34 as seniors,
       ST_Y(ST_Centroid(bdy.geom))::numeric(7,5) as latitude, ST_X(ST_Centroid(bdy.geom))::numeric(8,5) as longitude, ST_SetSRID(bdy.geom, 4326) as geom
  FROM sa1_2011_aust as bdy
  inner join b01 as stat on bdy.sa1_7digit = stat.region_id;

-- Update stats on table
ANALYZE sa1_ages;

-- create final point grid table with sa1 stats
drop table if exists sa1_ages_grid;
CREATE TABLE sa1_ages_grid
(
  sa1_7digit character varying(7),
  toddlers float,
  kids float,
  seniors float,
  count integer,
  latitude numeric(7,5),
  longitude numeric(8,5),
  geom geometry(POINT, 4326, 2)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE sa1_ages_grid
  OWNER TO postgres;
commit;

-- 1 - create grid of points in sa1s with stats
SELECT parsel('sa1_ages'
      ,'gid'
      ,'SELECT bdys.sa1_7digit, bdys.toddlers, bdys.kids, bdys.seniors, 0, ST_Y(pnts.geom), ST_X(pnts.geom), pnts.geom FROM mel_point_grid AS pnts JOIN sa1_ages AS bdys ON ST_Contains(bdys.geom, pnts.geom)'
      ,'sa1_ages_grid'
      ,'bdys'
      ,6);

create index sa1_ages_grid_sa1_7digit_idx on sa1_ages_grid using btree(sa1_7digit);
analyse sa1_ages_grid;


-- 2 - update count of points in each SA1
update sa1_ages_grid as g
  set count = sqt.cnt
  from (select Count(*) as cnt, sa1_7digit from sa1_ages_grid group by sa1_7digit) as sqt
  where g.sa1_7digit = sqt.sa1_7digit;


-- 3 - divide stats by count to better represent the real data
update sa1_ages_grid
 set toddlers = toddlers / count::float,
     kids = kids / count::float,
     seniors = seniors / count::float


-- final stats
select SUM(toddlers)::int as toddlers, SUM(kids)::int as kids, SUM(seniors)::int as seniors, Count(*) as cnt from sa1_ages_grid; -- 6843788
--264639;488352;205432;6843788


select MAX(toddlers)::int as toddlers, MAX(kids)::int as kids, MAX(seniors)::int as seniors, Count(*) as cnt from sa1_ages_grid; -- 6843788
--10;20;6;6843788

--qa unique coords
select * from (
  select latitude, longitude, count(*) as cnt from sa1_ages_grid group by latitude, longitude
) as sqt
where cnt > 1
order by cnt desc



-- select sqt.stat - g.seniors as diff, *
-- from sa1_ages as g, (select SUM(seniors) as stat, sa1_7digit from sa1_ages_grid group by sa1_7digit) as sqt
--   where g.sa1_7digit = sqt.sa1_7digit
--   and g.seniors <> sqt.stat
--   order by (sqt.stat - g.seniors) desc;



--SELECT bdys.sa1_7digit, bdys.toddlers, bdys.kids, bdys.seniors, ST_Y(pnts.geom), ST_X(pnts.geom) FROM mel_point_grid AS pnts JOIN sa1_ages AS bdys ON ST_Contains(bdys.geom, pnts.geom) limit 100

--select avg(toddlers)::int, avg(kids)::int, avg(seniors)::int from vw_sa1_ages_grid;

select * from sa1_ages where sa1_7digit = '2135721';


COPY (
  SELECT toddlers::numeric(8,3) as toddlers, kids::numeric(8,3) as kids, seniors::numeric(8,3) as seniors, latitude, longitude FROM sa1_ages_grid
) TO 'C:\minus34\govhack2015\sa1-toddlers-kids-seniors-grid.csv' CSV HEADER;
