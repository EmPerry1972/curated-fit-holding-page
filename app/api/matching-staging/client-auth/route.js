import {
  STAGING_RESPONSE_HEADERS,
  StagingConfigError,
  authenticateClientTestPassword,
  createClientTestCookieHeader,
} from "../../../lib/staging-airtable.js";

export const dynamic = "force-dynamic";

function unavailable() {
  return Response.json({ error: "This facility is unavailable." }, { status: 404, headers: STAGING_RESPONSE_HEADERS });
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!authenticateClientTestPassword(data?.password)) return unavailable();
    return Response.json(
      { ok: true },
      { headers: { ...STAGING_RESPONSE_HEADERS, "Set-Cookie": createClientTestCookieHeader(request.url) } },
    );
  } catch (error) {
    if (!(error instanceof StagingConfigError)) console.error("Client test authentication failed", error instanceof Error ? error.name : "UnknownError");
    return unavailable();
  }
}
