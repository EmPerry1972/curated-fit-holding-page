import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  ALL_CLIENT_WORK_MODES,
  AVAILABILITY_OPTIONS,
  CLIENT_WORK_MODES,
  CLIENT_GENDER_PREFERENCES,
  EXERCISE_STAGES,
  EXPERIENCE_FACTORS,
  EXPERTISE_OPTIONS,
  INSURANCE_CONFIRMATIONS,
  PROFESSIONAL_GENDERS,
  PROFESSIONAL_QUESTIONS,
  PROFESSIONAL_ROLES,
  QUALIFICATION_COMPLETION_STATUSES,
  SETTINGS,
  SUPPORT_STYLES,
  factorsForSubmittedLevel,
  isValidInvitationToken,
  normaliseClientWorkModes,
  validateClientSubmission,
  validateProfessionalSubmission,
} from "../app/lib/matching-questionnaires.js";
import {
  CLIENT_WRITABLE_FIELDS,
  CLIENT_TEST_COOKIE_NAME,
  INVITATION_ADMIN_COOKIE_MAX_AGE,
  INVITATION_ADMIN_COOKIE_NAME,
  InvitationTokenError,
  PROFESSIONAL_WRITABLE_FIELDS,
  StagingConfigError,
  createClientQuestionnaire,
  createInvitationAdminCookieHeader,
  findProfessionalByInvitationToken,
  generateProfessionalInvitation,
  getStagingConfig,
  hashInvitationToken,
  isClientTestCookieValid,
  isInvitationAdminCookieValid,
  listCanonicalServiceAreas,
  submitProfessionalQuestionnaire,
} from "../app/lib/staging-airtable.js";
import { REQUIRED_FIELDS, migrateMatchingStagingSchema, planSchemaAdditions } from "../scripts/migrate-matching-staging-schema.mjs";
import { importServiceAreas, parseCsv } from "../scripts/import-nz-service-areas.mjs";

const RAW_TOKEN = "a".repeat(43);
const TOKEN_HASH = hashInvitationToken(RAW_TOKEN);
const FUTURE_EXPIRY = "2999-01-01T00:00:00.000Z";

function installEnv() {
  process.env.MATCHING_STAGING_ENABLED = "true";
  process.env.AIRTABLE_MATCHING_BASE_ID = "apphwcmdSVSl7H0iR";
  process.env.AIRTABLE_MATCHING_TOKEN = "secret-test-pat";
  process.env.MATCHING_QUESTIONNAIRE_ORIGIN = "https://questionnaire.example";
  process.env.MATCHING_CLIENT_TEST_SECRET = "separate-client-test-password";
  process.env.MATCHING_INVITATION_ADMIN_SECRET = "separate-invitation-admin-password";
}

function validExpertise(level = "None") {
  return Object.fromEntries(EXPERTISE_OPTIONS.map(({ id }) => [id, { submittedLevel: level, evidence: "", approximateClientsSupported: "0" }]));
}

function validProfessional(overrides = {}) {
  return {
    token: RAW_TOKEN,
    roles: [PROFESSIONAL_ROLES[0]], otherRole: "",
    matchingQualifications: "Level 4 Certificate",
    matchingTrainingProvider: "Approved provider",
    qualificationCompletionStatus: "Completed",
    matchingQualificationYear: "2024",
    matchingProfessionalRegistration: "Registration body",
    matchingRegistrationNumber: "REG-1",
    matchingInsuranceConfirmation: "Yes",
    structuredAvailability: AVAILABILITY_OPTIONS[0],
    experiencedClientStages: [EXERCISE_STAGES[0].id],
    expertise: validExpertise(),
    workingSettings: [SETTINGS[0].id],
    baseSuburb: "", locationNotListed: true,
    travelAreas: ["AREA-ONLINE"],
    clientWorkModes: ["I can travel to clients"],
    otherArea: "Grey Lynn",
    supportStyles: [SUPPORT_STYLES[0].id],
    gender: PROFESSIONAL_GENDERS[0],
    ...overrides,
  };
}

function validClient(overrides = {}) {
  return {
    clientName: "Test Client",
    email: "client@example.com",
    phoneNumber: "0210000000",
    selectedOutcomes: ["OUT-01"],
    selectedConsiderations: ["CON-01"],
    exerciseStage: "STG-01",
    preferredSettings: ["SET-01"],
    suburb: "AREA-ONLINE",
    postcode: "1011",
    preferredSupportStyles: ["STY-01"],
    genderPreference: "No preference",
    ...overrides,
  };
}

function jsonResponse(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data, text: async () => JSON.stringify(data) };
}

function createAirtableMock({ tokenRecords, failExpertiseWrite = false, failFinalWaitlistWrite = false, existingExpertise = false, serviceAreaRecords = [], missingStableIds = [] } = {}) {
  const calls = [];
  const defaultTokenRecords = [{ id: "recProfessional123", fields: { Name: "Alex", "Invitation Token Status": "Active", "Invitation Token Expiry": FUTURE_EXPIRY } }];
  const recordsForToken = tokenRecords === undefined ? defaultTokenRecords : tokenRecords;
  const fetchMock = async (url, init = {}) => {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const table = decodeURIComponent(segments[2] || "");
    const recordId = segments[3] ? decodeURIComponent(segments[3]) : null;
    const method = init.method || "GET";
    const body = init.body ? JSON.parse(init.body) : null;
    calls.push({ url, table, recordId, method, body, authorization: init.headers?.Authorization });

    const writtenFields = body?.fields || body?.records?.[0]?.fields;
    if (writtenFields && table === "Waitlist" && "Questionnaire Status" in writtenFields) {
      assert.ok(Array.isArray(writtenFields["Base Suburb"]), "Waitlist.Base Suburb must be a linked-record array");
      assert.ok(Array.isArray(writtenFields["Experienced Client Stages"]), "Waitlist.Experienced Client Stages must be a linked-record array");
      assert.ok(Array.isArray(writtenFields["Working Settings"]), "Waitlist.Working Settings must be a linked-record array");
      assert.ok(Array.isArray(writtenFields["Travel Areas"]), "Waitlist.Travel Areas must be a linked-record array");
      assert.ok(Array.isArray(writtenFields["Support Styles"]), "Waitlist.Support Styles must be a linked-record array");
      assert.ok(Array.isArray(writtenFields["Client Work Modes"]), "Waitlist.Client Work Modes must be a multiple-select array");
      if ("Matching Qualification Year" in writtenFields) assert.equal(typeof writtenFields["Matching Qualification Year"], "number", "Waitlist.Matching Qualification Year must be a number");
    }
    if (writtenFields && table === "Clients") {
      assert.ok(Array.isArray(writtenFields["Exercise Stage"]), "Clients.Exercise Stage must be a linked-record array");
      assert.ok(Array.isArray(writtenFields.Suburb), "Clients.Suburb must be a linked-record array");
    }

    if (table === "Waitlist" && recordId && method === "GET") return jsonResponse({ id: recordId, fields: { Name: "Alex" } });
    if (table === "Waitlist" && !recordId) {
      const formula = parsed.searchParams.get("filterByFormula") || "";
      if (formula.includes("Invitation Token Hash")) return jsonResponse({ records: recordsForToken });
    }
    const idFields = { "Expertise Options": "Option ID", "Exercise Stages": "Stage ID", "Support Styles": "Style ID", Settings: "Setting ID", "Service Areas": "Area ID" };
    if (idFields[table]) {
      const formula = parsed.searchParams.get("filterByFormula") || "";
      if (table === "Service Areas" && formula.includes("{Status}")) return jsonResponse({ records: serviceAreaRecords });
      const ids = [...formula.matchAll(/="([A-Z]+(?:-[A-Z0-9]+)+)"/g)].map((match) => match[1]);
      return jsonResponse({ records: ids.filter((id) => !missingStableIds.includes(id)).map((id) => ({ id: `rec${id.replace(/-/g, "")}`, fields: { [idFields[table]]: id } })) });
    }
    if (table === "Professional Expertise" && method === "GET") {
      return jsonResponse({ records: existingExpertise ? [{ id: "recExistingExpertise", fields: { "Expertise Record": "existing" } }] : [] });
    }
    if (table === "Professional Expertise" && failExpertiseWrite && (method === "POST" || method === "PATCH")) return jsonResponse({ error: "failed" }, 500);
    if (table === "Waitlist" && failFinalWaitlistWrite && method === "PATCH" && writtenFields?.["Questionnaire Status"] === "Completed") return jsonResponse({ error: "failed" }, 500);
    return jsonResponse(recordId ? { id: recordId, fields: body?.fields || {} } : { records: [{ id: "recCreated", fields: body?.records?.[0]?.fields || {} }] });
  };
  return { calls, fetchMock };
}

