import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  AVAILABILITY_OPTIONS,
  CLIENT_GENDER_PREFERENCES,
  EXERCISE_STAGES,
  EXPERIENCE_FACTORS,
  EXPERTISE_OPTIONS,
  INSURANCE_CONFIRMATIONS,
  PROFESSIONAL_GENDERS,
  PROFESSIONAL_QUESTIONS,
  PROFESSIONAL_ROLES,
  SETTINGS,
  SUPPORT_STYLES,
  factorsForSubmittedLevel,
  isValidInvitationToken,
  validateClientSubmission,
  validateProfessionalSubmission,
} from "../app/lib/matching-questionnaires.js";
import {
  CLIENT_WRITABLE_FIELDS,
  CLIENT_TEST_COOKIE_NAME,
  InvitationTokenError,
  PROFESSIONAL_WRITABLE_FIELDS,
  StagingConfigError,
  createClientQuestionnaire,
  findProfessionalByInvitationToken,
  generateProfessionalInvitation,
  getStagingConfig,
  hashInvitationToken,
  isClientTestCookieValid,
  submitProfessionalQuestionnaire,
} from "../app/lib/staging-airtable.js";

const RAW_TOKEN = "a".repeat(43);
const TOKEN_HASH = hashInvitationToken(RAW_TOKEN);
const FUTURE_EXPIRY = "2999-01-01T00:00:00.000Z";

function installEnv() {
  process.env.MATCHING_STAGING_ENABLED = "true";
  process.env.AIRTABLE_MATCHING_BASE_ID = "apphwcmdSVSl7H0iR";
  process.env.AIRTABLE_MATCHING_TOKEN = "secret-test-pat";
  process.env.MATCHING_QUESTIONNAIRE_ORIGIN = "https://questionnaire.example";
  process.env.MATCHING_CLIENT_TEST_SECRET = "separate-client-test-password";
}

function validExpertise(level = "None") {
  return Object.fromEntries(EXPERTISE_OPTIONS.map(({ id }) => [id, { submittedLevel: level, evidence: "", approximateClientsSupported: "0" }]));
}

function validProfessional(overrides = {}) {
  return {
    token: RAW_TOKEN,
    roles: [PROFESSIONAL_ROLES[0]],
    matchingQualifications: "Level 4 Certificate",
    matchingTrainingProvider: "Approved provider",
    matchingQualificationYear: "2024",
    matchingProfessionalRegistration: "Registration body",
    matchingRegistrationNumber: "REG-1",
    matchingInsuranceConfirmation: "Yes",
    matchingInsuranceDetails: "Policy details",
    structuredAvailability: AVAILABILITY_OPTIONS[0],
    experiencedClientStages: [EXERCISE_STAGES[0].id],
    expertise: validExpertise(),
    workingSettings: [SETTINGS[0].id],
    baseSuburb: "",
    travelAreas: ["AREA-ONLINE"],
    travelsToClients: true,
    travelCharge: "10",
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

function createAirtableMock({ tokenRecords, failExpertiseWrite = false, failFinalWaitlistWrite = false, existingExpertise = false } = {}) {
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
      if ("Travel Charge" in writtenFields) assert.equal(typeof writtenFields["Travel Charge"], "string", "Waitlist.Travel Charge must be text");
      assert.equal(typeof writtenFields["Matching Qualification Year"], "number", "Waitlist.Matching Qualification Year must be a number");
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
      const ids = [...formula.matchAll(/="([A-Z]+-[A-Z0-9]+)"/g)].map((match) => match[1]);
      return jsonResponse({ records: ids.map((id) => ({ id: `rec${id.replace(/-/g, "")}`, fields: { [idFields[table]]: id } })) });
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

test("professional must supply either canonical Base Suburb or Other Area", () => {
  const errors = validateProfessionalSubmission(validProfessional({ baseSuburb: "", otherArea: "" }));
  assert.ok(errors.otherArea);
});

test("invalid Base Suburb Area ID is rejected", () => {
  const errors = validateProfessionalSubmission(validProfessional({ baseSuburb: "AREA-AUCKLAND", otherArea: "" }));
  assert.ok(errors.baseSuburb);
});

test("canonical AREA-ONLINE Base Suburb resolves to a linked record array", async () => {
  const mock = createAirtableMock();
  await withMock(mock, async (calls) => {
    await submitProfessionalQuestionnaire(validProfessional({ baseSuburb: "AREA-ONLINE", otherArea: "" }));
    const fields = calls.find((call) => call.body?.fields?.["Questionnaire Status"] === "Completed").body.fields;
    assert.deepEqual(fields["Base Suburb"], ["recAREAONLINE"]);
    assert.equal(fields["Other Area"], "");
  });
});

test("free-text suburb is stored only in Other Area and Base Suburb remains an empty linked array", async () => {
  const mock = createAirtableMock();
  await withMock(mock, async (calls) => {
    await submitProfessionalQuestionnaire(validProfessional({ baseSuburb: "", otherArea: "Herne Bay" }));
    const fields = calls.find((call) => call.body?.fields?.["Questionnaire Status"] === "Completed").body.fields;
    assert.deepEqual(fields["Base Suburb"], []);
    assert.equal(fields["Other Area"], "Herne Bay");
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
    assert.equal(questionnaireWrite.body.fields["Travel Charge"], "10");
    assert.equal(typeof questionnaireWrite.body.fields["Travel Charge"], "string");
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
