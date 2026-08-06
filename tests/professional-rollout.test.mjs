import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  PROFESSIONAL_WRITABLE_FIELDS,
  REQUIRED_MAIN_MATCHING_BASE_ID,
  StagingConfigError,
  getProfessionalMatchingConfig,
} from "../app/lib/staging-airtable.js";
import { GET as getRolloutStatus } from "../app/api/matching-rollout-check/route.js";

const ENV_KEYS = [
  "MATCHING_STAGING_ENABLED",
  "AIRTABLE_MATCHING_BASE_ID",
  "AIRTABLE_MATCHING_TOKEN",
  "MATCHING_QUESTIONNAIRE_ORIGIN",
  "MATCHING_PROFESSIONAL_ROLLOUT_ENABLED",
  "MATCHING_PROFESSIONAL_ROLLOUT_REVIEWED",
  "AIRTABLE_MATCHING_PROFESSIONAL_ROLLOUT_BASE_ID",
  "AIRTABLE_MATCHING_PROFESSIONAL_ROLLOUT_TOKEN",
  "MATCHING_PROFESSIONAL_QUESTIONNAIRE_ORIGIN",
  "MATCHING_INVITATION_ADMIN_SECRET",
  "MATCHING_CLIENT_ROLLOUT_ENABLED",
  "MATCHING_ROLLOUT_DRY_RUN_ONLY",
  "AIRTABLE_MATCHING_ROLLOUT_BASE_ID",
  "AIRTABLE_MATCHING_ROLLOUT_TOKEN",
  "MATCHING_CLIENT_TEST_SECRET",
];

function resetEnvironment() {
  for (const key of ENV_KEYS) delete process.env[key];
}

function installStagingEnvironment() {
  resetEnvironment();
  process.env.MATCHING_STAGING_ENABLED = "true";
  process.env.AIRTABLE_MATCHING_BASE_ID = "apphwcmdSVSl7H0iR";
  process.env.AIRTABLE_MATCHING_TOKEN = "pat-staging-test";
  process.env.MATCHING_QUESTIONNAIRE_ORIGIN = "https://staging.example";
}

function installProfessionalRolloutEnvironment() {
  resetEnvironment();
  process.env.MATCHING_PROFESSIONAL_ROLLOUT_ENABLED = "true";
  process.env.MATCHING_PROFESSIONAL_ROLLOUT_REVIEWED = "true";
  process.env.AIRTABLE_MATCHING_PROFESSIONAL_ROLLOUT_BASE_ID = REQUIRED_MAIN_MATCHING_BASE_ID;
  process.env.AIRTABLE_MATCHING_PROFESSIONAL_ROLLOUT_TOKEN = "pat-professional-test";
  process.env.MATCHING_PROFESSIONAL_QUESTIONNAIRE_ORIGIN = "https://preview.example";
  process.env.MATCHING_INVITATION_ADMIN_SECRET = "professional-admin-test";
}

test.afterEach(resetEnvironment);

test("professional rollout defaults to the existing staging configuration", () => {
  installStagingEnvironment();
  const config = getProfessionalMatchingConfig();
  assert.equal(config.mode, "staging");
  assert.equal(config.baseId, "apphwcmdSVSl7H0iR");
});

test("professional rollout hard-stops for a non-main base", () => {
  installProfessionalRolloutEnvironment();
  process.env.AIRTABLE_MATCHING_PROFESSIONAL_ROLLOUT_BASE_ID = "apphwcmdSVSl7H0iR";
  assert.throws(() => getProfessionalMatchingConfig(), StagingConfigError);
});

test("professional rollout requires explicit review approval", () => {
  installProfessionalRolloutEnvironment();
  process.env.MATCHING_PROFESSIONAL_ROLLOUT_REVIEWED = "false";
  assert.throws(() => getProfessionalMatchingConfig(), StagingConfigError);
});

test("professional rollout requires its dedicated token and origin", () => {
  installProfessionalRolloutEnvironment();
  delete process.env.AIRTABLE_MATCHING_PROFESSIONAL_ROLLOUT_TOKEN;
  assert.throws(() => getProfessionalMatchingConfig(), StagingConfigError);
  installProfessionalRolloutEnvironment();
  delete process.env.MATCHING_PROFESSIONAL_QUESTIONNAIRE_ORIGIN;
  assert.throws(() => getProfessionalMatchingConfig(), StagingConfigError);
});

test("approved professional rollout resolves only the exact main base", () => {
  installProfessionalRolloutEnvironment();
  const config = getProfessionalMatchingConfig();
  assert.equal(config.mode, "professional-rollout");
  assert.equal(config.baseId, REQUIRED_MAIN_MATCHING_BASE_ID);
  assert.equal(config.origin, "https://preview.example");
});

test("professional readiness can pass without enabling the client rollout", async () => {
  installProfessionalRolloutEnvironment();
  const response = await getRolloutStatus(new Request("https://preview.example/api/matching-rollout-check?scope=professional"));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, scope: "professional", missing: [] });

  const combinedResponse = await getRolloutStatus(new Request("https://preview.example/api/matching-rollout-check"));
  const combined = await combinedResponse.json();
  assert.equal(combined.ok, false);
  assert.equal(combined.scope, "all");
  assert.ok(combined.missing.includes("MATCHING_CLIENT_ROLLOUT_ENABLED"));
});

test("rollout readiness rejects an unknown scope", async () => {
  const response = await getRolloutStatus(new Request("https://preview.example/api/matching-rollout-check?scope=unknown"));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { ok: false, error: "Unknown rollout scope." });
});

test("professional questionnaire never writes manual approval fields", () => {
  for (const field of ["Qualification Status", "Insurance Status", "Approved for Matching", "Status", "Evidence Status", "Scope Approved"]) {
    assert.equal(PROFESSIONAL_WRITABLE_FIELDS.includes(field), false);
  }
});

test("professional routes and hidden pages use the guarded professional configuration", async () => {
  const paths = [
    "app/api/matching-staging/professional/route.js",
    "app/professional-questionnaire/page.tsx",
    "app/matching-invitation-admin/page.tsx",
  ];
  const source = (await Promise.all(paths.map((path) => readFile(path, "utf8")))).join("\n");
  assert.match(source, /getProfessionalMatchingConfig/);
  assert.match(source, /listCanonicalServiceAreas\(config\)/);
  assert.doesNotMatch(source, /process\.env\.AIRTABLE_MATCHING_BASE_ID/);
});

test("professional submission and invitation writes share one guarded configuration", async () => {
  const source = await readFile("app/lib/staging-airtable.js", "utf8");
  assert.match(source, /submitProfessionalQuestionnaire[\s\S]*?const config = getProfessionalMatchingConfig\(\)/);
  assert.match(source, /generateProfessionalInvitation[\s\S]*?const config = getProfessionalMatchingConfig\(\)/);
  assert.match(source, /if \(parsedOrigin\.origin !== new URL\(config\.origin\)\.origin\)/);
});

test("automatic client matching remains server-triggered and Dry Run guarded", async () => {
  const source = await readFile("app/lib/staging-airtable.js", "utf8");
  assert.match(source, /if \(config\.mode === "rollout"\) await calculateAndStoreClientMatches/);
  assert.match(source, /MATCHING_ROLLOUT_DRY_RUN_ONLY/);
  assert.doesNotMatch(source, /Clients\.Selected Matches|Waitlist Requests/);
});
