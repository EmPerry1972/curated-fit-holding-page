export async function POST(req) {
  try {
    const data = await req.json();

    const baseId = process.env.AIRTABLE_WAITLIST_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;
    const table = "Waitlist Clients";

    if (!baseId || !token) {
      return Response.json({ error: "Server not configured." }, { status: 500 });
    }

    const fields = {
      "Name": data.fullName || data.name || "",
      "Email": data.email || "",
      "Town": data.town || data.city || "",
      "Suburb": data.suburb || data.area || "",
      "Phone": data.phone || "",
      "Source": data.source || "Early access",
      "Consent": data.consent ? true : false,
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
        body: JSON.stringify({ records: [{ fields }] }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: "Airtable error", detail: err }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: "Unexpected error", detail: String(e) }, { status: 500 });
  }
}
