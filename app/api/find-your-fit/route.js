import {
  AirtableRequestError,
  QuestionnaireValidationError,
  STAGING_RESPONSE_HEADERS,
  StagingConfigError,
  createClientQuestionnaire,
  previewClientMatches,
  listCanonicalServiceAreas,
} from "../../lib/staging-airtable.js";

export const dynamic = "force-dynamic";

function json(body, status = 200) {
  return Response.json(body, { status, headers: STAGING_RESPONSE_HEADERS });
}

// Public "Find your fit" endpoint. Unlike the internal client-test route,
// this is intentionally NOT gated behind the client test cookie, and it
// records submissions as real clients (Is Test Record = false).
export async function GET() {
  try {
    return json({ serviceAreas: await listCanonicalServiceAreas() });
  } catch (error) {
    if (error instanceof StagingConfigError) return json({ error: "This service is unavailable." }, 404);
    if (error instanceof AirtableRequestError) return json({ error: "Locations could not be loaded." }, error.status);
    console.error("Find your fit locations request failed", error instanceof Error ? error.name : "UnknownError");
    return json({ error: "Locations could not be loaded." }, 500);
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    let result;
    if (data.intent === "connect") {
      result = await createClientQuestionnaire({ ...data, isTestRecord: false });
    } else {
      result = await previewClientMatches(data);
    }
    return json({ ok: true, matches: result.matches || [] });
  } catch (error) {
    if (error instanceof StagingConfigError) return json({ error: "This service is unavailable." }, 404);
    if (error instanceof QuestionnaireValidationError) return json({ error: error.message, fields: error.errors }, 400);
    if (error instanceof AirtableRequestError) return json({ error: "Your answers could not be processed." }, error.status);
    console.error("Find your fit submission failed", error instanceof Error ? error.name : "UnknownError");
    return json({ error: "Your answers could not be processed." }, 500);
  }
}
