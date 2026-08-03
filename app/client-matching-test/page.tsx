import { notFound } from "next/navigation";
import HiddenMatchingQuestionnaire from "../components/HiddenMatchingQuestionnaire";
import { CLIENT_QUESTIONS } from "../lib/matching-questionnaires";

export const dynamic = "force-dynamic";

export default function ClientMatchingTestPage() {
  if (process.env.MATCHING_STAGING_ENABLED !== "true" || process.env.AIRTABLE_MATCHING_BASE_ID !== "apphwcmdSVSl7H0iR") notFound();
  return <HiddenMatchingQuestionnaire kind="client" questions={CLIENT_QUESTIONS} />;
}
