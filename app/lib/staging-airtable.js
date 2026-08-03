import { createHash, randomBytes } from "node:crypto";

import {
  EXPERTISE_OPTIONS,
  REQUIRED_STAGING_BASE_ID,
  factorsForSubmittedLevel,
  isValidInvitationToken,
  validateClientSubmission,
  validateProfessionalSubmission,
} from "./matching-questionnaires.js";

const DEFAULT_TABLES = Object.freeze({
  waitlist: "Waitlist",
  clients: "Clients",
  professionalExpertise: "Professional Expertise",
  expertiseOptions: "Expertise Options",
  exerciseStages: "Exercise Stages",
  supportStyles: "Support Styles",
  settings: "Settings",
  serviceAreas: "Service Areas",
});

export const PROFESSIONAL_WRITABLE_FIELDS = Object.freeze([
  "Roles", "Structured Availability", "Experienced Client Stages", "Working Settings", "Base Suburb",
  "Travel Areas", "Travels To Clients", "Travel Charge", "Other Area", "Support Styles", "Gender",
  "Questionnaire Status", "Matching Insurance Confirmation", "Matching Qualifications", "Matching Training Provider",
  "Matching Qualification Year", "Matching Professional Registration", "Matching Registration Number",
  "Matching Insurance Details", "Matching Qualification Evidence", "Matching Insurance Evidence",
  "Questionnaire Completed At", "Invitation Token Status",
]);

export const CLIENT_WRITABLE_FIELDS = Object.freeze([
  "Client Name", "Email", "Phone Number", "Selected Outcomes", "Selected Considerations", "Exercise Stage",
  "Preferred Settings", "Suburb", "Postcode", "Preferred Support Styles", "Gender Preference", "Matching Status",
  "Is Test Record",
]);

export class StagingConfigError extends Error {}
export class InvitationTokenError extends Error {}
export class QuestionnaireValidationError extends Error {
  constructor(errors) {
    super("Please complete every required question.");
    this.errors = errors;
  }
}
export class AirtableRequestError extends Error {
  constructor(message = "The staging record could not be updated.", status = 502) {
    super(message);
    this.status = status;
  }
}

export function getStagingConfig({ requireOrigin = false } = {}) {
  const enabled = process.env.MATCHING_STAGING_ENABLED === "true";
  const baseId = process.env.AIRTABLE_MATCHING_BASE_ID;
  const token = process.env.AIRTABLE_MATCHING_TOKEN;
  const origin = process.env.MATCHING_QUESTIONNAIRE_ORIGIN;
  if (!enabled || baseId !== REQUIRED_STAGING_BASE_ID || !token || (requireOrigin && !origin)) {
    throw new StagingConfigError("The matching staging environment is not enabled.");
  }
  return {
    baseId,
    token,
    origin,
    tables: {
      waitlist: process.env.AIRTABLE_MATCHING_WAITLIST_TABLE || DEFAULT_TABLES.waitlist,
      clients: process.env.AIRTABLE_MATCHING_CLIENTS_TABLE || DEFAULT_TABLES.clients,
      professionalExpertise: process.env.AIRTABLE_MATCHING_PROFESSIONAL_EXPERTISE_TABLE || DEFAULT_TABLES.professionalExpertise,
      expertiseOptions: process.env.AIRTABLE_MATCHING_EXPERTISE_OPTIONS_TABLE || DEFAULT_TABLES.expertiseOptions,
      exerciseStages: process.env.AIRTABLE_MATCHING_EXERCISE_STAGES_TABLE || DEFAULT_TABLES.exerciseStages,
      supportStyles: process.env.AIRTABLE_MATCHING_SUPPORT_STYLES_TABLE || DEFAULT_TABLES.supportStyles,
      settings: process.env.AIRTABLE_MATCHING_SETTINGS_TABLE || DEFAULT_TABLES.settings,
      serviceAreas: process.env.AIRTABLE_MATCHING_SERVICE_AREAS_TABLE || DEFAULT_TABLES.serviceAreas,
    },
  };
}

function escapeFormulaValue(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function airtableRequest(table, { recordId, query, method = "GET", fields } = {}) {
  const { baseId, token } = getStagingConfig();
  const recordPath = recordId ? `/${encodeURIComponent(recordId)}` : "";
  const queryString = query ? `?${new URLSearchParams(query)}` : "";
  const response = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}${recordPath}${queryString}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    ...(fields ? { body: JSON.stringify(recordId ? { fields, typecast: true } : { records: [{ fields }], typecast: true }) } : {}),
    cache: "no-store",
  });
  if (!response.ok) {
    console.error("Matching staging Airtable request failed", response.status, table);
    throw new AirtableRequestError(undefined, response.status === 404 ? 404 : 502);
  }
  return response.json();
}

async function listByFormula(table, formula, maxRecords) {
  return airtableRequest(table, { query: { maxRecords: String(maxRecords), filterByFormula: formula } });
}

