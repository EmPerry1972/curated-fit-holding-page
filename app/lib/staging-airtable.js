import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import {
  EXPERTISE_OPTIONS,
  REQUIRED_STAGING_BASE_ID,
  factorsForSubmittedLevel,
  isValidInvitationToken,
  normaliseClientWorkModes,
  validateClientSubmission,
  validateProfessionalSubmission,
} from "./matching-questionnaires.js";
import { calculateDryRunMatches, matchResultFields } from "./matching-engine.js";

const DEFAULT_TABLES = Object.freeze({
  waitlist: "Waitlist",
  clients: "Clients",
  professionalExpertise: "Professional Expertise",
  expertiseOptions: "Expertise Options",
  exerciseStages: "Exercise Stages",
  supportStyles: "Support Styles",
  settings: "Settings",
  serviceAreas: "Service Areas",
  matchingConfiguration: "Matching Configuration",
  automatedMatchResults: "Automated Match Results",
});

export const REQUIRED_MAIN_MATCHING_BASE_ID = "appgYLxrpdZXXULDf";

export const CLIENT_TEST_COOKIE_NAME = "curated_fit_client_test";
const CLIENT_TEST_COOKIE_MAX_AGE = 30 * 60;
export const INVITATION_ADMIN_COOKIE_NAME = "curated_fit_invitation_admin";
export const INVITATION_ADMIN_COOKIE_MAX_AGE = 15 * 60;

export const PROFESSIONAL_WRITABLE_FIELDS = Object.freeze([
  "Roles", "Other Role", "Qualification Completion Status", "Structured Availability", "Experienced Client Stages",
  "Working Settings", "Base Suburb", "Travel Areas", "Travels To Clients", "Client Work Modes", "Other Area", "Support Styles", "Gender",
  "Questionnaire Status", "Matching Insurance Confirmation", "Matching Qualifications", "Matching Training Provider",
  "Matching Qualification Year", "Matching Professional Registration", "Matching Registration Number",
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
      matchingConfiguration: DEFAULT_TABLES.matchingConfiguration,
      automatedMatchResults: DEFAULT_TABLES.automatedMatchResults,
    },
    mode: "staging",
  };
}

export function getClientMatchingConfig() {
  if (process.env.MATCHING_CLIENT_ROLLOUT_ENABLED !== "true") return getStagingConfig();
  const baseId = process.env.AIRTABLE_MATCHING_ROLLOUT_BASE_ID;
  const token = process.env.AIRTABLE_MATCHING_ROLLOUT_TOKEN;
  const dryRunOnly = process.env.MATCHING_ROLLOUT_DRY_RUN_ONLY === "true";
  if (baseId !== REQUIRED_MAIN_MATCHING_BASE_ID || !token || !dryRunOnly) {
    throw new StagingConfigError("The matching client rollout is not enabled safely.");
  }
  return {
    baseId,
    token,
    mode: "rollout",
    tables: { ...DEFAULT_TABLES },
  };
}

export function getProfessionalMatchingConfig() {
  if (process.env.MATCHING_PROFESSIONAL_ROLLOUT_ENABLED !== "true") return getStagingConfig();
  const baseId = process.env.AIRTABLE_MATCHING_PROFESSIONAL_ROLLOUT_BASE_ID;
  const token = process.env.AIRTABLE_MATCHING_PROFESSIONAL_ROLLOUT_TOKEN;
  const origin = process.env.MATCHING_PROFESSIONAL_QUESTIONNAIRE_ORIGIN;
  const reviewed = process.env.MATCHING_PROFESSIONAL_ROLLOUT_REVIEWED === "true";
  if (baseId !== REQUIRED_MAIN_MATCHING_BASE_ID || !token || !origin || !reviewed) {
    throw new StagingConfigError("The matching professional rollout is not enabled safely.");
  }
  return {
    baseId,
    token,
    origin,
    mode: "professional-rollout",
    tables: { ...DEFAULT_TABLES },
  };
}

function getClientTestSecret() {
  getClientMatchingConfig();
  const secret = process.env.MATCHING_CLIENT_TEST_SECRET;
  if (!secret) throw new StagingConfigError("The client test facility is unavailable.");
  return secret;
}

