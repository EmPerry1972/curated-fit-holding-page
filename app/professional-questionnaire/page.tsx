import { notFound } from "next/navigation";
import HiddenMatchingQuestionnaire from "../components/HiddenMatchingQuestionnaire";
import { PROFESSIONAL_QUESTIONS } from "../lib/matching-questionnaires";

export const dynamic = "force-dynamic";

export default function ProfessionalQuestionnairePage({ searchParams }: { searchParams: { token?: string } }) {
  if (process.env.MATCHING_STAGING_ENABLED !== "true" || process.env.AIRTABLE_MATCHING_BASE_ID !== "apphwcmdSVSl7H0iR") notFound();
  return <HiddenMatchingQuestionnaire kind="professional" questions={PROFESSIONAL_QUESTIONS} token={searchParams.token || ""} />;
}
