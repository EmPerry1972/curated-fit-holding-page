import {
  STAGING_RESPONSE_HEADERS,
  authenticateInvitationAdminPassword,
  createInvitationAdminCookieHeader,
} from "../../../lib/staging-airtable.js";

export const dynamic = "force-dynamic";

function unavailable() {
  return Response.json({ error: "This facility is unavailable." }, { status: 404, headers: STAGING_RESPONSE_HEADERS });
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!authenticateInvitationAdminPassword(data?.password)) return unavailable();
    return Response.json(
      { ok: true },
      { headers: { ...STAGING_RESPONSE_HEADERS, "Set-Cookie": createInvitationAdminCookieHeader(request.url) } },
    );
  } catch {
    return unavailable();
  }
}