function getInvitationAdminSecret() {
  getProfessionalMatchingConfig();
  const secret = process.env.MATCHING_INVITATION_ADMIN_SECRET;
  if (!secret) throw new StagingConfigError("The invitation administration facility is unavailable.");
  return secret;
}

function safeStringEqual(left, right) {
  const leftBuffer = Buffer.from(String(left), "utf8");
  const rightBuffer = Buffer.from(String(right), "utf8");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function clientTestCookieValue(secret) {
  return createHmac("sha256", secret).update("curated-fit-client-test-v1", "utf8").digest("hex");
}

function invitationAdminCookieSignature(secret, issuedAt) {
  return createHmac("sha256", secret).update(`curated-fit-invitation-admin-v1:${issuedAt}`, "utf8").digest("hex");
}

function parseCookies(cookieHeader) {
  return Object.fromEntries(String(cookieHeader || "").split(";").map((item) => item.trim().split(/=(.*)/s).slice(0, 2)).filter(([name]) => name));
}

export function authenticateClientTestPassword(password) {
  const secret = getClientTestSecret();
  return typeof password === "string" && safeStringEqual(password, secret);
}

export function isClientTestCookieValid(cookieValue) {
  const secret = getClientTestSecret();
  return typeof cookieValue === "string" && safeStringEqual(cookieValue, clientTestCookieValue(secret));
}

export function isClientTestRequestAuthenticated(request) {
  const cookies = parseCookies(request.headers.get("cookie"));
  return isClientTestCookieValid(cookies[CLIENT_TEST_COOKIE_NAME]);
}

export function createClientTestCookieHeader(requestUrl) {
  const secret = getClientTestSecret();
  const hostname = new URL(requestUrl).hostname;
  const secure = !["localhost", "127.0.0.1", "::1"].includes(hostname);
  return `${CLIENT_TEST_COOKIE_NAME}=${clientTestCookieValue(secret)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${CLIENT_TEST_COOKIE_MAX_AGE}${secure ? "; Secure" : ""}`;
}

export function authenticateInvitationAdminPassword(password) {
  const secret = getInvitationAdminSecret();
  return typeof password === "string" && safeStringEqual(password, secret);
}

export function createInvitationAdminCookieHeader(requestUrl, { now = new Date() } = {}) {
  const secret = getInvitationAdminSecret();
  const issuedAt = Math.floor(now.getTime() / 1000);
  const value = `${issuedAt}.${invitationAdminCookieSignature(secret, issuedAt)}`;
  const hostname = new URL(requestUrl).hostname;
  const secure = !["localhost", "127.0.0.1", "::1"].includes(hostname);
  const expires = new Date((issuedAt + INVITATION_ADMIN_COOKIE_MAX_AGE) * 1000).toUTCString();
  return `${INVITATION_ADMIN_COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${INVITATION_ADMIN_COOKIE_MAX_AGE}; Expires=${expires}${secure ? "; Secure" : ""}`;
}

export function isInvitationAdminCookieValid(cookieValue, { now = new Date() } = {}) {
  const secret = getInvitationAdminSecret();
  if (typeof cookieValue !== "string") return false;
  const [issuedAtText, suppliedSignature, extra] = cookieValue.split(".");
  if (extra !== undefined || !/^\d+$/.test(issuedAtText || "") || !suppliedSignature) return false;
  const issuedAt = Number(issuedAtText);
  const currentTime = Math.floor(now.getTime() / 1000);
  if (!Number.isSafeInteger(issuedAt) || issuedAt > currentTime || currentTime - issuedAt >= INVITATION_ADMIN_COOKIE_MAX_AGE) return false;
  return safeStringEqual(suppliedSignature, invitationAdminCookieSignature(secret, issuedAt));
}

export function isInvitationAdminRequestAuthenticated(request, options) {
  const apiKey = process.env.INVITATION_API_KEY;
  const providedKey = request.headers.get("x-api-key");
  if (apiKey && providedKey && safeStringEqual(providedKey, apiKey)) {
    return true;
  }
  const cookies = parseCookies(request.headers.get("cookie"));
  return isInvitationAdminCookieValid(cookies[INVITATION_ADMIN_COOKIE_NAME], options);
}

function escapeFormulaValue(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function airtableRequest(table, { recordId, query, method = "GET", fields, config = getStagingConfig() } = {}) {
  const { baseId, token } = config;
  const recordPath = recordId ? `/${encodeURIComponent(recordId)}` : "";
  const searchParams = new URLSearchParams();
  for (const [name, value] of Object.entries(query || {})) {
    for (const item of Array.isArray(value) ? value : [value]) searchParams.append(name, item);
  }
  const queryString = searchParams.size ? `?${searchParams}` : "";
  const response = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}${recordPath}${queryString}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    ...(fields ? { body: JSON.stringify(recordId ? { fields, typecast: true } : { records: [{ fields }], typecast: true }) } : {}),
    cache: "no-store",
  });
  if (!response.ok) {
    console.error("Matching Airtable request failed", response.status, table);
    throw new AirtableRequestError(undefined, response.status === 404 ? 404 : 502);
  }
  return response.json();
}

