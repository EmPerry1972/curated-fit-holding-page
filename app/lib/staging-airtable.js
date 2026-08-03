const REQUIRED_STAGING_BASE_ID = "apphwcmdSVSl7H0iR";

export class StagingConfigError extends Error {}
export class AirtableRequestError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

export function getStagingConfig() {
  const enabled = process.env.MATCHING_STAGING_ENABLED === "true";
  const baseId = process.env.AIRTABLE_MATCHING_BASE_ID;
  const token = process.env.AIRTABLE_MATCHING_TOKEN;
  if (!enabled || baseId !== REQUIRED_STAGING_BASE_ID || !token) {
    throw new StagingConfigError("The matching staging environment is not enabled.");
  }
  return { baseId, token };
}

function headers(token) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function airtableRequest(path, init = {}) {
  const { baseId, token } = getStagingConfig();
  const response = await fetch(`https://api.airtable.com/v0/${baseId}/${path}`, {
    ...init,
    headers: { ...headers(token), ...(init.headers || {}) },
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error("Matching staging Airtable request failed", response.status, detail);
    throw new AirtableRequestError("The staging record could not be updated.", response.status === 404 ? 404 : 502);
  }
  return response.json();
}

function escapeFormulaValue(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function findProfessionalByToken(token) {
  const table = process.env.AIRTABLE_MATCHING_PROFESSIONALS_TABLE || "Professionals";
  const tokenField = process.env.AIRTABLE_MATCHING_TOKEN_FIELD || "Questionnaire Token";
  const params = new URLSearchParams({
    maxRecords: "1",
    filterByFormula: `{${tokenField}}="${escapeFormulaValue(token)}"`,
  });
  const result = await airtableRequest(`${encodeURIComponent(table)}?${params}`);
  const record = result.records?.[0];
  if (!record) return null;
  return {
    id: record.id,
    name: record.fields?.Name || record.fields?.["Full Name"] || "there",
  };
}

export async function updateProfessionalQuestionnaire(recordId, fields) {
  const table = process.env.AIRTABLE_MATCHING_PROFESSIONALS_TABLE || "Professionals";
  return airtableRequest(encodeURIComponent(table), {
    method: "PATCH",
    body: JSON.stringify({ records: [{ id: recordId, fields }], typecast: true }),
  });
}

export async function createClientQuestionnaire(fields) {
  const table = process.env.AIRTABLE_MATCHING_CLIENTS_TABLE || "Clients";
  return airtableRequest(encodeURIComponent(table), {
    method: "POST",
    body: JSON.stringify({ records: [{ fields }], typecast: true }),
  });
}

export const STAGING_RESPONSE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};
