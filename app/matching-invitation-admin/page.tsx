import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import MatchingInvitationAdmin from "../components/MatchingInvitationAdmin";
import {
  INVITATION_ADMIN_COOKIE_NAME,
  getProfessionalMatchingConfig,
  isInvitationAdminCookieValid,
} from "../lib/staging-airtable";

export const dynamic = "force-dynamic";

export default function MatchingInvitationAdminPage() {
  let authenticated = false;
  try {
    getProfessionalMatchingConfig();
    authenticated = isInvitationAdminCookieValid(cookies().get(INVITATION_ADMIN_COOKIE_NAME)?.value);
  } catch {
    notFound();
  }
  return <MatchingInvitationAdmin authenticated={authenticated} />;
}
