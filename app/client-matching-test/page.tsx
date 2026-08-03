import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import HiddenMatchingQuestionnaire from "../components/HiddenMatchingQuestionnaire";
import { CLIENT_TEST_COOKIE_NAME, isClientTestCookieValid } from "../lib/staging-airtable";

export const dynamic = "force-dynamic";

export default function ClientMatchingTestPage() {
  if (process.env.MATCHING_STAGING_ENABLED !== "true" || process.env.AIRTABLE_MATCHING_BASE_ID !== "apphwcmdSVSl7H0iR") notFound();
  let clientAuthenticated = false;
  try {
    clientAuthenticated = isClientTestCookieValid(cookies().get(CLIENT_TEST_COOKIE_NAME)?.value);
  } catch {
    notFound();
  }
  return <HiddenMatchingQuestionnaire kind="client" clientAuthenticated={clientAuthenticated} />;
}
