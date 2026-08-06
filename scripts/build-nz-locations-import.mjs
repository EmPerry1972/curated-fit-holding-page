import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const LINZ_LAYER_ID = 113764;
const LINZ_VERSION_ID = 442170;
const LINZ_LOCATION_COUNT = 3176;
const STATS_LAYER_ID = 120946;
const STATS_VERSION_ID = 418321;
const LINZ_METADATA_URL = `https://data.linz.govt.nz/services/api/v1.x/layers/${LINZ_LAYER_ID}/`;
const STATS_METADATA_URL = `https://datafinder.stats.govt.nz/services/api/v1.x/layers/${STATS_LAYER_ID}/`;
const LINZ_QUERY_URL = "https://services.arcgis.com/xdsHIIxuCWByZiCB/arcgis/rest/services/LINZ_NZ_Suburbs_and_Localities/FeatureServer/0/query";
const STATS_QUERY_URL = "https://services2.arcgis.com/vKb0s8tBIA3bdocZ/arcgis/rest/services/Regional_Council_2025/FeatureServer/0/query";
const DEFAULT_OUTPUT = resolve(dirname(fileURLToPath(import.meta.url)), "../artifacts/nz-service-areas-linz-442170.csv");

async function json(url, params) {
  const target = new URL(url);
  for (const [name, value] of Object.entries(params || {})) target.searchParams.set(name, value);
  const response = await fetch(target);
  if (!response.ok) throw new Error(`Official source request failed with status ${response.status}.`);
  const data = await response.json();
  if (data.error) throw new Error(`Official source request failed: ${data.error.message || "unknown error"}`);
  return data;
}

function pointInRing(x, y, ring) {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const [xi, yi] = ring[index];
    const [xj, yj] = ring[previous];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function pointInPolygon(x, y, rings) {
  return rings.filter((ring) => pointInRing(x, y, ring)).length % 2 === 1;
}

function csv(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function normaliseName(nameAscii) {
  return nameAscii.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

async function fetchLocations() {
  const locations = [];
  for (let offset = 0; ; offset += 1000) {
    const page = await json(LINZ_QUERY_URL, {
      where: "type IN ('Suburb','Locality')",
      outFields: "id,name,name_ascii,type",
      returnGeometry: "false",
      returnCentroid: "true",
      outSR: "2193",
      resultOffset: String(offset),
      resultRecordCount: "1000",
      f: "json",
    });
    locations.push(...page.features);
    if (!page.exceededTransferLimit) break;
  }
  return locations;
}

async function fetchRegions() {
  const result = await json(STATS_QUERY_URL, {
    where: "1=1",
    outFields: "REGC2025_V1_00,REGC2025_V1_00_NAME",
    returnGeometry: "true",
    outSR: "2193",
    maxAllowableOffset: "10",
    f: "json",
  });
  return result.features.map((feature) => {
    const points = feature.geometry.rings.flat();
    return {
      ...feature,
      bounds: [Math.min(...points.map(([x]) => x)), Math.min(...points.map(([, y]) => y)), Math.max(...points.map(([x]) => x)), Math.max(...points.map(([, y]) => y))],
    };
  });
}

export async function buildLocationImport(outputPath = DEFAULT_OUTPUT) {
  const [linzMetadata, statsMetadata, locations, regions] = await Promise.all([
    json(LINZ_METADATA_URL), json(STATS_METADATA_URL), fetchLocations(), fetchRegions(),
  ]);
  if (linzMetadata.version?.id !== LINZ_VERSION_ID || statsMetadata.version?.id !== STATS_VERSION_ID) throw new Error("Official source version changed; review the new datasets before rebuilding the import.");
  if (locations.length !== LINZ_LOCATION_COUNT) throw new Error(`Expected ${LINZ_LOCATION_COUNT} LINZ suburbs and localities, received ${locations.length}.`);
  const ids = new Set();
  const rows = locations.map((location) => {
    const { id, name, name_ascii: nameAscii, type } = location.attributes;
    const areaId = `AREA-LINZ-${id}`;
    if (ids.has(areaId)) throw new Error(`Duplicate Area ID: ${areaId}`);
    ids.add(areaId);
    const { x, y } = location.centroid;
    const matches = regions.filter(({ bounds, geometry }) => bounds[0] <= x && x <= bounds[2] && bounds[1] <= y && y <= bounds[3] && pointInPolygon(x, y, geometry.rings));
    if (matches.length !== 1) throw new Error(`Official region mapping is not unambiguous for ${areaId} ${name}.`);
    const region = matches[0].attributes;
    return {
      "Area Name": name,
      "Area ID": areaId,
      "Normalised Name": normaliseName(nameAscii),
      "Region Name": region.REGC2025_V1_00_NAME,
      "Region ID": region.REGC2025_V1_00,
      "Location Type": type === "Suburb" ? "Suburb" : "Rural locality",
      Online: false,
      Status: "Canonical",
    };
  });
  rows.sort((left, right) => left["Region ID"].localeCompare(right["Region ID"]) || left["Area Name"].localeCompare(right["Area Name"]) || left["Area ID"].localeCompare(right["Area ID"]));
  rows.unshift({ "Area Name": "Online", "Area ID": "AREA-ONLINE", "Normalised Name": "online", "Region Name": "Online", "Region ID": "REGION-ONLINE", "Location Type": "Online", Online: true, Status: "Canonical" });
  const headers = Object.keys(rows[0]);
  const content = `${headers.map(csv).join(",")}\n${rows.map((row) => headers.map((header) => csv(row[header])).join(",")).join("\n")}\n`;
  await writeFile(outputPath, content, "utf8");
  return { outputPath, recordCount: rows.length, linzVersion: LINZ_VERSION_ID, statsVersion: STATS_VERSION_ID };
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  buildLocationImport(process.argv[2] ? resolve(process.argv[2]) : DEFAULT_OUTPUT)
    .then((result) => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`))
    .catch((error) => { console.error(error.message); process.exitCode = 1; });
}
