import { PROFESSIONAL_QUESTIONS, isValidToken, labelsForAnswers, validateAnswers } from "../../../lib/matching-questionnaires";
import {
  AirtableRequestError,
  STAGING_RESPONSE_HEADERS,
  StagingConfigError,
  findProfessionalByToken,
  updateProfessionalQuestionnaire,
} from "../../../lib/staging-airtable";

export const dynamic = "force-dynamic";

function json(body, status = 200) {
  return Response.json(body, { status, headers: STAGING_RESPONSE_HEADERS });
}

function errorResponse(error) {
  if (error instanceof StagingConfigError) return json({ error: error.message }, 404);
  if (error instanceof AirtableRequestError) return json({ error: error.message }, error.status);
  console.error("Professional questionnaire error", error);
  return json({ error: "The questionnaire could not be processed." }, 500);
}

export async function GET(request) {
  try {
    const token = new URL(request.url).searchParams.get("token") || "";
    if (!isValidToken(token)) return json({ error: "This questionnaire link is not valid." }, 400);
    const professional = await findProfessionalByToken(token);
    if (!professional) return json({ error: "This questionnaire link was not found." }, 404);
    return json({ professional: { name: professional.name } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!isValidToken(data.token)) return json({ error: "This questionnaire link is not valid." }, 400);
    const errors = validateAnswers(PROFESSIONAL_QUESTIONS, data.answers);
    if (!data.serviceArea?.trim()) errors.serviceArea = "Please add your service area.";
    if (Object.keys(errors).length) return json({ error: "Please complete every required question.", fields: errors }, 400);

    const professional = await findProfessionalByToken(data.token);
    if (!professional) return json({ error: "This questionnaire link was not found." }, 404);
    const answers = labelsForAnswers(PROFESSIONAL_QUESTIONS, data.answers);
    await updateProfessionalQuestionnaire(professional.id, {
      "Outcomes Supported": answers.outcomesSupported.join(", "),
      "Exercise Situations Supported": answers.exerciseSituationsSupported.join(", "),
      "Experience Areas": answers.experienceAreas.join(", "),
      "Service Settings": answers.serviceSettings.join(", "),
      "Service Area": data.serviceArea.trim(),
      "Coaching Styles": answers.coachingStyles.join(", "),
      Gender: answers.gender[0],
      "Accepting Clients": answers.availability[0],
      "Matching Questionnaire Completed": true,
      "Matching Questionnaire Submitted At": new Date().toISOString(),
    });
    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