export function hashInvitationToken(rawToken) {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

function assertActiveInvitationRecord(records, now) {
  if (!Array.isArray(records) || records.length !== 1) throw new InvitationTokenError("This questionnaire link is not valid.");
  const record = records[0];
  const status = record.fields?.["Invitation Token Status"];
  const expiry = Date.parse(record.fields?.["Invitation Token Expiry"] || "");
  if (status !== "Active" || !Number.isFinite(expiry) || expiry <= now.getTime()) {
    throw new InvitationTokenError("This questionnaire link is not valid.");
  }
  return record;
}

export async function findProfessionalByInvitationToken(rawToken, { now = new Date() } = {}) {
  if (!isValidInvitationToken(rawToken)) throw new InvitationTokenError("This questionnaire link is not valid.");
  const { tables } = getStagingConfig();
  const tokenHash = hashInvitationToken(rawToken);
  const formula = `{Invitation Token Hash}="${escapeFormulaValue(tokenHash)}"`;
  const result = await listByFormula(tables.waitlist, formula, 2);
  const record = assertActiveInvitationRecord(result.records, now);
  return { id: record.id, name: record.fields?.Name || "there" };
}

export async function resolveLinkedRecordIds(table, idField, stableIds) {
  const ids = [...new Set(stableIds || [])];
  if (ids.length === 0) return [];
  const clauses = ids.map((id) => `{${idField}}="${escapeFormulaValue(id)}"`);
  const formula = clauses.length === 1 ? clauses[0] : `OR(${clauses.join(",")})`;
  const result = await listByFormula(table, formula, ids.length + 1);
  const byStableId = new Map();
  for (const record of result.records || []) {
    const stableId = record.fields?.[idField];
    if (!ids.includes(stableId) || byStableId.has(stableId)) throw new AirtableRequestError("Canonical staging options are not configured correctly.");
    byStableId.set(stableId, record.id);
  }
  if (byStableId.size !== ids.length) throw new AirtableRequestError("Canonical staging options are not configured correctly.");
  return ids.map((id) => byStableId.get(id));
}

async function upsertProfessionalExpertise(professionalId, expertiseOptionRecordIds, expertise) {
  const { tables } = getStagingConfig();
  for (const option of EXPERTISE_OPTIONS) {
    const response = expertise[option.id];
    const expertiseRecord = `${professionalId}:${option.id}`;
    const existing = await listByFormula(
      tables.professionalExpertise,
      `{Expertise Record}="${escapeFormulaValue(expertiseRecord)}"`,
      2,
    );
    if ((existing.records || []).length > 1) throw new AirtableRequestError("Professional expertise contains duplicate records.");
    const { matchFactor, effectiveFactor } = factorsForSubmittedLevel(response.submittedLevel);
    const fields = {
      "Expertise Record": expertiseRecord,
      Professional: [professionalId],
      "Expertise Option": [expertiseOptionRecordIds[option.id]],
      "Submitted Level": response.submittedLevel,
      "Match Factor": matchFactor,
      "Effective Factor": effectiveFactor,
      ...(response.evidence?.trim() ? { Evidence: response.evidence.trim() } : {}),
      ...(response.approximateClientsSupported !== "" && response.approximateClientsSupported !== undefined
        ? { "Approximate Clients Supported": Number(response.approximateClientsSupported) }
        : {}),
    };
    const record = existing.records?.[0];
    await airtableRequest(tables.professionalExpertise, {
      ...(record ? { recordId: record.id, method: "PATCH" } : { method: "POST" }),
      fields,
    });
  }
}

function professionalFields(data, linked, completedAt) {
  return {
    Roles: data.roles,
    "Structured Availability": data.structuredAvailability,
    "Experienced Client Stages": linked.stages,
    "Working Settings": linked.settings,
    "Base Suburb": data.baseSuburb.trim(),
    "Travel Areas": linked.travelAreas,
    "Travels To Clients": data.travelsToClients,
    ...(data.travelCharge !== "" && data.travelCharge !== undefined ? { "Travel Charge": Number(data.travelCharge) } : {}),
    ...(data.otherArea?.trim() ? { "Other Area": data.otherArea.trim() } : {}),
    "Support Styles": linked.supportStyles,
    Gender: data.gender,
    "Questionnaire Status": "Completed",
    "Matching Insurance Confirmation": data.matchingInsuranceConfirmation,
    "Matching Qualifications": data.matchingQualifications.trim(),
    "Matching Training Provider": data.matchingTrainingProvider.trim(),
    "Matching Qualification Year": Number(data.matchingQualificationYear),
    ...(data.matchingProfessionalRegistration?.trim() ? { "Matching Professional Registration": data.matchingProfessionalRegistration.trim() } : {}),
    ...(data.matchingRegistrationNumber?.trim() ? { "Matching Registration Number": data.matchingRegistrationNumber.trim() } : {}),
    ...(data.matchingInsuranceDetails?.trim() ? { "Matching Insurance Details": data.matchingInsuranceDetails.trim() } : {}),
    "Questionnaire Completed At": completedAt.toISOString(),
  };
}

export async function submitProfessionalQuestionnaire(data, { now = new Date() } = {}) {
  const errors = validateProfessionalSubmission(data);
  if (Object.keys(errors).length) throw new QuestionnaireValidationError(errors);
  const initial = await findProfessionalByInvitationToken(data.token, { now });
  const { tables } = getStagingConfig();
  const [stageIds, settingIds, supportStyleIds, travelAreaIds, expertiseOptionIds] = await Promise.all([
    resolveLinkedRecordIds(tables.exerciseStages, "Stage ID", data.experiencedClientStages),
    resolveLinkedRecordIds(tables.settings, "Setting ID", data.workingSettings),
    resolveLinkedRecordIds(tables.supportStyles, "Style ID", data.supportStyles),
    resolveLinkedRecordIds(tables.serviceAreas, "Area ID", data.travelAreas || []),
    resolveLinkedRecordIds(tables.expertiseOptions, "Option ID", EXPERTISE_OPTIONS.map(({ id }) => id)),
  ]);
  const expertiseMap = Object.fromEntries(EXPERTISE_OPTIONS.map((option, index) => [option.id, expertiseOptionIds[index]]));

  const rechecked = await findProfessionalByInvitationToken(data.token, { now: new Date(Math.max(Date.now(), now.getTime())) });
  if (rechecked.id !== initial.id) throw new InvitationTokenError("This questionnaire link is not valid.");

  await upsertProfessionalExpertise(initial.id, expertiseMap, data.expertise);
  await airtableRequest(tables.waitlist, {
    recordId: initial.id,
    method: "PATCH",
    fields: professionalFields(data, { stages: stageIds, settings: settingIds, supportStyles: supportStyleIds, travelAreas: travelAreaIds }, now),
  });
  await airtableRequest(tables.waitlist, {
    recordId: initial.id,
    method: "PATCH",
    fields: { "Invitation Token Status": "Used" },
  });
  return { ok: true };
}

export async function createClientQuestionnaire(data) {
  const errors = validateClientSubmission(data);
  if (Object.keys(errors).length) throw new QuestionnaireValidationError(errors);
  const { tables } = getStagingConfig();
  const [outcomes, considerations, stage, settings, supportStyles, suburb] = await Promise.all([
    resolveLinkedRecordIds(tables.expertiseOptions, "Option ID", data.selectedOutcomes),
    resolveLinkedRecordIds(tables.expertiseOptions, "Option ID", data.selectedConsiderations || []),
    resolveLinkedRecordIds(tables.exerciseStages, "Stage ID", [data.exerciseStage]),
    resolveLinkedRecordIds(tables.settings, "Setting ID", data.preferredSettings),
    resolveLinkedRecordIds(tables.supportStyles, "Style ID", data.preferredSupportStyles),
    resolveLinkedRecordIds(tables.serviceAreas, "Area ID", [data.suburb]),
  ]);
  const fields = {
    "Client Name": data.clientName.trim(),
    Email: data.email.trim().toLowerCase(),
    "Phone Number": data.phoneNumber?.trim() || "",
    "Selected Outcomes": outcomes,
    "Selected Considerations": considerations,
    "Exercise Stage": stage,
    "Preferred Settings": settings,
    Suburb: suburb,
    Postcode: data.postcode.trim(),
    "Preferred Support Styles": supportStyles,
    "Gender Preference": data.genderPreference,
    "Matching Status": "Ready",
    "Is Test Record": true,
  };
  await airtableRequest(tables.clients, { method: "POST", fields });
  return { ok: true };
}

async function invitationHashExists(hash) {
  const { tables } = getStagingConfig();
  const result = await listByFormula(tables.waitlist, `{Invitation Token Hash}="${escapeFormulaValue(hash)}"`, 1);
  return Boolean(result.records?.length);
}

export async function generateProfessionalInvitation({ professionalRecordId, expiry, origin }) {
  if (!/^rec[A-Za-z0-9]{10,}$/.test(professionalRecordId || "")) throw new Error("A valid Airtable professional record ID is required.");
  const expiryDate = new Date(expiry);
  if (!Number.isFinite(expiryDate.getTime()) || expiryDate <= new Date()) throw new Error("A future expiry date/time is required.");
  const parsedOrigin = new URL(origin);
  if (!/^https?:$/.test(parsedOrigin.protocol)) throw new Error("An HTTP or HTTPS questionnaire origin is required.");
  const { tables } = getStagingConfig();
  await airtableRequest(tables.waitlist, { recordId: professionalRecordId });

  let rawToken;
  let tokenHash;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    rawToken = randomBytes(32).toString("base64url");
    tokenHash = hashInvitationToken(rawToken);
    if (!(await invitationHashExists(tokenHash))) break;
    rawToken = undefined;
  }
  if (!rawToken) throw new Error("A unique invitation token could not be generated.");
  await airtableRequest(tables.waitlist, {
    recordId: professionalRecordId,
    method: "PATCH",
    fields: {
      "Invitation Token Hash": tokenHash,
      "Invitation Token Expiry": expiryDate.toISOString(),
      "Invitation Token Status": "Active",
    },
  });
  const invitationUrl = new URL("/professional-questionnaire", parsedOrigin);
  invitationUrl.searchParams.set("token", rawToken);
  return invitationUrl.toString();
}

export const STAGING_RESPONSE_HEADERS = Object.freeze({
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
});
