export const dynamic = "force-dynamic";

const REQUIRED_MAIN_BASE_ID = "appgYLxrpdZXXULDf";

const PROFESSIONAL_CHECKS = [
  "MATCHING_PROFESSIONAL_ROLLOUT_ENABLED",
  "MATCHING_PROFESSIONAL_ROLLOUT_REVIEWED",
  "AIRTABLE_MATCHING_PROFESSIONAL_ROLLOUT_BASE_ID",
  "AIRTABLE_MATCHING_PROFESSIONAL_ROLLOUT_TOKEN",
  "MATCHING_PROFESSIONAL_QUESTIONNAIRE_ORIGIN",
  "MATCHING_INVITATION_ADMIN_SECRET",
];

const CLIENT_CHECKS = [
  "MATCHING_CLIENT_ROLLOUT_ENABLED",
  "MATCHING_ROLLOUT_DRY_RUN_ONLY",
  "AIRTABLE_MATCHING_ROLLOUT_BASE_ID",
  "AIRTABLE_MATCHING_ROLLOUT_TOKEN",
  "MATCHING_CLIENT_TEST_SECRET",
];

export async function GET(request) {
  const checks = {
    MATCHING_PROFESSIONAL_ROLLOUT_ENABLED:
      process.env.MATCHING_PROFESSIONAL_ROLLOUT_ENABLED === "true",
    MATCHING_PROFESSIONAL_ROLLOUT_REVIEWED:
      process.env.MATCHING_PROFESSIONAL_ROLLOUT_REVIEWED === "true",
    AIRTABLE_MATCHING_PROFESSIONAL_ROLLOUT_BASE_ID:
      process.env.AIRTABLE_MATCHING_PROFESSIONAL_ROLLOUT_BASE_ID === REQUIRED_MAIN_BASE_ID,
    AIRTABLE_MATCHING_PROFESSIONAL_ROLLOUT_TOKEN:
      Boolean(process.env.AIRTABLE_MATCHING_PROFESSIONAL_ROLLOUT_TOKEN),
    MATCHING_PROFESSIONAL_QUESTIONNAIRE_ORIGIN:
      Boolean(process.env.MATCHING_PROFESSIONAL_QUESTIONNAIRE_ORIGIN),
    MATCHING_INVITATION_ADMIN_SECRET:
      Boolean(process.env.MATCHING_INVITATION_ADMIN_SECRET),
    MATCHING_CLIENT_ROLLOUT_ENABLED:
      process.env.MATCHING_CLIENT_ROLLOUT_ENABLED === "true",
    MATCHING_ROLLOUT_DRY_RUN_ONLY:
      process.env.MATCHING_ROLLOUT_DRY_RUN_ONLY === "true",
    AIRTABLE_MATCHING_ROLLOUT_BASE_ID:
      process.env.AIRTABLE_MATCHING_ROLLOUT_BASE_ID === REQUIRED_MAIN_BASE_ID,
    AIRTABLE_MATCHING_ROLLOUT_TOKEN:
      Boolean(process.env.AIRTABLE_MATCHING_ROLLOUT_TOKEN),
    MATCHING_CLIENT_TEST_SECRET:
      Boolean(process.env.MATCHING_CLIENT_TEST_SECRET),
  };

  const requestedScope = request
    ? new URL(request.url).searchParams.get("scope") || "all"
    : "all";
  const scopeNames = requestedScope === "professional"
    ? PROFESSIONAL_CHECKS
    : requestedScope === "client"
      ? CLIENT_CHECKS
      : requestedScope === "all"
        ? [...PROFESSIONAL_CHECKS, ...CLIENT_CHECKS]
        : null;

  if (!scopeNames) {
    return Response.json(
      { ok: false, error: "Unknown rollout scope." },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      },
    );
  }

  const scopedChecks = Object.fromEntries(scopeNames.map((name) => [name, checks[name]]));
  const missing = Object.entries(scopedChecks).filter(([, ok]) => !ok).map(([name]) => name);
  return Response.json(
    { ok: missing.length === 0, scope: requestedScope, missing },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    },
  );
}