async function withMock(mock, callback) {
  installEnv();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mock.fetchMock;
  try { return await callback(mock.calls); }
  finally { globalThis.fetch = originalFetch; }
}

test("wrong Airtable base ID refuses matching operations", () => {
  installEnv(); process.env.AIRTABLE_MATCHING_BASE_ID = "appgYLxrpdZXXULDf";
  assert.throws(() => getStagingConfig(), StagingConfigError);
});

test("disabled feature refuses matching operations", () => {
  installEnv(); process.env.MATCHING_STAGING_ENABLED = "false";
  assert.throws(() => getStagingConfig(), StagingConfigError);
});

test("configuration defaults use only canonical staging tables", () => {
  installEnv();
  assert.deepEqual(getStagingConfig().tables, { waitlist: "Waitlist", clients: "Clients", professionalExpertise: "Professional Expertise", expertiseOptions: "Expertise Options", exerciseStages: "Exercise Stages", supportStyles: "Support Styles", settings: "Settings", serviceAreas: "Service Areas" });
});

test("staging schema migration defines exactly the six approved additions", () => {
  assert.deepEqual(Object.keys(REQUIRED_FIELDS), ["Waitlist", "Service Areas"]);
  assert.deepEqual(REQUIRED_FIELDS.Waitlist.map(({ name, type }) => [name, type]), [
    ["Other Role", "singleLineText"], ["Qualification Completion Status", "singleSelect"], ["Client Work Modes", "multipleSelects"],
  ]);
  assert.deepEqual(REQUIRED_FIELDS["Service Areas"].map(({ name, type }) => [name, type]), [
    ["Region Name", "singleLineText"], ["Region ID", "singleLineText"], ["Location Type", "singleSelect"],
  ]);
  assert.deepEqual(REQUIRED_FIELDS.Waitlist[1].options.choices.map(({ name }) => name), QUALIFICATION_COMPLETION_STATUSES);
  assert.deepEqual(REQUIRED_FIELDS.Waitlist[2].options.choices.map(({ name }) => name), CLIENT_WORK_MODES);
});

test("schema migration is idempotent and refuses incompatible existing fields", () => {
  const empty = [{ id: "tblWaitlist", name: "Waitlist", fields: [] }, { id: "tblAreas", name: "Service Areas", fields: [] }];
  assert.equal(planSchemaAdditions(empty).length, 6);
  const complete = empty.map((table) => ({ ...table, fields: REQUIRED_FIELDS[table.name].map((field) => structuredClone(field)) }));
  assert.deepEqual(planSchemaAdditions(complete), []);
  complete[0].fields[0].type = "multilineText";
  assert.throws(() => planSchemaAdditions(complete), /refusing to retype/i);
});

test("schema migration hard-aborts outside the staging base before network access", async () => {
  installEnv(); process.env.AIRTABLE_MATCHING_BASE_ID = "appMainMustNeverBeTouched";
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("network must not be reached"); };
  try { await assert.rejects(() => migrateMatchingStagingSchema({ apply: true }), /Refusing schema migration/); }
  finally { globalThis.fetch = originalFetch; }
});

test("reviewable LINZ location artifact has 3,177 unique approved records and remains unimported", async () => {
  const content = await readFile("artifacts/nz-service-areas-linz-442170.csv", "utf8");
  const rows = parseCsv(content);
  assert.equal(rows.length, 3177);
  assert.equal(new Set(rows.map((row) => row["Area ID"])).size, 3177);
  assert.deepEqual(rows[0], { "Area Name": "Online", "Area ID": "AREA-ONLINE", "Normalised Name": "online", "Region Name": "Online", "Region ID": "REGION-ONLINE", "Location Type": "Online", Online: true, Status: "Canonical" });
  assert.equal(rows.slice(1).every((row) => /^AREA-LINZ-\d+$/.test(row["Area ID"]) && row["Region Name"] && row["Region ID"] && ["Suburb", "Rural locality"].includes(row["Location Type"]) && row.Status === "Canonical"), true);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("dry review must not write"); };
  try { assert.deepEqual(await importServiceAreas(), { apply: false, recordCount: 3177, writes: 0 }); }
  finally { globalThis.fetch = originalFetch; }
});

test("token is SHA-256 hashed", () => {
  assert.equal(TOKEN_HASH, "66d34fba71f8f450f7e45598853e53bfc23bbd129027cbb131a2f4ffd7878cd0");
});

test("missing and malformed invitation tokens are rejected", async () => {
  installEnv();
  await assert.rejects(() => findProfessionalByInvitationToken(""), InvitationTokenError);
  await assert.rejects(() => findProfessionalByInvitationToken("short token"), InvitationTokenError);
  assert.equal(isValidInvitationToken(RAW_TOKEN), true);
});

test("plaintext token is never sent to Airtable and hash is used for lookup", async () => {
  const mock = createAirtableMock();
  await withMock(mock, async (calls) => {
    await findProfessionalByInvitationToken(RAW_TOKEN);
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, new RegExp(TOKEN_HASH));
    assert.doesNotMatch(calls[0].url, new RegExp(RAW_TOKEN));
    assert.equal(JSON.stringify(calls[0].body).includes(RAW_TOKEN), false);
  });
});

