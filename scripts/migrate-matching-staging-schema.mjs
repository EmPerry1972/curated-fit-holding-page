import { pathToFileURL } from "node:url";

export const REQUIRED_BASE_ID = "apphwcmdSVSl7H0iR";

const choices = (names) => ({ choices: names.map((name) => ({ name })) });

export const REQUIRED_FIELDS = Object.freeze({
  Waitlist: [
    { name: "Other Role", type: "singleLineText" },
    { name: "Qualification Completion Status", type: "singleSelect", options: choices(["Completed", "Currently studying", "Prefer to discuss"]) },
    { name: "Client Work Modes", type: "multipleSelects", options: choices(["Clients can come to me", "I can travel to clients", "I work with clients online"]) },
  ],
  "Service Areas": [
    { name: "Region Name", type: "singleLineText" },
    { name: "Region ID", type: "singleLineText" },
    { name: "Location Type", type: "singleSelect", options: choices(["City", "Town", "Suburb", "Rural locality", "Online"]) },
  ],
});

function choiceNames(field) {
  return (field.options?.choices || []).map(({ name }) => name);
}

export function planSchemaAdditions(tables) {
  const additions = [];
  for (const [tableName, requiredFields] of Object.entries(REQUIRED_FIELDS)) {
    const table = tables.find(({ name }) => name === tableName);
    if (!table) throw new Error(`Required staging table is missing: ${tableName}`);
    for (const required of requiredFields) {
      const existing = table.fields.find(({ name }) => name === required.name);
      if (!existing) {
        additions.push({ tableId: table.id, tableName, field: required });
        continue;
      }
      if (existing.type !== required.type) throw new Error(`${tableName}.${required.name} exists with type ${existing.type}; refusing to retype it.`);
      if (required.options && JSON.stringify(choiceNames(existing)) !== JSON.stringify(choiceNames(required))) {
        throw new Error(`${tableName}.${required.name} exists with different choices; refusing to overwrite it.`);
      }
    }
  }
  return additions;
}

async function airtableMetadata(path, { method = "GET", body } = {}) {
  const token = process.env.AIRTABLE_MATCHING_TOKEN;
  if (!token) throw new Error("AIRTABLE_MATCHING_TOKEN is required.");
  const response = await fetch(`https://api.airtable.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new Error(`Airtable metadata request failed with status ${response.status}.`);
  return response.json();
}

export async function migrateMatchingStagingSchema({ apply = false } = {}) {
  const baseId = process.env.AIRTABLE_MATCHING_BASE_ID;
  if (baseId !== REQUIRED_BASE_ID) throw new Error(`Refusing schema migration for base ${baseId || "<unset>"}.`);
  if (process.env.MATCHING_STAGING_ENABLED !== "true") throw new Error("Matching staging is not enabled.");
  const schema = await airtableMetadata(`/v0/meta/bases/${REQUIRED_BASE_ID}/tables`);
  const additions = planSchemaAdditions(schema.tables || []);
  if (apply) {
    for (const addition of additions) {
      await airtableMetadata(`/v0/meta/bases/${REQUIRED_BASE_ID}/tables/${addition.tableId}/fields`, { method: "POST", body: addition.field });
    }
  }
  return { apply, additions: additions.map(({ tableName, field }) => ({ table: tableName, name: field.name, type: field.type })) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  migrateMatchingStagingSchema({ apply: process.argv.includes("--apply") })
    .then((result) => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`))
    .catch((error) => { console.error(error.message); process.exitCode = 1; });
}
