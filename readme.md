## EPSG Extents and PROJ4 Definitions

`projections.json` file contains all extents in GeoJSON polygon available in epsg.io website. 

`proj4defs.json` is generated with PostGIS via following command; 

```sql
select jsonb_object_agg(srid, trim(proj4text)) from
spatial_ref_sys
```

If you want to get latest updated list clone this repository and run following commands in command line:

```
npm install
node index.js
```

Once all pages are scanned and downloaded, the new `projections.json` file will be created.

Extents are saved in WGS-84 coordinate system (EPSG:4326). 

That's all.