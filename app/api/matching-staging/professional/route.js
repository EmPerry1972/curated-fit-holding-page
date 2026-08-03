import {
  AirtableRequestError,
  InvitationTokenError,
  QuestionnaireValidationError,
  STAGING_RESPONSE_HEADERS,
  StagingConfigError,
  findProfessionalByInvitationToken,
  submitProfessionalQuestionnaire,
} from "../../../lib/staging-airtable.js";

export const dynamic = "force-dynamic";

const INVALID_LINK = "This questionnaire link is not valid.";

function json(body, status = 200) {
  return Response.json(body, { status, headers: STAGING_RESPONSE_HEADERS });
}

function errorResponse(error) {
  if (error instanceof StagingConfigError) return json({ error: "This questionnaire is unavailable." }, 404);
  if (error instanceof InvitationTokenError) return json({ error: INVALID_LINK }, 404);
  if (error instanceof QuestionnaireValidationError) return json({ error: error.message, fields: error.errors }, 400);
  if (error instanceof AirtableRequestError) return json({ error: "The questionnaire could not be processed." }, error.status);
  console.error("Professional questionnaire request failed", error instanceof Error ? error.name : "UnknownError");
  return json({ error: "The questionnaire could not be processed." }, 500);
}

export async function GET(request) {
  try {
    const rawToken = new URL(request.url).searchParams.get("token") || "";
    const professional = await findProfessionalByInvitationToken(rawToken);
    return json({ professional: { name: professional.name } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    await submitProfessionalQuestionnaire(data);
    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