async function listByFormula(table, formula, maxRecords, config = getStagingConfig()) {
  return airtableRequest(table, { query: { maxRecords: String(maxRecords), filterByFormula: formula }, config });
}

async function listAllRecords(table, config, query = {}) {
  const records = [];
  let offset;
  do {
    const result = await airtableRequest(table, {
      config,
      query: { pageSize: "100", ...query, ...(offset ? { offset } : {}) },
    });
    records.push(...(result.records || []));
    offset = result.offset;
  } while (offset);
  return records;
}

function chunks(items, size = 10) {
  const result = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

async function writeRecordBatch(table, records, method, config) {
  const response = await fetch(`https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(table)}`, {
    method,
    headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ records, typecast: true }),
    cache: "no-store",
  });
  if (!response.ok) {
    console.error("Matching Airtable batch request failed", response.status, table);
    throw new AirtableRequestError(undefined, response.status === 404 ? 404 : 502);
  }
  return response.json();
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

export async function findProfessionalByInvitationToken(rawToken, { now = new Date(), config = getProfessionalMatchingConfig() } = {}) {
  if (!isValidInvitationToken(rawToken)) throw new InvitationTokenError("This questionnaire link is not valid.");
  const { tables } = config;
  const tokenHash = hashInvitationToken(rawToken);
  const formula = `{Invitation Token Hash}="${escapeFormulaValue(tokenHash)}"`;
  const result = await listByFormula(tables.waitlist, formula, 2, config);
  const record = assertActiveInvitationRecord(result.records, now);
  return { id: record.id, name: record.fields?.Name || "there" };
}

export async function resolveLinkedRecordIds(table, idField, stableIds, config = getStagingConfig()) {
  const ids = [...new Set(stableIds || [])];
  if (ids.length === 0) return [];
  const clauses = ids.map((id) => `{${idField}}="${escapeFormulaValue(id)}"`);
  const formula = clauses.length === 1 ? clauses[0] : `OR(${clauses.join(",")})`;
  const result = await listByFormula(table, formula, ids.length + 1, config);
  const byStableId = new Map();
  for (const record of result.records || []) {
    const stableId = record.fields?.[idField];
    if (!ids.includes(stableId) || byStableId.has(stableId)) throw new AirtableRequestError("Canonical staging options are not configured correctly.");
    byStableId.set(stableId, record.id);
  }
  if (byStableId.size !== ids.length) throw new AirtableRequestError("Canonical staging options are not configured correctly.");
  return ids.map((id) => byStableId.get(id));
}

