export async function POST(req) {
  try {
    const data = await req.json();

    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;
    const table = "Waitlist";

    if (!baseId || !token) {
      return Response.json({ error: "Server not configured." }, { status: 500 });
    }

    const fields = {
      "Name": data.fullName || "",
      ...(data.photoUrl ? { "Attachments": [{ url: data.photoUrl }] } : {}),
      "Email": data.email || "",
      "Phone": data.phone || "",
      "City": data.city || "",
      "Area": data.area || "",
      "Website": data.website || "",
      "Instagram": data.instagram || "",
      "Experience": data.experience || "",
      "Registration": data.registration || "",
      "Registration number": data.registrationNumber || "",
      "Qualifications": data.qualifications || "",
      "Insurance": data.insurance || "",
      "Accepting clients": data.acceptingClients || "",
      "Working locations": data.workingLocations || "",
      "Working formats": Array.isArray(data.workingFormats) ? data.workingFormats.join(", ") : (data.workingFormats || ""),
      "Specialities": Array.isArray(data.specialities) ? data.specialities.join(", ") : (data.specialities || ""),
      "Other speciality": data.otherSpeciality || "",
      "About": data.about || "",
      "Status": data.status || "New",
      "Source": data.source || "Curated Fit professional landing page",
      "Consent": data.consent ? "Yes" : "No",
      "Consent timestamp": data.consentAt || new Date().toISOString(),
    };

    const res = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields, typecast: true }),
      }
    );

    if (!res.ok) {
      const detail = await res.text();
      return Response.json({ error: "Airtable error", detail }, { status: 502 });
    }

    // Send a confirmation email to the applicant via Resend (best-effort).
    // The application is already saved in Airtable, so if email fails we
    // still return success and just log the error.
    try {
      await sendConfirmationEmail(data);
    } catch (mailErr) {
      console.error("Confirmation email failed:", mailErr);
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}

async function sendConfirmationEmail(data) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM; // e.g. "The Curated Fit team <welcome@curatedfit.co.nz>"
  const applicantEmail = data.email || "";

  // If email isn't configured yet, or there's no applicant email, skip
  // silently so submissions still work.
  if (!apiKey || !fromAddress || !applicantEmail) {
    return;
  }

  const fullName = (data.fullName || "").trim();
  const firstName = fullName ? fullName.split(/\s+/)[0] : "there";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2 style="margin-bottom: 16px;">One step closer to joining Curated Fit</h2>
      <p>Hi ${firstName},</p>
      <p>Thank you for applying to join Curated Fit.</p>
      <p>We are bringing together a considered group of exercise professionals who care about doing the best by their clients and understand that the right fit can make all the difference.</p>
      <p>Curated Fit is designed to help women find an exercise professional who suits how they want to exercise, live and feel, while giving exceptional professionals greater visibility with the clients they are best placed to support.</p>
      <p>We are working towards going live by the end of August and will be in touch shortly once we have reviewed your application.</p>
      <p>At this early stage, Curated Fit is growing organically, and your feedback is not only welcome, it is encouraged. We want to build this alongside the professionals who will be part of it, so please tell us what would make the service more useful, relevant and valuable to you and your clients.</p>
      <p>Please also feel free to share Curated Fit with other like-minded exercise professionals who you believe would be a strong fit.</p>
      <p>If you need to update anything in your application, simply reply to this email.</p>
      <p>Warmly,</p>
      <p>The Curated Fit team</p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress,
      to: applicantEmail,
      subject: "One step closer to joining Curated Fit",
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Resend error: ${detail}`);
  }
}
