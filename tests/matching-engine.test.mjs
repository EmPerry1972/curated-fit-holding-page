import assert from "node:assert/strict";
import test from "node:test";

import {
  assertDryRunConfiguration,
  calculateDryRunMatches,
  matchResultFields,
} from "../app/lib/matching-engine.js";
import {
  REQUIRED_MAIN_MATCHING_BASE_ID,
  StagingConfigError,
  createClientQuestionnaire,
  getClientMatchingConfig,
  getStagingConfig,
} from "../app/lib/staging-airtable.js";

const record = (id, fields) => ({ id, fields });
const option = (id, category, safetySensitive = false) => record(id, {
  "Option Name": id,
  Category: category,
  "Safety-sensitive": safetySensitive,
});
const config = record("recConfig", {
  "Dry Run": true,
  "Internal Selection Enabled": false,
  "Minimum Match Score": 65,
  "Waitlist Advantage Threshold": 5,
});
const client = record("recClient", {
  "Selected Outcomes": ["recOutcome"],
  "Selected Considerations": ["recConsideration"],
  "Exercise Stage": ["recStage"],
  "Preferred Settings": ["recOnline"],
  "Preferred Support Styles": ["recStyle"],
  "Gender Preference": "No preference",
});
const professional = (id, availability = "Yes") => record(id, {
  "Questionnaire Status": "Completed",
  "Qualification Status": "Verified",
  "Insurance Status": "Verified",
  "Approved for Matching": true,
  "Structured Availability": availability,
  "Experienced Client Stages": ["recStage"],
  "Working Settings": ["recOnline"],
  "Support Styles": ["recStyle"],
  Gender: "Woman",
});
const expertise = (professionalId, optionId, level, extra = {}) => record(`${professionalId}:${optionId}`, {
  Professional: [professionalId],
  "Expertise Option": [optionId],
  "Submitted Level": level,
  "Evidence Status": extra.evidenceStatus || "Not required",
  "Scope Approved": extra.scopeApproved === true,
});