export async function listCanonicalServiceAreas(config = getClientMatchingConfig()) {
  const { tables } = config;
  const records = [];
  let offset;
  do {
    const result = await airtableRequest(tables.serviceAreas, {
      config,
      query: {
        pageSize: "100",
        filterByFormula: 'AND({Status}="Canonical",{Area ID}!="")',
        "fields[]": ["Area Name", "Area ID", "Region Name", "Region ID", "Location Type", "Online"],
        ...(offset ? { offset } : {}),
      },
    });
    records.push(...(result.records || []));
    offset = result.offset;
  } while (offset);
  const ids = new Set();
  return records.map((record) => {
    const fields = record.fields || {};
    const id = fields["Area ID"];
    if (!id || ids.has(id)) throw new AirtableRequestError("Canonical service areas are not configured correctly.");
    ids.add(id);
    return {
      id,
      label: fields["Area Name"],
      regionName: fields["Region Name"] || (id === "AREA-ONLINE" ? "Online" : ""),
      regionId: fields["Region ID"] || (id === "AREA-ONLINE" ? "REGION-ONLINE" : ""),
      locationType: fields["Location Type"] || (id === "AREA-ONLINE" ? "Online" : ""),
      online: fields.Online === true,
    };
  });
}

async function upsertProfessionalExpertise(professionalId, expertiseOptionRecordIds, expertise, config) {
  const { tables } = config;
  for (const option of EXPERTISE_OPTIONS) {
    const response = expertise[option.id];
    const expertiseRecord = `${professionalId}:${option.id}`;
    const existing = await listByFormula(
      tables.professionalExpertise,
      `{Expertise Record}="${escapeFormulaValue(expertiseRecord)}"`,
      2,
      config,
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
      Evidence: response.submittedLevel === "Substantial or specialist" ? response.evidence?.trim() || "" : "",
      "Approximate Clients Supported": response.submittedLevel === "Substantial or specialist"
        && response.approximateClientsSupported !== "" && response.approximateClientsSupported !== undefined
        ? Number(response.approximateClientsSupported)
        : null,
    };
    const record = existing.records?.[0];
    await airtableRequest(tables.professionalExpertise, {
      ...(record ? { recordId: record.id, method: "PATCH" } : { method: "POST" }),
      fields,
      config,
    });
  }
}

function professionalFields(data, linked, completedAt) {
  const clientWorkModes = normaliseClientWorkModes(data.clientWorkModes);
  return {
    Roles: data.roles,
    "Other Role": data.roles.includes("Other") ? data.otherRole.trim() : "",
    "Qualification Completion Status": data.qualificationCompletionStatus,
    "Structured Availability": data.structuredAvailability,
    "Experienced Client Stages": linked.stages,
    "Working Settings": linked.settings,
    "Base Suburb": linked.baseSuburb,
    "Travel Areas": linked.travelAreas,
    "Travels To Clients": clientWorkModes.includes("I can travel to clients"),
    "Client Work Modes": clientWorkModes,
    "Other Area": data.locationNotListed ? data.otherArea.trim() : "",
    "Support Styles": linked.supportStyles,
    Gender: data.gender,
    "Questionnaire Status": "Completed",
    "Matching Insurance Confirmation": data.matchingInsuranceConfirmation,
    "Matching Qualifications": data.matchingQualifications.trim(),
    "Matching Training Provider": data.matchingTrainingProvider.trim(),
    ...(data.matchingProfessionalRegistration?.trim() ? { "Matching Professional Registration": data.matchingProfessionalRegistration.trim() } : {}),
    ...(data.matchingRegistrationNumber?.trim() ? { "Matching Registration Number": data.matchingRegistrationNumber.trim() } : {}),
    "Questionnaire Completed At": completedAt.toISOString(),
    "Invitation Token Status": "Used",
  };
}

