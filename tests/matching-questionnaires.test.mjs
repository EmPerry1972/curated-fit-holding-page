import assert from "node:assert/strict";
import test from "node:test";

import {
  CLIENT_QUESTIONS,
  PROFESSIONAL_QUESTIONS,
  isValidToken,
  labelsForAnswers,
  validateAnswers,
} from "../app/lib/matching-questionnaires.js";
import { StagingConfigError, getStagingConfig } from "../app/lib/staging-airtable.js";

function validAnswers(questions) {
  return Object.fromEntries(questions.map((question) => [question.id, [question.options[0].value]]));
}

test("client and professional questionnaires accept a complete valid answer set", () => {
  assert.deepEqual(validateAnswers(CLIENT_QUESTIONS, validAnswers(CLIENT_QUESTIONS)), {});
  assert.deepEqual(validateAnswers(PROFESSIONAL_QUESTIONS, validAnswers(PROFESSIONAL_QUESTIONS)), {});
});

test("validation rejects missing, unknown, duplicate, over-limit, and mixed exclusive answers", () => {
  const questions = CLIENT_QUESTIONS;
  const answers = validAnswers(questions);
  answers.outcomes = ["strength", "energy", "weight"];
  answers.exerciseSituation = [];
  answers.experienceNeeded = ["none", "menopause"];
  answers.settings = ["unknown"];
  answers.supportStyle = ["calm", "calm"];
  const errors = validateAnswers(questions, answers);
  assert.match(errors.outcomes, /no more than 2/);
  assert.match(errors.exerciseSituation, /choose an answer/i);
  assert.match(errors.experienceNeeded, /cannot be combined/i);
  assert.match(errors.settings, /not valid/i);
  assert.match(errors.supportStyle, /duplicate/i);
});

test("answer values are converted to their stable Airtable labels", () => {
  const labels = labelsForAnswers(CLIENT_QUESTIONS, validAnswers(CLIENT_QUESTIONS));
  assert.equal(labels.outcomes[0], "Build strength and maintain muscle");
  assert.equal(labels.genderPreference[0], "I would prefer to work with a woman.");
});

test("professional tokens require a non-trivial URL-safe value", () => {
  assert.equal(isValidToken("abc"), false);
  assert.equal(isValidToken("abcdefghijklmnop"), true);
  assert.equal(isValidToken("valid_token-1234567890"), true);
  assert.equal(isValidToken("invalid token 123456"), false);
});

test("staging configuration cannot point at another Airtable base", () => {
  const original = {
    enabled: process.env.MATCHING_STAGING_ENABLED,
    baseId: process.env.AIRTABLE_MATCHING_BASE_ID,
    token: process.env.AIRTABLE_MATCHING_TOKEN,
  };
  process.env.MATCHING_STAGING_ENABLED = "true";
  process.env.AIRTABLE_MATCHING_BASE_ID = "app-production-base";
  process.env.AIRTABLE_MATCHING_TOKEN = "test-token";
  assert.throws(() => getStagingConfig(), StagingConfigError);
  process.env.AIRTABLE_MATCHING_BASE_ID = "apphwcmdSVSl7H0iR";
  assert.equal(getStagingConfig().baseId, "apphwcmdSVSl7H0iR");
  for (const [key, value] of Object.entries({
    MATCHING_STAGING_ENABLED: original.enabled,
    AIRTABLE_MATCHING_BASE_ID: original.baseId,
    AIRTABLE_MATCHING_TOKEN: original.token,
  })) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});
