import {
  STAGING_RESPONSE_HEADERS,
  generateProfessionalInvitation,
  getWaitlistProfessional,
  isInvitationAdminRequestAuthenticated,
} from "../../../lib/staging-airtable.js";

export const dynamic = "force-dynamic";

function unavailable() {
  return Response.json({ error: "This facility is unavailable." }, { status: 404, headers: STAGING_RESPONSE_HEADERS });
}

function failed() {
  return Response.json({ error: "The invitation could not be processed." }, { status: 400, headers: STAGING_RESPONSE_HEADERS });
}

export async function POST(request) {
  try {
    if (!isInvitationAdminRequestAuthenticated(request)) return unavailable();
    const data = await request.json();
    if (data?.action === "verify") {
      const professional = await getWaitlistProfessional(data.professionalRecordId);
      return Response.json({ professional }, { headers: STAGING_RESPONSE_HEADERS });
    }
    if (data?.action === "generate") {
      const professional = await getWaitlistProfessional(data.professionalRecordId);
      const invitationUrl = await generateProfessionalInvitation({
        professionalRecordId: data.professionalRecordId,
        expiry: data.expiry,
        origin: data.origin,
      });
      return Response.json({ professional, invitationUrl }, { headers: STAGING_RESPONSE_HEADERS });
    }
    return failed();
  } catch {
    return failed();
  }
}