export async function submitProfessionalQuestionnaire(data, { now = new Date() } = {}) {
  const errors = validateProfessionalSubmission(data);
  if (Object.keys(errors).length) throw new QuestionnaireValidationError(errors);
  const config = getProfessionalMatchingConfig();
  const initial = await findProfessionalByInvitationToken(data.token, { now, config });
  const { tables } = config;
  const clientWorkModes = normaliseClientWorkModes(data.clientWorkModes);
  const travelAreaStableIds = clientWorkModes.includes("I can travel to clients") ? data.travelAreas || [] : [];
  const [stageIds, settingIds, supportStyleIds, travelAreaIds, baseSuburbIds, expertiseOptionIds] = await Promise.all([
    resolveLinkedRecordIds(tables.exerciseStages, "Stage ID", data.experiencedClientStages, config),
    resolveLinkedRecordIds(tables.settings, "Setting ID", data.workingSettings, config),
    resolveLinkedRecordIds(tables.supportStyles, "Style ID", data.supportStyles, config),
    resolveLinkedRecordIds(tables.serviceAreas, "Area ID", travelAreaStableIds, config),
    resolveLinkedRecordIds(tables.serviceAreas, "Area ID", data.locationNotListed ? [] : [data.baseSuburb], config),
    resolveLinkedRecordIds(tables.expertiseOptions, "Option ID", EXPERTISE_OPTIONS.map(({ id }) => id), config),
  ]);
  const expertiseMap = Object.fromEntries(EXPERTISE_OPTIONS.map((option, index) => [option.id, expertiseOptionIds[index]]));

  const rechecked = await findProfessionalByInvitationToken(data.token, { now: new Date(Math.max(Date.now(), now.getTime())), config });
  if (rechecked.id !== initial.id) throw new InvitationTokenError("This questionnaire link is not valid.");

  await upsertProfessionalExpertise(initial.id, expertiseMap, data.expertise, config);
  await airtableRequest(tables.waitlist, {
    recordId: initial.id,
    method: "PATCH",
    fields: professionalFields(data, { stages: stageIds, settings: settingIds, supportStyles: supportStyleIds, travelAreas: travelAreaIds, baseSuburb: baseSuburbIds }, now),
    config,
  });
  return { ok: true };
}