function withEnvironment(values, callback) {
  const previous = Object.fromEntries(Object.keys(values).map((name) => [name, process.env[name]]));
  for (const [name, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  try { return callback(); }
  finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

async function withEnvironmentAsync(values, callback) {
  const previous = Object.fromEntries(Object.keys(values).map((name) => [name, process.env[name]]));
  for (const [name, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  try { return await callback(); }
  finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

function calculate({ professionals = [professional("recPro")], expertiseRecords, testClient = client } = {}) {
  return calculateDryRunMatches({
    client: testClient,
    professionals,
    expertiseRecords: expertiseRecords || [
      expertise("recPro", "recOutcome", "Substantial or specialist", { evidenceStatus: "Verified" }),
      expertise("recPro", "recConsideration", "Regular", { scopeApproved: true }),
    ],
    expertiseOptions: [option("recOutcome", "Outcome"), option("recConsideration", "Consideration")],
    onlineSettingId: "recOnline",
    homeSettingId: "recHome",
    configRecord: config,
  });
}

test("dry-run configuration blocks live selection or missing dry run", () => {
  assert.throws(() => assertDryRunConfiguration(record("bad", { ...config.fields, "Dry Run": false })), /Dry Run/);
  assert.throws(() => assertDryRunConfiguration(record("bad", { ...config.fields, "Internal Selection Enabled": true })), /Internal Selection/);
});

test("client rollout accepts only the exact main base with a separate token and dry-run lock", () => {
  withEnvironment({
    MATCHING_CLIENT_ROLLOUT_ENABLED: "true",
    MATCHING_ROLLOUT_DRY_RUN_ONLY: "true",
    AIRTABLE_MATCHING_ROLLOUT_BASE_ID: REQUIRED_MAIN_MATCHING_BASE_ID,
    AIRTABLE_MATCHING_ROLLOUT_TOKEN: "rollout-token",
  }, () => {
    const rollout = getClientMatchingConfig();
    assert.equal(rollout.mode, "rollout");
    assert.equal(rollout.baseId, REQUIRED_MAIN_MATCHING_BASE_ID);
  });
});

test("client rollout refuses a wrong base or a disabled dry-run lock", () => {
  const common = {
    MATCHING_CLIENT_ROLLOUT_ENABLED: "true",
    AIRTABLE_MATCHING_ROLLOUT_TOKEN: "rollout-token",
  };
  withEnvironment({ ...common, MATCHING_ROLLOUT_DRY_RUN_ONLY: "true", AIRTABLE_MATCHING_ROLLOUT_BASE_ID: "appWrong" }, () => {
    assert.throws(() => getClientMatchingConfig(), StagingConfigError);
  });
  withEnvironment({ ...common, MATCHING_ROLLOUT_DRY_RUN_ONLY: "false", AIRTABLE_MATCHING_ROLLOUT_BASE_ID: REQUIRED_MAIN_MATCHING_BASE_ID }, () => {
    assert.throws(() => getClientMatchingConfig(), StagingConfigError);
  });
});

test("professional staging configuration never switches to the main rollout base", () => {
  withEnvironment({
    MATCHING_CLIENT_ROLLOUT_ENABLED: "true",
    MATCHING_ROLLOUT_DRY_RUN_ONLY: "true",
    AIRTABLE_MATCHING_ROLLOUT_BASE_ID: REQUIRED_MAIN_MATCHING_BASE_ID,
    AIRTABLE_MATCHING_ROLLOUT_TOKEN: "rollout-token",
    MATCHING_STAGING_ENABLED: "true",
    AIRTABLE_MATCHING_BASE_ID: "apphwcmdSVSl7H0iR",
    AIRTABLE_MATCHING_TOKEN: "staging-token",
  }, () => {
    const staging = getStagingConfig();
    assert.equal(staging.mode, "staging");
    assert.equal(staging.baseId, "apphwcmdSVSl7H0iR");
    assert.equal(staging.token, "staging-token");
  });
});

test("validated weighting reproduces a 92.5 match", () => {
  const result = calculate();
  assert.equal(result.clientIssues.length, 0);
  assert.equal(result.candidates[0].normalisedScore, 92.5);
  assert.equal(result.candidates[0].dryRunResult, true);
  assert.equal(result.candidates[0].suggestedRank, 1);
});

test("validated weighting reproduces a 90 match", () => {
  const result = calculate({
    expertiseRecords: [
      expertise("recPro", "recOutcome", "Regular"),
      expertise("recPro", "recConsideration", "Substantial or specialist", { evidenceStatus: "Verified", scopeApproved: true }),
    ],
  });
  assert.equal(result.candidates[0].normalisedScore, 90);
});

test("unverified specialist experience remains capped at 0.75", () => {
  const result = calculate({
    expertiseRecords: [
      expertise("recPro", "recOutcome", "Substantial or specialist"),
      expertise("recPro", "recConsideration", "Substantial or specialist", { scopeApproved: true }),
    ],
  });
  assert.equal(result.candidates[0].outcomeScore, 75);
  assert.equal(result.candidates[0].considerationScore, 75);
});

test("safety-sensitive consideration requires approved scope", () => {
  const result = calculateDryRunMatches({
    client,
    professionals: [professional("recPro")],
    expertiseRecords: [
      expertise("recPro", "recOutcome", "Regular"),
      expertise("recPro", "recConsideration", "Regular"),
    ],
    expertiseOptions: [option("recOutcome", "Outcome"), option("recConsideration", "Consideration", true)],
    onlineSettingId: "recOnline",
    homeSettingId: "recHome",
    configRecord: config,
  });
  assert.equal(result.candidates[0].eligible, false);
  assert.match(result.candidates[0].eligibilityReasons.join(" "), /Safety scope not approved/);
});

test("availability wins inside the configured score threshold", () => {
  const professionals = [professional("recWait", "Not currently, but I am accepting waitlist enquiries"), professional("recAvailable")];
  const expertiseRecords = professionals.flatMap(({ id }) => [
    expertise(id, "recOutcome", id === "recWait" ? "Substantial or specialist" : "Regular", { evidenceStatus: "Verified" }),
    expertise(id, "recConsideration", id === "recWait" ? "Regular" : "Substantial or specialist", {
      evidenceStatus: "Verified",
      scopeApproved: true,
    }),
  ]);
  const result = calculate({ professionals, expertiseRecords });
  const available = result.candidates.find((item) => item.professionalId === "recAvailable");
  assert.equal(available.suggestedRank, 1);
});

test("only the first three threshold-qualified candidates are dry-run results", () => {
  const professionals = ["recP1", "recP2", "recP3", "recP4"].map((id) => professional(id));
  const expertiseRecords = professionals.flatMap(({ id }) => [
    expertise(id, "recOutcome", "Regular"),
    expertise(id, "recConsideration", "Regular", { scopeApproved: true }),
  ]);
  const result = calculate({ professionals, expertiseRecords });
  assert.equal(result.candidates.filter((item) => item.dryRunResult).length, 3);
});

test("stored result fields never select or assign a professional", () => {
  const candidate = calculate().candidates[0];
  const fields = matchResultFields(candidate, new Date("2026-08-05T00:00:00.000Z"));
  assert.equal(fields["Auto-selected"], false);
  assert.equal(fields["Selected Internally"], false);
  assert.equal(fields["Dry Run Result"], true);
  assert.equal(fields["Match ID"], "recClient::recPro");
  assert.equal("Selected Matches" in fields, false);
});

test("rollout submission writes one client and idempotent match results without assignments or contact actions", async () => {
  const originalFetch = global.fetch;
  const writes = [];
  global.fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const segments = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
    const table = segments[2];
    const method = init.method || "GET";
    const body = init.body ? JSON.parse(init.body) : null;
    if (method !== "GET") writes.push({ table, method, body });
    const formula = url.searchParams.get("filterByFormula") || "";
    const all = url.searchParams.get("pageSize") === "100";

    if (method === "POST" && table === "Clients") return Response.json({ records: [record("recClient", body.records[0].fields)] });
    if (method === "POST" && table === "Automated Match Results") return Response.json({ records: [record("recMatch", body.records[0].fields)] });
    if (table === "Expertise Options") {
      if (all) return Response.json({ records: [option("recOutcome", "Outcome"), option("recConsideration", "Consideration")] });
      if (formula.includes("OUT-01")) return Response.json({ records: [record("recOutcome", { "Option ID": "OUT-01" })] });
      return Response.json({ records: [record("recConsideration", { "Option ID": "CON-01" })] });
    }
    if (table === "Exercise Stages") return Response.json({ records: [record("recStage", { "Stage ID": "STG-01" })] });
    if (table === "Support Styles") return Response.json({ records: [record("recStyle", { "Style ID": "STY-01" })] });
    if (table === "Service Areas") return Response.json({ records: [record("recArea", { "Area ID": "AREA-ONLINE" })] });
    if (table === "Settings") {
      if (all) return Response.json({ records: [
        record("recHome", { "Setting ID": "SET-01" }),
        record("recOnline", { "Setting ID": "SET-06" }),
      ] });
      return Response.json({ records: [record("recOnline", { "Setting ID": "SET-06" })] });
    }
    if (table === "Waitlist") return Response.json({ records: [professional("recPro")] });
    if (table === "Professional Expertise") return Response.json({ records: [
      expertise("recPro", "recOutcome", "Substantial or specialist", { evidenceStatus: "Verified" }),
      expertise("recPro", "recConsideration", "Regular", { scopeApproved: true }),
    ] });
    if (table === "Matching Configuration") return Response.json({ records: [config] });
    if (table === "Automated Match Results") return Response.json({ records: [] });
    throw new Error(`Unexpected Airtable request: ${method} ${table}`);
  };

  try {
    await withEnvironmentAsync({
      MATCHING_CLIENT_ROLLOUT_ENABLED: "true",
      MATCHING_ROLLOUT_DRY_RUN_ONLY: "true",
      AIRTABLE_MATCHING_ROLLOUT_BASE_ID: REQUIRED_MAIN_MATCHING_BASE_ID,
      AIRTABLE_MATCHING_ROLLOUT_TOKEN: "rollout-token",
    }, async () => {
      await createClientQuestionnaire({
        clientName: "Phase A Client",
        email: "phase-a@example.com",
        phoneNumber: "",
        selectedOutcomes: ["OUT-01"],
        selectedConsiderations: ["CON-01"],
        exerciseStage: "STG-01",
        preferredSettings: ["SET-06"],
        suburb: "AREA-ONLINE",
        postcode: "1010",
        preferredSupportStyles: ["STY-01"],
        genderPreference: "No preference",
      });
    });
  } finally {
    global.fetch = originalFetch;
  }

  const clientWrites = writes.filter((item) => item.table === "Clients");
  const matchWrites = writes.filter((item) => item.table === "Automated Match Results");
  assert.equal(clientWrites.length, 1);
  assert.equal(matchWrites.length, 1);
  assert.equal(clientWrites[0].body.records[0].fields["Matching Status"], "Ready");
  assert.equal("Selected Matches" in clientWrites[0].body.records[0].fields, false);
  assert.equal(matchWrites[0].body.records[0].fields["Auto-selected"], false);
  assert.equal(matchWrites[0].body.records[0].fields["Selected Internally"], false);
  assert.equal(writes.some((item) => item.table === "Waitlist Requests"), false);
});