for (const [name, records] of [
  ["unknown", []],
  ["duplicate", [{ id: "rec1", fields: { "Invitation Token Status": "Active", "Invitation Token Expiry": FUTURE_EXPIRY } }, { id: "rec2", fields: { "Invitation Token Status": "Active", "Invitation Token Expiry": FUTURE_EXPIRY } }]],
  ["Used", [{ id: "rec1", fields: { "Invitation Token Status": "Used", "Invitation Token Expiry": FUTURE_EXPIRY } }]],
  ["Revoked", [{ id: "rec1", fields: { "Invitation Token Status": "Revoked", "Invitation Token Expiry": FUTURE_EXPIRY } }]],
  ["Expired", [{ id: "rec1", fields: { "Invitation Token Status": "Expired", "Invitation Token Expiry": FUTURE_EXPIRY } }]],
  ["past-expiry", [{ id: "rec1", fields: { "Invitation Token Status": "Active", "Invitation Token Expiry": "2020-01-01T00:00:00.000Z" } }]],
]) {
  test(`${name} invitation token is rejected`, async () => {
    const mock = createAirtableMock({ tokenRecords: records });
    await withMock(mock, () => assert.rejects(() => findProfessionalByInvitationToken(RAW_TOKEN), InvitationTokenError));
  });
}

test("professional questionnaire contains exactly the approved nine questions", () => {
  assert.equal(PROFESSIONAL_QUESTIONS.length, 9);
  assert.deepEqual(PROFESSIONAL_QUESTIONS.map(({ id }) => id), ["roles", "qualifications", "availability", "experiencedClientStages", "expertise", "workingSettings", "locationAndTravel", "supportStyles", "gender"]);
});

test("professional exact role, insurance, availability and gender values are preserved", () => {
  assert.deepEqual(PROFESSIONAL_ROLES, ["Personal trainer", "Strength and conditioning coach", "Pilates instructor", "Yoga instructor", "Exercise physiologist", "Physiotherapist", "Other"]);
  assert.deepEqual(INSURANCE_CONFIRMATIONS, ["Yes", "No"]);
  assert.equal(AVAILABILITY_OPTIONS.length, 4);
  assert.deepEqual(PROFESSIONAL_GENDERS, ["Woman", "Man", "Prefer not to say"]);
});

test("all 12 expertise IDs, labels and safety flags are exact", () => {
  assert.equal(EXPERTISE_OPTIONS.length, 12);
  assert.deepEqual(EXPERTISE_OPTIONS.map(({ id }) => id), ["OUT-01", "OUT-02", "OUT-03", "OUT-04", "OUT-05", "OUT-06", "CON-01", "CON-02", "CON-03", "CON-04", "CON-05", "CON-06"]);
  assert.equal(EXPERTISE_OPTIONS.find(({ id }) => id === "OUT-01").label, "Building strength and maintaining muscle");
  assert.equal(EXPERTISE_OPTIONS.find(({ id }) => id === "CON-06").label, "Weight change or weight-loss medication");
  assert.deepEqual(EXPERTISE_OPTIONS.filter(({ safetySensitive }) => safetySensitive).map(({ id }) => id), ["CON-02", "CON-03", "CON-04", "CON-05", "CON-06"]);
});

test("factor mapping and unverified specialist cap are exact", () => {
  assert.deepEqual(EXPERIENCE_FACTORS, { None: 0, Some: 0.35, Regular: 0.75, "Substantial or specialist": 1 });
  assert.deepEqual(factorsForSubmittedLevel("Substantial or specialist"), { matchFactor: 1, effectiveFactor: 0.75 });
});

test("professional stages enforce maximum three", () => {
  const data = validProfessional({ experiencedClientStages: EXERCISE_STAGES.slice(0, 4).map(({ id }) => id) });
  assert.match(validateProfessionalSubmission(data).experiencedClientStages, /no more than 3/i);
});

test("professional support styles enforce maximum two", () => {
  const data = validProfessional({ supportStyles: SUPPORT_STYLES.slice(0, 3).map(({ id }) => id) });
  assert.match(validateProfessionalSubmission(data).supportStyles, /no more than 2/i);
});

test("professional validation rejects unapproved gender and incomplete expertise", () => {
  const data = validProfessional({ gender: "Another gender", expertise: { "OUT-01": { submittedLevel: "Some" } } });
  const errors = validateProfessionalSubmission(data);
  assert.ok(errors.gender); assert.ok(errors.expertise);
});

test("Other Role is conditionally required and written only to its approved field", async () => {
  assert.ok(validateProfessionalSubmission(validProfessional({ roles: ["Other"], otherRole: "" })).otherRole);
  assert.equal(validateProfessionalSubmission(validProfessional({ roles: ["Other"], otherRole: "Clinical Pilates specialist" })).otherRole, undefined);
  const mock = createAirtableMock();
  await withMock(mock, async (calls) => {
    await submitProfessionalQuestionnaire(validProfessional({ roles: ["Other"], otherRole: "  Clinical Pilates specialist  " }));
    const fields = calls.find((call) => call.body?.fields?.["Questionnaire Status"] === "Completed").body.fields;
    assert.equal(fields["Other Role"], "Clinical Pilates specialist");
    assert.equal(Object.keys(fields).filter((name) => name.includes("Role") && name !== "Roles").join(","), "Other Role");
  });
});

test("Other Role is cleared when Other is not selected", async () => {
  const mock = createAirtableMock();
  await withMock(mock, async (calls) => {
    await submitProfessionalQuestionnaire(validProfessional({ otherRole: "must not persist" }));
    const fields = calls.find((call) => call.body?.fields?.["Questionnaire Status"] === "Completed").body.fields;
    assert.equal(fields["Other Role"], "");
  });
});

test("qualification completion status does not collect or write a completion year", async () => {
  assert.deepEqual(QUALIFICATION_COMPLETION_STATUSES, ["Completed", "Currently studying", "Prefer to discuss"]);
  assert.equal(validateProfessionalSubmission(validProfessional({ qualificationCompletionStatus: "Completed", matchingQualificationYear: "" })).matchingQualificationYear, undefined);
  assert.equal(validateProfessionalSubmission(validProfessional({ qualificationCompletionStatus: "Currently studying", matchingQualificationYear: "" })).matchingQualificationYear, undefined);
  const source = await readFile("app/components/HiddenMatchingQuestionnaire.tsx", "utf8");
  assert.doesNotMatch(source, /Qualification year|matchingQualificationYear|qualificationYears/);
  assert.equal(PROFESSIONAL_WRITABLE_FIELDS.includes("Matching Qualification Year"), true);
  const mock = createAirtableMock();
  await withMock(mock, async (calls) => {
    await submitProfessionalQuestionnaire(validProfessional({ qualificationCompletionStatus: "Completed", matchingQualificationYear: "2024" }));
    const fields = calls.find((call) => call.body?.fields?.["Questionnaire Status"] === "Completed").body.fields;
    assert.equal(fields["Qualification Completion Status"], "Completed");
    assert.equal("Matching Qualification Year" in fields, false);
  });
});

