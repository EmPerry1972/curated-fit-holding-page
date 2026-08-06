import { generateProfessionalInvitation } from "../app/lib/staging-airtable.js";

const [professionalRecordId, expiry, origin] = process.argv.slice(2);

if (!professionalRecordId || !expiry || !origin) {
  console.error("Usage: npm run matching:invite -- <airtable-record-id> <expiry-iso> <questionnaire-origin>");
  process.exitCode = 1;
} else {
  try {
    const invitationUrl = await generateProfessionalInvitation({ professionalRecordId, expiry, origin });
    process.stdout.write(`${invitationUrl}\n`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Invitation generation failed.");
    process.exitCode = 1;
  }
}
