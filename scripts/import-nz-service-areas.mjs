import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REQUIRED_BASE_ID = "apphwcmdSVSl7H0iR";
const DEFAULT_INPUT = resolve(dirname(fileURLToPath(import.meta.url)), "../artifacts/nz-service-areas-linz-442170.csv");
const EXPECTED_FIELDS = ["Area Name", "Area ID", "Normalised Name", "Region Name", "Region ID", "Location Type", "Online", "Status"];

export function parseCsv(content) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (quoted && character === '"' && content[index + 1] === '"') { value += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (!quoted && character === ",") { row.push(value); value = ""; }
    else if (!quoted && character === "\n") { row.push(value); if (row.some(Boolean)) rows.push(row); row = []; value = ""; }
    else if (character !== "\r") value += character;
  }
  const [headers, ...records] = rows;
  if (JSON.stringify(headers) !== JSON.stringify(EXPECTED_FIELDS)) throw new Error("Location import fields do not match the reviewed contract.");
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, header === "Online" ? record[index] === "true" : record[index]])));
}

async function airtable(path, { method = "GET", body } = {}) {
  const response = await fetch(`https://api.airtable.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_MATCHING_TOKEN}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new Error(`Staging Airtable import request failed with status ${response.status}.`);
  return response.json();
}

async function existingAreas() {
  const records = [];
  let offset;
  do {
    const params = new URLSearchParams({ pageSize: "100" });
    for (const field of EXPECTED_FIELDS) params.append("fields[]", field);
    if (offset) params.set("offset", offset);
    const result = await airtable(`/v0/${REQUIRED_BASE_ID}/${encodeURIComponent("Service Areas")}?${params}`);
    records.push(...(result.records || []));
    offset = result.offset;
  } while (offset);
  const byAreaId = new Map();
  for (const record of records) {
    const areaId = record.fields?.["Area ID"];
    if (!areaId) continue;
    if (byAreaId.has(areaId)) throw new Error(`Staging Service Areas already contains duplicate Area ID ${areaId}.`);
    byAreaId.set(areaId, record);
  }
  return byAreaId;
}

async function writeBatches(method, records) {
  for (let index = 0; index < records.length; index += 10) {
    await airtable(`/v0/${REQUIRED_BASE_ID}/${encodeURIComponent("Service Areas")}`, { method, body: { records: records.slice(index, index + 10), typecast: false } });
  }
}

export async function importServiceAreas({ apply = false, inputPath = DEFAULT_INPUT } = {}) {
  const rows = parseCsv(await readFile(inputPath, "utf8"));
  const ids = new Set();
  for (const row of rows) {
    if (!row["Area ID"] || ids.has(row["Area ID"])) throw new Error(`Duplicate or missing Area ID ${row["Area ID"] || "<empty>"}.`);
    ids.add(row["Area ID"]);
    if (row.Status !== "Canonical") throw new Error(`Non-canonical import record ${row["Area ID"]}.`);
  }
  if (!ids.has("AREA-ONLINE")) throw new Error("The reviewed import must preserve AREA-ONLINE.");
  if (!apply) return { apply: false, recordCount: rows.length, writes: 0 };
  if (process.env.AIRTABLE_MATCHING_BASE_ID !== REQUIRED_BASE_ID) throw new Error(`Refusing location import for base ${process.env.AIRTABLE_MATCHING_BASE_ID || "<unset>"}.`);
  if (process.env.MATCHING_STAGING_ENABLED !== "true" || process.env.MATCHING_LOCATIONS_IMPORT_REVIEWED !== "true" || !process.env.AIRTABLE_MATCHING_TOKEN) throw new Error("Reviewed staging import guards are not satisfied.");
  const existing = await existingAreas();
  const importedExisting = [...existing.keys()].filter((areaId) => areaId.startsWith("AREA-LINZ-"));
  if (importedExisting.length) throw new Error("LINZ Area IDs already exist; refusing to overwrite or duplicate imported records.");
  const online = rows.find((row) => row["Area ID"] === "AREA-ONLINE");
  const creates = rows.filter((row) => row["Area ID"] !== "AREA-ONLINE").map((fields) => ({ fields }));
  if (existing.has("AREA-ONLINE")) {
    const existingOnline = existing.get("AREA-ONLINE");
    const missingFields = {};
    for (const [field, expected] of Object.entries(online)) {
      const current = existingOnline.fields?.[field];
      if (current === undefined || current === null || current === "") missingFields[field] = expected;
      else if (current !== expected) throw new Error(`AREA-ONLINE has a conflicting ${field}; refusing to overwrite it.`);
    }
    if (Object.keys(missingFields).length) await writeBatches("PATCH", [{ id: existingOnline.id, fields: missingFields }]);
  } else creates.unshift({ fields: online });
  await writeBatches("POST", creates);
  return { apply: true, recordCount: rows.length, writes: rows.length };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  importServiceAreas({ apply: process.argv.includes("--apply"), inputPath: process.argv.find((value) => value.endsWith(".csv")) || DEFAULT_INPUT })
    .then((result) => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`))
    .catch((error) => { console.error(error.message); process.exitCode = 1; });
}