test("insurance details are never written and Insurance Status remains manual", async () => {
  const mock = createAirtableMock();
  await withMock(mock, async (calls) => {
    await submitProfessionalQuestionnaire(validProfessional({ matchingInsuranceDetails: "must not be sent" }));
    const fields = calls.find((call) => call.body?.fields?.["Questionnaire Status"] === "Completed").body.fields;
    assert.equal(fields["Matching Insurance Confirmation"], "Yes");
    assert.equal("Matching Insurance Details" in fields, false);
    assert.equal("Insurance Status" in fields, false);
  });
});

test("Q4 and Q5 use the approved wording and conditional experience text", async () => {
  const source = await readFile("app/components/HiddenMatchingQuestionnaire.tsx", "utf8");
  assert.match(source, /Which types of clients do you have the most experience supporting\?/);
  assert.match(source, /Choose up to three areas where your experience is strongest\./);
  assert.match(source, /Tell us where your experience is strongest/);
  assert.match(source, /Tell us a little about your experience in this area/);
  assert.match(source, /const showExperience = form\.expertise\[option\.id\]\.submittedLevel === "Substantial or specialist"/);
  assert.doesNotMatch(source, /\["Regular", "Substantial or specialist"\]\.includes/);
  assert.doesNotMatch(source, />Evidence</);
  assert.equal(EXERCISE_STAGES.length, 6);
  assert.equal(EXERCISE_STAGES.some(({ label }) => /all stages/i.test(label)), false);
});

test("non-specialist expertise clears specialist-only details", async () => {
  const expertise = Object.fromEntries(EXPERTISE_OPTIONS.map(({ id }) => [id, {
    submittedLevel: "Regular",
    evidence: "must not persist",
    approximateClientsSupported: "99",
  }]));
  assert.deepEqual(validateProfessionalSubmission(validProfessional({ expertise })), {});
  const mock = createAirtableMock();
  await withMock(mock, async (calls) => {
    await submitProfessionalQuestionnaire(validProfessional({ expertise }));
    const writes = calls.filter((call) => call.table === "Professional Expertise" && ["POST", "PATCH"].includes(call.method));
    assert.equal(writes.length, 12);
    for (const write of writes) {
      const fields = write.body.records[0].fields;
      assert.equal(fields.Evidence, "");
      assert.equal(fields["Approximate Clients Supported"], null);
    }
  });
});

test("specialist expertise validates and persists specialist details", async () => {
  const expertise = Object.fromEntries(EXPERTISE_OPTIONS.map(({ id }) => [id, {
    submittedLevel: "Substantial or specialist",
    evidence: "Relevant specialist training and client experience.",
    approximateClientsSupported: "12",
  }]));
  assert.deepEqual(validateProfessionalSubmission(validProfessional({ expertise })), {});
  const mock = createAirtableMock();
  await withMock(mock, async (calls) => {
    await submitProfessionalQuestionnaire(validProfessional({ expertise }));
    const writes = calls.filter((call) => call.table === "Professional Expertise" && ["POST", "PATCH"].includes(call.method));
    assert.equal(writes.length, 12);
    for (const write of writes) {
      const fields = write.body.records[0].fields;
      assert.equal(fields.Evidence, "Relevant specialist training and client experience.");
      assert.equal(fields["Approximate Clients Supported"], 12);
    }
  });
});

test("professional must supply either a listed Base Suburb or a not-listed Other Area", () => {
  const errors = validateProfessionalSubmission(validProfessional({ baseSuburb: "", locationNotListed: true, otherArea: "" }));
  assert.ok(errors.otherArea);
});

test("invalid Base Suburb Area ID is rejected", () => {
  const errors = validateProfessionalSubmission(validProfessional({ baseSuburb: "AREA-AUCKLAND", locationNotListed: false, otherArea: "" }));
  assert.ok(errors.baseSuburb);
});

test("well-formed but unknown Base Suburb Area ID is rejected server-side", async () => {
  const mock = createAirtableMock({ missingStableIds: ["AREA-LINZ-999"] });
  await withMock(mock, () => assert.rejects(() => submitProfessionalQuestionnaire(validProfessional({ baseSuburb: "AREA-LINZ-999", locationNotListed: false, otherArea: "" })), /Canonical staging options/));
});

test("professional location choices expose approved region and location fields", async () => {
  const serviceAreaRecords = [{ id: "recArea101", fields: { "Area Name": "Herne Bay", "Area ID": "AREA-LINZ-101", "Region Name": "Auckland Region", "Region ID": "02", "Location Type": "Suburb", Online: false, Status: "Canonical" } }];
  const mock = createAirtableMock({ serviceAreaRecords });
  await withMock(mock, async () => {
    assert.deepEqual(await listCanonicalServiceAreas(), [{ id: "AREA-LINZ-101", label: "Herne Bay", regionName: "Auckland Region", regionId: "02", locationType: "Suburb", online: false }]);
  });
});

test("professional location labels are human-readable while stable IDs remain internal", async () => {
  const source = await readFile("app/components/HiddenMatchingQuestionnaire.tsx", "utf8");
  assert.match(source, /const locationDisplay = \(area: ServiceAreaOption\) => area\.label;/);
  assert.doesNotMatch(source, /const locationDisplay = .*area\.id/);
  const serviceAreaRecords = [{ id: "recArea101", fields: { "Area Name": "Herne Bay", "Area ID": "AREA-LINZ-101", "Region Name": "Auckland Region", "Region ID": "02", "Location Type": "Suburb", Online: false, Status: "Canonical" } }];
  const mock = createAirtableMock({ serviceAreaRecords });
  await withMock(mock, async () => {
    const [area] = await listCanonicalServiceAreas();
    assert.equal(area.label, "Herne Bay");
    assert.equal(area.id, "AREA-LINZ-101");
  });
});

test("listed Base Suburb resolves to a linked record array", async () => {
  const mock = createAirtableMock();
  await withMock(mock, async (calls) => {
    await submitProfessionalQuestionnaire(validProfessional({ baseSuburb: "AREA-LINZ-101", locationNotListed: false, otherArea: "" }));
    const fields = calls.find((call) => call.body?.fields?.["Questionnaire Status"] === "Completed").body.fields;
    assert.deepEqual(fields["Base Suburb"], ["recAREALINZ101"]);
    assert.equal(fields["Other Area"], "");
  });
});

test("free-text suburb is stored only in Other Area and Base Suburb remains an empty linked array", async () => {
  const mock = createAirtableMock();
  await withMock(mock, async (calls) => {
    await submitProfessionalQuestionnaire(validProfessional({ baseSuburb: "", locationNotListed: true, otherArea: "Herne Bay" }));
    const fields = calls.find((call) => call.body?.fields?.["Questionnaire Status"] === "Completed").body.fields;
    assert.deepEqual(fields["Base Suburb"], []);
    assert.equal(fields["Other Area"], "Herne Bay");
  });
});

test("location validation accepts exactly the listed or not-listed path", () => {
  assert.deepEqual(validateProfessionalSubmission(validProfessional({ baseSuburb: "AREA-LINZ-101", locationNotListed: false, otherArea: "" })), {});
  assert.deepEqual(validateProfessionalSubmission(validProfessional({ baseSuburb: "", locationNotListed: true, otherArea: "  Herne Bay  " })), {});
  assert.ok(validateProfessionalSubmission(validProfessional({ baseSuburb: "", locationNotListed: false, otherArea: "Herne Bay" })).baseSuburb);
  assert.ok(validateProfessionalSubmission(validProfessional({ baseSuburb: "AREA-LINZ-101", locationNotListed: true, otherArea: "Herne Bay" })).baseSuburb);
});

