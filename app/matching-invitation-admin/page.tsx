import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import MatchingInvitationAdmin from "../components/MatchingInvitationAdmin";
import { INVITATION_ADMIN_COOKIE_NAME, isInvitationAdminCookieValid } from "../lib/staging-airtable";

export const dynamic = "force-dynamic";

export default function MatchingInvitationAdminPage() {
  if (process.env.MATCHING_STAGING_ENABLED !== "true" || process.env.AIRTABLE_MATCHING_BASE_ID !== "apphwcmdSVSl7H0iR") notFound();
  let authenticated = false;
  try {
    authenticated = isInvitationAdminCookieValid(cookies().get(INVITATION_ADMIN_COOKIE_NAME)?.value);
  } catch {
    notFound();
  }
  return <MatchingInvitationAdmin authenticated={authenticated} />;
}
