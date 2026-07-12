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
      "Marketing consent": data.marketing ? "Yes" : "No",
      "Submitted at": new Date().toISOString(),
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

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}