test("work-mode All of the above maps exclusively to the three stored values", () => {
  assert.deepEqual(normaliseClientWorkModes([ALL_CLIENT_WORK_MODES]), CLIENT_WORK_MODES);
  assert.equal(normaliseClientWorkModes([ALL_CLIENT_WORK_MODES, CLIENT_WORK_MODES[0]]), null);
  assert.deepEqual(normaliseClientWorkModes([CLIENT_WORK_MODES[0], CLIENT_WORK_MODES[2]]), [CLIENT_WORK_MODES[0], CLIENT_WORK_MODES[2]]);
});

test("work modes and Travel Areas map to approved Airtable values", async () => {
  const mock = createAirtableMock();
  await withMock(mock, async (calls) => {
    await submitProfessionalQuestionnaire(validProfessional({ clientWorkModes: [ALL_CLIENT_WORK_MODES], travelAreas: ["AREA-LINZ-101", "AREA-LINZ-202"] }));
    const fields = calls.find((call) => call.body?.fields?.["Questionnaire Status"] === "Completed").body.fields;
    assert.deepEqual(fields["Client Work Modes"], CLIENT_WORK_MODES);
    assert.equal(fields["Client Work Modes"].includes(ALL_CLIENT_WORK_MODES), false);
    assert.equal(fields["Travels To Clients"], true);
    assert.deepEqual(fields["Travel Areas"], ["recAREALINZ101", "recAREALINZ202"]);
  });
});

test("non-travelling work modes reject submitted Travel Areas", () => {
  const errors = validateProfessionalSubmission(validProfessional({ clientWorkModes: ["I work with clients online"], travelAreas: ["AREA-LINZ-101"] }));
  assert.ok(errors.travelAreas);
});

test("Travel Charge is absent and questionnaire submission never creates Service Areas", async () => {
  const mock = createAirtableMock();
  await withMock(mock, async (calls) => {
    await submitProfessionalQuestionnaire(validProfessional({ travelCharge: "99" }));
    const fields = calls.find((call) => call.body?.fields?.["Questionnaire Status"] === "Completed").body.fields;
    assert.equal("Travel Charge" in fields, false);
    assert.equal(PROFESSIONAL_WRITABLE_FIELDS.includes("Travel Charge"), false);
    assert.equal(calls.some((call) => call.table === "Service Areas" && call.method === "POST"), false);
  });
});

test("professional submission resolves linked records, rechecks token and writes only approved fields", async () => {
  const mock = createAirtableMock();
  await withMock(mock, async (calls) => {
    await submitProfessionalQuestionnaire(validProfessional());
    const tokenLookups = calls.filter((call) => call.table === "Waitlist" && call.method === "GET");
    assert.equal(tokenLookups.length, 2);
    const expertiseWrites = calls.filter((call) => call.table === "Professional Expertise" && ["POST", "PATCH"].includes(call.method));
    assert.equal(expertiseWrites.length, 12);
    const questionnaireWrite = calls.find((call) => call.table === "Waitlist" && call.body?.fields?.["Questionnaire Status"] === "Completed");
    assert.ok(questionnaireWrite);
    assert.deepEqual(Object.keys(questionnaireWrite.body.fields).filter((field) => !PROFESSIONAL_WRITABLE_FIELDS.includes(field)), []);
    assert.deepEqual(questionnaireWrite.body.fields["Experienced Client Stages"], ["recSTG01"]);
    assert.deepEqual(questionnaireWrite.body.fields["Working Settings"], ["recSET01"]);
    assert.deepEqual(questionnaireWrite.body.fields["Support Styles"], ["recSTY01"]);
    assert.deepEqual(questionnaireWrite.body.fields["Base Suburb"], []);
    assert.equal("Travel Charge" in questionnaireWrite.body.fields, false);
    assert.deepEqual(questionnaireWrite.body.fields["Client Work Modes"], ["I can travel to clients"]);
    assert.equal(questionnaireWrite.body.fields["Travels To Clients"], true);
    assert.equal("Qualification Status" in questionnaireWrite.body.fields, false);
    assert.equal("Insurance Status" in questionnaireWrite.body.fields, false);
    assert.equal("Approved for Matching" in questionnaireWrite.body.fields, false);
    assert.equal("Status" in questionnaireWrite.body.fields, false);
  });
});

test("expertise upserts use deterministic identifiers and never approve scope or evidence", async () => {
  const mock = createAirtableMock();
  await withMock(mock, async (calls) => {
    await submitProfessionalQuestionnaire(validProfessional({ expertise: validExpertise("Substantial or specialist") }));
    const writes = calls.filter((call) => call.table === "Professional Expertise" && call.method === "POST");
    assert.equal(writes[0].body.records[0].fields["Expertise Record"], "recProfessional123:OUT-01");
    for (const write of writes) {
      const fields = write.body.records[0].fields;
      assert.equal(fields["Match Factor"], 1); assert.equal(fields["Effective Factor"], 0.75);
      assert.equal("Scope Approved" in fields, false); assert.equal("Evidence Status" in fields, false);
    }
  });
});

test("existing expertise records are updated instead of duplicated", async () => {
  const mock = createAirtableMock({ existingExpertise: true });
  await withMock(mock, async (calls) => {
    await submitProfessionalQuestionnaire(validProfessional());
    assert.equal(calls.filter((call) => call.table === "Professional Expertise" && call.method === "PATCH").length, 12);
    assert.equal(calls.filter((call) => call.table === "Professional Expertise" && call.method === "POST").length, 0);
  });
});

test("failed expertise write never marks token Used", async () => {
  const mock = createAirtableMock({ failExpertiseWrite: true });
  await withMock(mock, async (calls) => {
    await assert.rejects(() => submitProfessionalQuestionnaire(validProfessional()));
    assert.equal(calls.some((call) => call.body?.fields?.["Invitation Token Status"] === "Used"), false);
    assert.equal(calls.some((call) => call.body?.fields?.["Questionnaire Status"] === "Completed"), false);
  });
});

test("Completed and Used are written atomically in exactly one final Waitlist PATCH", async () => {
  const mock = createAirtableMock();
  await withMock(mock, async (calls) => {
    await submitProfessionalQuestionnaire(validProfessional());
    const waitlistPatches = calls.filter((call) => call.table === "Waitlist" && call.recordId && call.method === "PATCH");
    assert.equal(waitlistPatches.length, 1);
    const finalPatch = waitlistPatches[0];
    assert.equal(finalPatch.body.fields["Questionnaire Status"], "Completed");
    assert.equal(finalPatch.body.fields["Invitation Token Status"], "Used");
    const finalExpertiseIndex = calls.map((call, index) => ({ call, index })).filter(({ call }) => call.table === "Professional Expertise" && ["POST", "PATCH"].includes(call.method)).at(-1).index;
    assert.ok(calls.indexOf(finalPatch) > finalExpertiseIndex);
    assert.equal(calls.some((call) => Object.keys(call.body?.fields || {}).length === 1 && call.body.fields["Invitation Token Status"] === "Used"), false);
  });
});

