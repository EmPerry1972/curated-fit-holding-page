# New Zealand Service Areas import review

The CSV beside this file is a review artifact. It has not been imported into Airtable.

Sources:

- LINZ NZ Suburbs and Localities, layer 113764, published version 442170: https://data.linz.govt.nz/layer/113764-nz-suburbs-and-localities/
- Stats NZ Regional Council 2025, layer 120946, published version 418321: https://datafinder.stats.govt.nz/layer/120946-regional-council-2025/

The artifact contains the 3,176 LINZ records whose official type is `Suburb` or `Locality`, plus the preserved `AREA-ONLINE` record, for 3,177 records total. Other LINZ feature types such as islands, bays and lakes are deliberately excluded because they do not map to the approved Airtable Location Type choices.

Each LINZ record uses `AREA-LINZ-<official LINZ id>` as its stable Area ID. `Suburb` maps to `Suburb`; `Locality` maps to `Rural locality`. Region ID and Region Name come from the single Stats NZ regional council polygon containing the centroid returned by the official LINZ ArcGIS service. Artifact generation aborts if any location has zero or multiple official region matches, if an Area ID repeats, or if either pinned official source version changes.

The import must not be run until this migration and CSV have been reviewed. The import command also requires the exact staging base guard, `--apply`, and `MATCHING_LOCATIONS_IMPORT_REVIEWED=true`.
