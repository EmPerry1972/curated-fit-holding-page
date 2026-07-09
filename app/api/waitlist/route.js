export async function POST(request) {
  try {
    const data = await request.json();

    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;
    const table = "Waitlist";

    if (!baseId || !token) {
      return Response.json({ error: "Server not configured" }, { status: 500 });
    }

    const fields = {
      "Name": data.fullName || "",
      "Email": data.email || "",
      "Phone": data.phone || "",
      "Country code": data.countryCode || "",
          "City": data.city || "",
      "Postcode": data.postcode || "",
      "Country": data.country || "",
      "Experience": data.experience || "",
      "Registration": data.registration || "",
      "Specialities": Array.isArray(data.specialities) ? data.specialities.join(", ") : (data.specialities || ""),
      "About": data.about || "",
    };

    const res = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records: [{ fields }], typecast: true }),
      }
    );

    if (!res.ok) {
      const detail = await res.text();
      return Response.json({ error: "Airtable error", detail }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
}