test("failed final Waitlist PATCH does not claim success", async () => {
  const mock = createAirtableMock({ failFinalWaitlistWrite: true });
  await withMock(mock, async (calls) => {
    await assert.rejects(() => submitProfessionalQuestionnaire(validProfessional()));
    assert.equal(calls.filter((call) => call.table === "Waitlist" && call.method === "PATCH").length, 1);
  });
});

test("client validation enforces outcome, settings and support-style maximums plus one stage", () => {
  const errors = validateClientSubmission(validClient({ selectedOutcomes: ["OUT-01", "OUT-02", "OUT-03"], preferredSettings: ["SET-01", "SET-02", "SET-03"], preferredSupportStyles: ["STY-01", "STY-02", "STY-03"], exerciseStage: ["STG-01", "STG-02"] }));
  assert.ok(errors.selectedOutcomes); assert.ok(errors.preferredSettings); assert.ok(errors.preferredSupportStyles); assert.ok(errors.exerciseStage);
});

test("client gender values are exact", () => {
  assert.deepEqual(CLIENT_GENDER_PREFERENCES, ["Woman", "Man", "No preference"]);
  assert.ok(validateClientSubmission(validClient({ genderPreference: "Prefer not to say" })).genderPreference);
});

test("client endpoint maps only approved fields and linked Airtable record IDs", async () => {
  const mock = createAirtableMock();
  await withMock(mock, async (calls) => {
    await createClientQuestionnaire(validClient());
    const create = calls.find((call) => call.table === "Clients" && call.method === "POST");
    const fields = create.body.records[0].fields;
    assert.deepEqual(Object.keys(fields), CLIENT_WRITABLE_FIELDS);
    assert.equal(fields["Client Name"], "Test Client"); assert.equal(fields["Phone Number"], "0210000000");
    assert.deepEqual(fields["Selected Outcomes"], ["recOUT01"]); assert.deepEqual(fields["Selected Considerations"], ["recCON01"]);
    assert.deepEqual(fields["Exercise Stage"], ["recSTG01"]); assert.deepEqual(fields["Suburb"], ["recAREAONLINE"]);
    assert.equal(fields["Matching Status"], "Ready"); assert.equal(fields["Is Test Record"], true);
    assert.equal("Selected Matches" in fields, false); assert.equal("Assigned Professional" in fields, false);
  });
});

test("invitation generator verifies record, stores only hash and outputs URL once", async () => {
  const mock = createAirtableMock({ tokenRecords: [] });
  await withMock(mock, async (calls) => {
    const url = await generateProfessionalInvitation({ professionalRecordId: "recProfessional123", expiry: FUTURE_EXPIRY, origin: "https://questionnaire.example" });
    const raw = new URL(url).searchParams.get("token");
    assert.equal(isValidInvitationToken(raw), true);
    const patch = calls.find((call) => call.table === "Waitlist" && call.recordId === "recProfessional123" && call.method === "PATCH");
    assert.equal(patch.body.fields["Invitation Token Hash"], hashInvitationToken(raw));
    assert.equal(patch.body.fields["Invitation Token Status"], "Active");
    assert.equal(JSON.stringify(patch.body).includes(raw), false);
    assert.equal(calls.some((call) => call.method === "POST" && call.table === "Waitlist"), false);
  });
});

test("invitation generator requires a future expiry and explicit HTTP origin", async () => {
  installEnv();
  await assert.rejects(() => generateProfessionalInvitation({ professionalRecordId: "recProfessional123", expiry: "2020-01-01", origin: "https://questionnaire.example" }), /future expiry/i);
  await assert.rejects(() => generateProfessionalInvitation({ professionalRecordId: "recProfessional123", expiry: FUTURE_EXPIRY, origin: "file:///tmp" }), /HTTP or HTTPS/i);
});

test("hidden implementation does not call public waitlist, email or production base", async () => {
  const files = ["app/components/HiddenMatchingQuestionnaire.tsx", "app/api/matching-staging/professional/route.js", "app/api/matching-staging/client/route.js", "app/lib/staging-airtable.js"];
  const source = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(source, /\/api\/waitlist/); assert.doesNotMatch(source, /sendConfirmationEmail|resend\.com/); assert.doesNotMatch(source, /appgYLxrpdZXXULDf/);
});

test("hidden layouts remain noindex and nofollow", async () => {
  const source = `${await readFile("app/professional-questionnaire/layout.tsx", "utf8")}\n${await readFile("app/client-matching-test/layout.tsx", "utf8")}`;
  assert.match(source, /index: false/); assert.match(source, /follow: false/);
});

test("public route files remain unchanged from main", async () => {
  const { execFileSync } = await import("node:child_process");
  const paths = ["app/page.tsx", "app/register/page.tsx", "app/find-your-fit/page.tsx", "app/api/waitlist/route.js", "app/api/early-access/route.js"];
  const diff = execFileSync("git", ["diff", "--name-only", "main", "--", ...paths], { encoding: "utf8" });
  assert.equal(diff.trim(), "");
});

test("server responses and committed source never contain Airtable credentials or plaintext tokens", async () => {
  const source = await readFile("app/lib/staging-airtable.js", "utf8");
  assert.doesNotMatch(source, /Questionnaire Token|AIRTABLE_MATCHING_TOKEN_FIELD|Professionals/);
  assert.equal(PROFESSIONAL_WRITABLE_FIELDS.includes("Invitation Token Hash"), false);
});

test("client API failure response never exposes Airtable credentials", async () => {
  installEnv(); process.env.AIRTABLE_MATCHING_BASE_ID = "wrong-base";
  const { POST } = await import("../app/api/matching-staging/client/route.js");
  const response = await POST(new Request("https://questionnaire.example/api/matching-staging/client", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(validClient()) }));
  const body = await response.text();
  assert.equal(response.status, 404); assert.doesNotMatch(body, /secret-test-pat|wrong-base|apphwcmdSVSl7H0iR/);
});

test("professional API returns the same generic response for unknown and revoked tokens", async () => {
  installEnv();
  const { GET } = await import("../app/api/matching-staging/professional/route.js");
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = createAirtableMock({ tokenRecords: [] }).fetchMock;
    const unknown = await GET(new Request(`https://questionnaire.example/api/matching-staging/professional?token=${RAW_TOKEN}`));
    globalThis.fetch = createAirtableMock({ tokenRecords: [{ id: "rec1", fields: { "Invitation Token Status": "Revoked", "Invitation Token Expiry": FUTURE_EXPIRY } }] }).fetchMock;
    const revoked = await GET(new Request(`https://questionnaire.example/api/matching-staging/professional?token=${RAW_TOKEN}`));
    assert.equal(unknown.status, 404); assert.equal(revoked.status, 404);
    assert.deepEqual(await unknown.json(), await revoked.json());
  } finally { globalThis.fetch = originalFetch; }
});

