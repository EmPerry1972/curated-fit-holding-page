export const dynamic = "force-dynamic";

const REQUIRED_MAIN_BASE_ID = "appgYLxrpdZXXULDf";

export async function GET() {
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
  const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  return Response.json(
    { ok: missing.length === 0, missing },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    },
  );
}