export async function createClientQuestionnaire(data) {
  const errors = validateClientSubmission(data);
  if (Object.keys(errors).length) throw new QuestionnaireValidationError(errors);
  const config = getClientMatchingConfig();
  const { tables } = config;
  const [outcomes, considerations, stage, settings, supportStyles, suburb] = await Promise.all([
    resolveLinkedRecordIds(tables.expertiseOptions, "Option ID", data.selectedOutcomes, config),
    resolveLinkedRecordIds(tables.expertiseOptions, "Option ID", data.selectedConsiderations || [], config),
    resolveLinkedRecordIds(tables.exerciseStages, "Stage ID", [data.exerciseStage], config),
    resolveLinkedRecordIds(tables.settings, "Setting ID", data.preferredSettings, config),
    resolveLinkedRecordIds(tables.supportStyles, "Style ID", data.preferredSupportStyles, config),
    resolveLinkedRecordIds(tables.serviceAreas, "Area ID", [data.suburb], config),
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
  const created = await airtableRequest(tables.clients, { method: "POST", fields, config });
  const clientRecord = created.records?.[0];
  if (!clientRecord?.id) throw new AirtableRequestError("The client record was not returned by Airtable.");
  if (config.mode === "rollout") await calculateAndStoreClientMatches({ ...clientRecord, fields }, config);
  return { ok: true };
}

async function calculateAndStoreClientMatches(clientRecord, config) {
  const { tables } = config;
  const [professionals, expertiseRecords, expertiseOptions, settingRecords, configurationRecords, existingMatches] = await Promise.all([
    listAllRecords(tables.waitlist, config),
    listAllRecords(tables.professionalExpertise, config),
    listAllRecords(tables.expertiseOptions, config),
    listAllRecords(tables.settings, config),
    listAllRecords(tables.matchingConfiguration, config, {
      filterByFormula: '{Configuration Name}="Curated Fit Matching Engine"',
    }),
    listAllRecords(tables.automatedMatchResults, config),
  ]);
  if (configurationRecords.length !== 1) throw new AirtableRequestError("Matching configuration is not unique.");
  const settingByStableId = new Map(settingRecords.map((record) => [record.fields?.["Setting ID"], record.id]));
  const { candidates, clientIssues } = calculateDryRunMatches({
    client: clientRecord,
    professionals,
    expertiseRecords,
    expertiseOptions,
    onlineSettingId: settingByStableId.get("SET-06"),
    homeSettingId: settingByStableId.get("SET-01"),
    configRecord: configurationRecords[0],
  });
  if (clientIssues.length) throw new AirtableRequestError("The stored client record did not pass matching validation.");
  const existingByMatchId = new Map(existingMatches.map((record) => [record.fields?.["Match ID"], record]));
  const matchRecordIdByMatchId = new Map();
  const calculatedAt = new Date();
  const creates = [];
  const updates = [];
  for (const candidate of candidates) {
    const matchId = `${candidate.clientId}::${candidate.professionalId}`;
    const existing = existingByMatchId.get(matchId);
    const fields = matchResultFields(candidate, calculatedAt);
    if (existing) {
      updates.push({ id: existing.id, fields });
      matchRecordIdByMatchId.set(matchId, existing.id);
    } else creates.push({ fields });
  }
  for (const batch of chunks(creates)) {
    const result = await writeRecordBatch(tables.automatedMatchResults, batch, "POST", config);
    for (const record of result.records || []) {
      const matchId = record.fields?.["Match ID"];
      if (matchId && record.id) matchRecordIdByMatchId.set(matchId, record.id);
    }
  }
  for (const batch of chunks(updates)) {
    await writeRecordBatch(tables.automatedMatchResults, batch, "PATCH", config);
  }
  if (matchRecordIdByMatchId.size !== candidates.length) {
    throw new AirtableRequestError("One or more match result records were not returned by Airtable.");
  }
  const replacementUpdates = [];
  for (const candidate of candidates) {
    if (!candidate.replacedByMatchId) continue;
    const matchId = `${candidate.clientId}::${candidate.professionalId}`;
    const recordId = matchRecordIdByMatchId.get(matchId);
    const replacementId = matchRecordIdByMatchId.get(candidate.replacedByMatchId);
    if (!recordId || !replacementId) throw new AirtableRequestError("A replacement match result could not be resolved.");
    replacementUpdates.push({
      id: recordId,
      fields: { "Replaced By": [replacementId], "Internal Follow-up Action": "Show another available match" },
    });
  }
  for (const batch of chunks(replacementUpdates)) {
    await writeRecordBatch(tables.automatedMatchResults, batch, "PATCH", config);
  }
}

async function invitationHashExists(hash, config) {
  const { tables } = config;
  const result = await listByFormula(tables.waitlist, `{Invitation Token Hash}="${escapeFormulaValue(hash)}"`, 1, config);
  return Boolean(result.records?.length);
}

export async function getWaitlistProfessional(professionalRecordId, config = getProfessionalMatchingConfig()) {
  if (!/^rec[A-Za-z0-9]{10,}$/.test(professionalRecordId || "")) throw new AirtableRequestError("A valid professional record is required.", 400);
  const { tables } = config;
  const record = await airtableRequest(tables.waitlist, { recordId: professionalRecordId, config });
  return { id: record.id, name: record.fields?.Name || "Unnamed professional" };
}

export async function generateProfessionalInvitation({ professionalRecordId, expiry, origin }) {
  if (!/^rec[A-Za-z0-9]{10,}$/.test(professionalRecordId || "")) throw new Error("A valid Airtable professional record ID is required.");
  const expiryDate = new Date(expiry);
  if (!Number.isFinite(expiryDate.getTime()) || expiryDate <= new Date()) throw new Error("A future expiry date/time is required.");
  const parsedOrigin = new URL(origin);
  if (!/^https?:$/.test(parsedOrigin.protocol)) throw new Error("An HTTP or HTTPS questionnaire origin is required.");
  const config = getProfessionalMatchingConfig();
  const { tables } = config;
  if (parsedOrigin.origin !== new URL(config.origin).origin) throw new Error("The questionnaire origin is not approved.");
  await getWaitlistProfessional(professionalRecordId, config);

  let rawToken;
  let tokenHash;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    rawToken = randomBytes(32).toString("base64url");
    tokenHash = hashInvitationToken(rawToken);
    if (!(await invitationHashExists(tokenHash, config))) break;
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
    config,
  });
  const invitationUrl = new URL("/professional-questionnaire", parsedOrigin);
  invitationUrl.searchParams.set("token", rawToken);
  return invitationUrl.toString();
}

export const STAGING_RESPONSE_HEADERS = Object.freeze({
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
});