test("client test access is unavailable without separate secret or authentication cookie", async () => {
  installEnv();
  assert.equal(isClientTestCookieValid(undefined), false);
  delete process.env.MATCHING_CLIENT_TEST_SECRET;
  assert.throws(() => isClientTestCookieValid(undefined), StagingConfigError);
  const pageSource = await readFile("app/client-matching-test/page.tsx", "utf8");
  assert.match(pageSource, /isClientTestCookieValid/);
  assert.match(pageSource, /clientAuthenticated/);
});

test("client API refuses unauthenticated requests with a generic unavailable response", async () => {
  installEnv();
  const { POST } = await import("../app/api/matching-staging/client/route.js");
  const response = await POST(new Request("https://questionnaire.example/api/matching-staging/client", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(validClient()) }));
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "This facility is unavailable." });
});

test("client location validation accepts stable LINZ IDs and rejects uncontrolled values", () => {
  assert.equal(validateClientSubmission(validClient({ suburb: "AREA-LINZ-101" })).suburb, undefined);
  assert.ok(validateClientSubmission(validClient({ suburb: "Herne Bay" })).suburb);
});

test("authenticated client location API returns canonical Service Areas", async () => {
  const serviceAreaRecords = [{ id: "recArea101", fields: { "Area Name": "Herne Bay", "Area ID": "AREA-LINZ-101", "Region Name": "Auckland Region", "Region ID": "02", "Location Type": "Suburb", Online: false, Status: "Canonical" } }];
  const mock = createAirtableMock({ serviceAreaRecords });
  await withMock(mock, async () => {
    const { POST: authenticate } = await import("../app/api/matching-staging/client-auth/route.js");
    const { GET: getLocations } = await import("../app/api/matching-staging/client/route.js");
    const authResponse = await authenticate(new Request("https://questionnaire.example/api/matching-staging/client-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: process.env.MATCHING_CLIENT_TEST_SECRET }) }));
    const response = await getLocations(new Request("https://questionnaire.example/api/matching-staging/client", { headers: { Cookie: authResponse.headers.get("set-cookie") } }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { serviceAreas: [{ id: "AREA-LINZ-101", label: "Herne Bay", regionName: "Auckland Region", regionId: "02", locationType: "Suburb", online: false }] });
  });
});

test("wrong and missing client-test passwords receive the same generic failure", async () => {
  installEnv();
  const { POST } = await import("../app/api/matching-staging/client-auth/route.js");
  const makeRequest = (body) => new Request("https://questionnaire.example/api/matching-staging/client-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const wrong = await POST(makeRequest({ password: "wrong" }));
  const missing = await POST(makeRequest({}));
  assert.equal(wrong.status, 404); assert.equal(missing.status, 404);
  assert.deepEqual(await wrong.json(), await missing.json());
});

test("valid client-test authentication issues a secure limited cookie and permits client API access", async () => {
  const mock = createAirtableMock();
  await withMock(mock, async () => {
    const { POST: authenticate } = await import("../app/api/matching-staging/client-auth/route.js");
    const { POST: createClient } = await import("../app/api/matching-staging/client/route.js");
    const authResponse = await authenticate(new Request("https://questionnaire.example/api/matching-staging/client-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: process.env.MATCHING_CLIENT_TEST_SECRET }) }));
    assert.equal(authResponse.status, 200);
    const setCookie = authResponse.headers.get("set-cookie");
    assert.match(setCookie, new RegExp(`^${CLIENT_TEST_COOKIE_NAME}=`));
    assert.match(setCookie, /HttpOnly/i); assert.match(setCookie, /SameSite=Strict/i); assert.match(setCookie, /Max-Age=1800/i); assert.match(setCookie, /Secure/i);
    assert.doesNotMatch(setCookie, new RegExp(process.env.MATCHING_CLIENT_TEST_SECRET));
    const clientResponse = await createClient(new Request("https://questionnaire.example/api/matching-staging/client", { method: "POST", headers: { "Content-Type": "application/json", Cookie: setCookie }, body: JSON.stringify(validClient()) }));
    assert.equal(clientResponse.status, 200); assert.deepEqual(await clientResponse.json(), { ok: true });
  });
});

test("client-test authentication does not grant professional questionnaire access", async () => {
  const mock = createAirtableMock();
  await withMock(mock, async () => {
    const { POST: authenticate } = await import("../app/api/matching-staging/client-auth/route.js");
    const { GET: getProfessional } = await import("../app/api/matching-staging/professional/route.js");
    const authResponse = await authenticate(new Request("https://questionnaire.example/api/matching-staging/client-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: process.env.MATCHING_CLIENT_TEST_SECRET }) }));
    const response = await getProfessional(new Request("https://questionnaire.example/api/matching-staging/professional", { headers: { Cookie: authResponse.headers.get("set-cookie") } }));
    assert.equal(response.status, 404);
  });
});

test("professional questionnaire works independently of the client-test secret", async () => {
  const mock = createAirtableMock();
  await withMock(mock, async () => {
    delete process.env.MATCHING_CLIENT_TEST_SECRET;
    const { GET } = await import("../app/api/matching-staging/professional/route.js");
    const response = await GET(new Request(`https://questionnaire.example/api/matching-staging/professional?token=${RAW_TOKEN}`));
    assert.equal(response.status, 200);
  });
});

test("client-test secret is never returned, logged or embedded in page source", async () => {
  installEnv();
  const { POST } = await import("../app/api/matching-staging/client-auth/route.js");
  const response = await POST(new Request("http://localhost/api/matching-staging/client-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: process.env.MATCHING_CLIENT_TEST_SECRET }) }));
  assert.doesNotMatch(await response.text(), new RegExp(process.env.MATCHING_CLIENT_TEST_SECRET));
  assert.doesNotMatch(response.headers.get("set-cookie"), new RegExp(process.env.MATCHING_CLIENT_TEST_SECRET));
  const source = `${await readFile("app/client-matching-test/page.tsx", "utf8")}\n${await readFile("app/components/HiddenMatchingQuestionnaire.tsx", "utf8")}`;
  assert.doesNotMatch(source, /separate-client-test-password/);
});

test("missing, wrong and client-test admin passwords receive the same generic failure", async () => {
  installEnv();
  const { POST } = await import("../app/api/matching-staging/invitation-auth/route.js");
  const request = (password) => new Request("https://questionnaire.example/api/matching-staging/invitation-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
  const wrong = await POST(request("wrong"));
  const clientSecret = await POST(request(process.env.MATCHING_CLIENT_TEST_SECRET));
  delete process.env.MATCHING_INVITATION_ADMIN_SECRET;
  const missing = await POST(request("separate-invitation-admin-password"));
  assert.equal(wrong.status, 404); assert.equal(clientSecret.status, 404); assert.equal(missing.status, 404);
  assert.deepEqual(await wrong.json(), await clientSecret.json());
  assert.deepEqual(await missing.json(), { error: "This facility is unavailable." });
});

test("invitation admin cookie is signed and expires server-side at 15 minutes", () => {
  installEnv();
  const issued = new Date("2026-08-03T00:00:00.000Z");
  const header = createInvitationAdminCookieHeader("https://questionnaire.example", { now: issued });
  const value = header.split(";")[0].slice(`${INVITATION_ADMIN_COOKIE_NAME}=`.length);
  assert.match(header, new RegExp(`^${INVITATION_ADMIN_COOKIE_NAME}=`));
  assert.match(header, /HttpOnly/i); assert.match(header, /SameSite=Strict/i); assert.match(header, /Secure/i);
  assert.match(header, new RegExp(`Max-Age=${INVITATION_ADMIN_COOKIE_MAX_AGE}`)); assert.match(header, /Expires=/i);
  assert.equal(isInvitationAdminCookieValid(value, { now: new Date(issued.getTime() + 899_000) }), true);
  assert.equal(isInvitationAdminCookieValid(value, { now: new Date(issued.getTime() + 900_000) }), false);
  assert.equal(isInvitationAdminCookieValid(`${value.slice(0, -1)}0`, { now: issued }), false);
  assert.doesNotMatch(header, new RegExp(process.env.MATCHING_INVITATION_ADMIN_SECRET));
});

test("unauthenticated invitation requests receive a generic unavailable response", async () => {
  installEnv();
  const { POST } = await import("../app/api/matching-staging/invitations/route.js");
  const response = await POST(new Request("https://questionnaire.example/api/matching-staging/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify", professionalRecordId: "recProfessional123" }) }));
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "This facility is unavailable." });
});

test("authenticated admin verifies one exact Waitlist professional and returns Name", async () => {
  const mock = createAirtableMock({ tokenRecords: [] });
  await withMock(mock, async (calls) => {
    const { POST: authenticate } = await import("../app/api/matching-staging/invitation-auth/route.js");
    const { POST: invitations } = await import("../app/api/matching-staging/invitations/route.js");
    const auth = await authenticate(new Request("https://questionnaire.example/api/matching-staging/invitation-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: process.env.MATCHING_INVITATION_ADMIN_SECRET }) }));
    const response = await invitations(new Request("https://questionnaire.example/api/matching-staging/invitations", { method: "POST", headers: { "Content-Type": "application/json", Cookie: auth.headers.get("set-cookie") }, body: JSON.stringify({ action: "verify", professionalRecordId: "recProfessional123" }) }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { professional: { id: "recProfessional123", name: "Alex" } });
    assert.deepEqual(calls.map(({ table, recordId, method }) => ({ table, recordId, method })), [{ table: "Waitlist", recordId: "recProfessional123", method: "GET" }]);
  });
});

test("admin generation writes only the three invitation fields and never creates Waitlist records", async () => {
  const mock = createAirtableMock({ tokenRecords: [] });
  await withMock(mock, async (calls) => {
    const { POST: authenticate } = await import("../app/api/matching-staging/invitation-auth/route.js");
    const { POST: invitations } = await import("../app/api/matching-staging/invitations/route.js");
    const auth = await authenticate(new Request("https://questionnaire.example/api/matching-staging/invitation-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: process.env.MATCHING_INVITATION_ADMIN_SECRET }) }));
    const response = await invitations(new Request("https://questionnaire.example/api/matching-staging/invitations", { method: "POST", headers: { "Content-Type": "application/json", Cookie: auth.headers.get("set-cookie") }, body: JSON.stringify({ action: "generate", professionalRecordId: "recProfessional123", expiry: FUTURE_EXPIRY, origin: "https://preview.example" }) }));
    assert.equal(response.status, 200);
    const patch = calls.find((call) => call.table === "Waitlist" && call.method === "PATCH");
    assert.deepEqual(Object.keys(patch.body.fields), ["Invitation Token Hash", "Invitation Token Expiry", "Invitation Token Status"]);
    assert.equal(patch.body.fields["Invitation Token Expiry"], FUTURE_EXPIRY);
    assert.equal(patch.body.fields["Invitation Token Status"], "Active");
    assert.equal("Status" in patch.body.fields, false);
    assert.equal("Approved for Matching" in patch.body.fields, false);
    assert.equal(calls.some((call) => call.table === "Waitlist" && call.method === "POST"), false);
  });
});

test("admin generation never stores or logs the plaintext token and outputs its link exactly once", async () => {
  const mock = createAirtableMock({ tokenRecords: [] });
  await withMock(mock, async (calls) => {
    const messages = [];
    const originalError = console.error;
    const originalLog = console.log;
    console.error = (...args) => messages.push(args.join(" "));
    console.log = (...args) => messages.push(args.join(" "));
    try {
      const { POST: authenticate } = await import("../app/api/matching-staging/invitation-auth/route.js");
      const { POST: invitations } = await import("../app/api/matching-staging/invitations/route.js");
      const auth = await authenticate(new Request("https://questionnaire.example/api/matching-staging/invitation-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: process.env.MATCHING_INVITATION_ADMIN_SECRET }) }));
      const response = await invitations(new Request("https://questionnaire.example/api/matching-staging/invitations", { method: "POST", headers: { "Content-Type": "application/json", Cookie: auth.headers.get("set-cookie") }, body: JSON.stringify({ action: "generate", professionalRecordId: "recProfessional123", expiry: FUTURE_EXPIRY, origin: "https://preview.example" }) }));
      const data = await response.json();
      const rawToken = new URL(data.invitationUrl).searchParams.get("token");
      assert.equal(isValidInvitationToken(rawToken), true);
      assert.equal(JSON.stringify(data).split(rawToken).length - 1, 1);
      assert.equal(JSON.stringify(calls).includes(rawToken), false);
      assert.equal(messages.join("\n").includes(rawToken), false);
      assert.equal(calls.find((call) => call.method === "PATCH").body.fields["Invitation Token Hash"], hashInvitationToken(rawToken));
    } finally {
      console.error = originalError;
      console.log = originalLog;
    }
  });
});

test("invitation administration has no email, public API, listing or public navigation path", async () => {
  const files = [
    "app/components/MatchingInvitationAdmin.tsx",
    "app/api/matching-staging/invitation-auth/route.js",
    "app/api/matching-staging/invitations/route.js",
    "app/matching-invitation-admin/page.tsx",
  ];
  const source = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(source, /\/api\/waitlist|sendConfirmationEmail|resend\.com/);
  assert.doesNotMatch(source, /listByFormula|AIRTABLE_MATCHING_TOKEN|MATCHING_CLIENT_TEST_SECRET/);
  for (const publicFile of ["app/page.tsx", "app/register/page.tsx", "app/find-your-fit/page.tsx"]) {
    assert.doesNotMatch(await readFile(publicFile, "utf8"), /matching-invitation-admin/);
  }
});

test("invitation admin page is noindex and the staging example keeps its secret empty", async () => {
  const layout = await readFile("app/matching-invitation-admin/layout.tsx", "utf8");
  const example = await readFile(".env.matching-staging.example", "utf8");
  assert.match(layout, /index: false/); assert.match(layout, /follow: false/);
  assert.match(example, /^MATCHING_INVITATION_ADMIN_SECRET=$/m);
  assert.doesNotMatch(example, /^MATCHING_INVITATION_ADMIN_SECRET=.+$/m);
});
