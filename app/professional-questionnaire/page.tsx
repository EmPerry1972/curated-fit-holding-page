import { notFound } from "next/navigation";
import HiddenMatchingQuestionnaire from "../components/HiddenMatchingQuestionnaire";
import { getProfessionalMatchingConfig } from "../lib/staging-airtable";

export const dynamic = "force-dynamic";

export default function ProfessionalQuestionnairePage({ searchParams }: { searchParams: { token?: string } }) {
  try {
    getProfessionalMatchingConfig();
  } catch {
    notFound();
  }
  return <HiddenMatchingQuestionnaire kind="professional" token={searchParams.token || ""} />;
}
