import { CLIENT_QUESTIONS, labelsForAnswers, validateAnswers } from "../../../lib/matching-questionnaires";
import {
  AirtableRequestError,
  STAGING_RESPONSE_HEADERS,
  StagingConfigError,
  createClientQuestionnaire,
} from "../../../lib/staging-airtable";

export const dynamic = "force-dynamic";

function json(body, status = 200) {
  return Response.json(body, { status, headers: STAGING_RESPONSE_HEADERS });
}

export async function POST(request) {
  try {
    const data = await request.json();
    const errors = validateAnswers(CLIENT_QUESTIONS, data.answers);
    if (!data.fullName?.trim()) errors.fullName = "Please add a name.";
    if (!/^\S+@\S+\.\S+$/.test(data.email || "")) errors.email = "Please add a valid email address.";
    if (!data.location?.trim()) errors.location = "Please add a suburb or postcode.";
    if (data.consent !== true) errors.consent = "Consent is required.";
    if (Object.keys(errors).length) return json({ error: "Please complete every required question.", fields: errors }, 400);

    const answers = labelsForAnswers(CLIENT_QUESTIONS, data.answers);
    await createClientQuestionnaire({
      Name: data.fullName.trim(),
      Email: data.email.trim().toLowerCase(),
      Phone: data.phone?.trim() || "",
      Location: data.location.trim(),
      Outcomes: answers.outcomes.join(", "),
      "Exercise Situation": answers.exerciseSituation[0],
      "Experience Needed": answers.experienceNeeded.join(", "),
      "Preferred Settings": answers.settings.join(", "),
      "Support Style": answers.supportStyle.join(", "),
      "Gender Preference": answers.genderPreference[0],
      Status: "Questionnaire complete",
      Source: "Hidden client matching test",
      Consent: true,
      "Consent Timestamp": new Date().toISOString(),
      "Test Record": true,
    });
    return json({ ok: true });
  } catch (error) {
    if (error instanceof StagingConfigError) return json({ error: error.message }, 404);
    if (error instanceof AirtableRequestError) return json({ error: error.message }, error.status);
    console.error("Client questionnaire error", error);
    return json({ error: "The questionnaire could not be processed." }, 500);
  }
}
