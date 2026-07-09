"use client";

import { useState } from "react";

const SPECIALITIES = [
    "Build strength and muscle", "Lose fat, change composition",
    "GLP-1 exercise support programme", "General fitness and health",
    "Recover from injury", "Mobility and longevity",
];

const EXPERIENCE = ["Less than 2 years", "2\u20135 years", "5\u201310 years", "10+ years"];
const REGISTRATION = ["Yes - REPs registered", "Yes - other recognised body", "Not yet"];
const COUNTRY_CODES = ["+64 New Zealand", "+61 Australia", "+1 US / Canada", "+44 United Kingdom", "+353 Ireland", "+91 India", "+27 South Africa", "+65 Singapore", "+971 UAE", "+49 Germany", "+33 France", "+81 Japan", "+86 China", "+55 Brazil", "+52 Mexico", "+31 Netherlands", "+46 Sweden", "+41 Switzerland", "+34 Spain", "+39 Italy", "Other"];

export default function Page() {
  const [form, setForm] = useState({
                    fullName: "", email: "", phone: "", city: "", postcode: "", country: "", countryCode: "+64 New Zealand",
    experience: "", registration: "", about: "",
  });
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleSpec = (s: string) =>
    setSpecialities((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  async function submit() {
                    if (!form.fullName || !form.email || !form.phone || !form.city || !form.postcode || !form.country || !form.experience || !form.registration || !form.about || specialities.length === 0) {
                            setError("Please complete all fields before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, specialities }),
      });
      if (!res.ok) throw new Error("failed");
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const field: React.CSSProperties = {
    width: "100%", background: "var(--field)", border: "1px solid var(--line)",
    borderRadius: 14, padding: "13px 15px", color: "var(--ink)", fontSize: 16,
    fontFamily: "inherit", outline: "none",
  };
  const label: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "var(--label)", marginBottom: 8 };
  const pill = (active: boolean): React.CSSProperties => ({
    background: active ? "var(--ink)" : "var(--field)",
    color: active ? "var(--field)" : "var(--ink)",
    border: "1px solid " + (active ? "var(--ink)" : "var(--line)"),
    borderRadius: 999, padding: "9px 16px", fontSize: 14, cursor: "pointer",
    fontFamily: "inherit",
  });

  return (
    <main style={{ minHeight: "100vh" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 6vw", borderBottom: "1px solid var(--line)" }}>
                  <div style={{ fontFamily: "var(--font-serif), serif", fontSize: 22, letterSpacing: 2, fontWeight: 600 }}><img src="/logo.png" alt="Curated Fit" style={{ height: 64 }} /></div>
        <span style={{ background: "var(--ink)", color: "var(--field)", borderRadius: 999, padding: "12px 22px", fontSize: 15 }}>Join the waitlist</span>
      </nav>

      <section style={{ maxWidth: 980, margin: "0 auto", padding: "64px 6vw 96px" }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <h1 style={{ fontFamily: "var(--font-serif), serif", fontSize: 44, fontWeight: 500, marginBottom: 16 }}>You're on the list.</h1>
            <p style={{ color: "var(--muted)", fontSize: 20 }}>Thanks for registering your interest. We'll be in touch when we open the next round of coaches.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>Apply as a trainer</p>
            <h1 style={{ fontFamily: "var(--font-serif), serif", fontSize: 66, lineHeight: 1.05, fontWeight: 500, marginBottom: 24 }}>A carefully selected standard.</h1>
            <p style={{ fontSize: 20, lineHeight: 1.6, color: "var(--muted)", maxWidth: 620, marginBottom: 48 }}>
              Curated Fit works with a limited number of selected exercise professionals, each considered against one clear standard. Join the waitlist and we'll be in touch if it is the right fit.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
              <div><label style={label}>Full name</label><input style={field} value={form.fullName} onChange={set("fullName")} /></div>
              <div><label style={label}>Email</label><input style={field} type="email" value={form.email} onChange={set("email")} /></div>
                    <div><label style={label}>Country code</label><select style={field} value={form.countryCode} onChange={set("countryCode")}>{COUNTRY_CODES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label style={label}>Phone</label><input style={field} type="tel" value={form.phone} onChange={set("phone")} /></div>
                                            <div><label style={label}>City</label><input style={field} value={form.city} onChange={set("city")} /></div>
                          <div><label style={label}>Postcode</label><input style={field} value={form.postcode} onChange={set("postcode")} /></div>
                          <div><label style={label}>Country</label><input style={field} value={form.country} onChange={set("country")} /></div>
              <div><label style={label}>Years of experience</label>
                <select style={field} value={form.experience} onChange={set("experience")}>
                  <option value="">Select&hellip;</option>
                  {EXPERIENCE.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div><label style={label}>REPs / recognised registration?</label>
                <select style={field} value={form.registration} onChange={set("registration")}>
                  <option value="">Select&hellip;</option>
                  {REGISTRATION.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={label}>Specialities <span style={{ color: "var(--muted)", fontWeight: 400 }}>Choose all that apply</span></label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {SPECIALITIES.map((s) => (
                  <button type="button" key={s} style={pill(specialities.includes(s))} onClick={() => toggleSpec(s)}>{s}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={label}>Tell us about your coaching</label>
              <textarea style={{ ...field, minHeight: 120, resize: "vertical" }} placeholder="Your approach, who you work best with, and what a first session feels like." value={form.about} onChange={set("about")} />
            </div>

            {error && <p style={{ color: "#a33", marginBottom: 16 }}>{error}</p>}

            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <button type="button" onClick={submit} disabled={submitting}
                style={{ background: "var(--ink)", color: "var(--field)", border: "none", borderRadius: 999, padding: "15px 26px", fontSize: 15, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1, fontFamily: "inherit" }}>
                {submitting ? "Submitting\u2026" : "Join the waitlist"}
              </button>
              <span style={{ color: "var(--muted)", fontSize: 14 }}>We review every application against one Curated standard.</span>
            </div>
          </>
        )}
      </section>

      <footer style={{ borderTop: "1px solid var(--line)", padding: "40px 6vw", color: "var(--muted)", fontSize: 14 }}>
                  <div style={{ fontFamily: "var(--font-serif), serif", fontSize: 18, letterSpacing: 2, color: "var(--ink)", marginBottom: 8 }}><img src="/logo.png" alt="Curated Fit" style={{ height: 34 }} /></div>
        A Curated Wellness platform.
          <div style={{ marginTop: 4 }}>Proudly NZ made</div>
      </footer>
    </main>
  );
}
