import {
  AirtableRequestError,
  QuestionnaireValidationError,
  STAGING_RESPONSE_HEADERS,
  StagingConfigError,
  createClientQuestionnaire,
  isClientTestRequestAuthenticated,
  listCanonicalServiceAreas,
} from "../../../lib/staging-airtable.js";

export const dynamic = "force-dynamic";

function json(body, status = 200) {
  return Response.json(body, { status, headers: STAGING_RESPONSE_HEADERS });
}

export async function GET(request) {
  try {
    if (!isClientTestRequestAuthenticated(request)) return json({ error: "This facility is unavailable." }, 404);
    return json({ serviceAreas: await listCanonicalServiceAreas() });
  } catch (error) {
    if (error instanceof StagingConfigError) return json({ error: "This questionnaire is unavailable." }, 404);
    if (error instanceof AirtableRequestError) return json({ error: "Locations could not be loaded." }, error.status);
    console.error("Client questionnaire location request failed", error instanceof Error ? error.name : "UnknownError");
    return json({ error: "Locations could not be loaded." }, 500);
  }
}

export async function POST(request) {
  try {
    if (!isClientTestRequestAuthenticated(request)) return json({ error: "This facility is unavailable." }, 404);
    const data = await request.json();
    await createClientQuestionnaire(data);
    return json({ ok: true });
  } catch (error) {
    if (error instanceof StagingConfigError) return json({ error: "This questionnaire is unavailable." }, 404);
    if (error instanceof QuestionnaireValidationError) return json({ error: error.message, fields: error.errors }, 400);
    if (error instanceof AirtableRequestError) return json({ error: "The questionnaire could not be processed." }, error.status);
    console.error("Client questionnaire request failed", error instanceof Error ? error.name : "UnknownError");
    return json({ error: "The questionnaire could not be processed." }, 500);
  }
}
