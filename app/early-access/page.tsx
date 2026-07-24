"use client";

import { useState } from "react";

const serif = "var(--font-serif), 'Playfair Display', Georgia, serif";
const mono = "var(--font-mono), 'IBM Plex Mono', ui-monospace, monospace";
const sans = "var(--font-sans)";

const wrap = { maxWidth: 620, margin: "0 auto", padding: "0 24px" } as const;
const eyebrow = {
  fontFamily: mono,
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color: "var(--warm-grey)",
  marginBottom: 16,
};
const h1 = { fontFamily: serif, fontWeight: 300, letterSpacing: "0.005em", fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.12, color: "var(--ink)" } as const;
const body = { fontFamily: sans, fontSize: 17, lineHeight: 1.7, color: "var(--muted)" } as const;
const label = { display: "block", fontFamily: mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--label)", marginBottom: 8 };
const input = { width: "100%", fontFamily: sans, fontSize: 16, color: "var(--ink)", background: "var(--field)", border: "1px solid var(--line)", borderRadius: 8, padding: "13px 14px", outline: "none" } as const;
const cta = { display: "inline-block", fontFamily: mono, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" as const, background: "var(--ink)", color: "var(--warm-white)", border: "none", borderRadius: 10, padding: "15px 26px", cursor: "pointer" } as const;

export default function EarlyAccessPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [town, setTown] = useState("");
  const [suburb, setSuburb] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name,
          email,
          city: town,
          area: suburb,
          phone,
          source: "Early access",
          consent: true,
          consentAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--warm-white)" }}>
      <header style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", padding: "22px 24px" }}>
          <a href="/">
            <img src="/logo.png" alt="Curated Fit" style={{ height: 64 }} />
          </a>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <section style={{ ...wrap, padding: "clamp(56px, 10vw, 96px) 24px" }}>
          <p style={eyebrow}>Curated Fit</p>
          <h1 style={h1}>Register for early access</h1>
          <p style={{ ...body, marginTop: 20 }}>
            Leave your details to be among the first invited to Find Your Fit when Curated Fit launches.
          </p>

          {status === "done" ? (
            <div style={{ marginTop: 40, padding: "28px 24px", background: "var(--field)", border: "1px solid var(--line)", borderRadius: 10 }}>
              <p style={{ fontFamily: serif, fontSize: 22, color: "var(--ink)", marginBottom: 10 }}>Thank you.</p>
              <p style={body}>Your details are in. We will be in touch when early access opens. Please check that emails from Curated Fit are not directed to your junk folder.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ marginTop: 40, display: "grid", gap: 22 }}>
              <div>
                <label style={label} htmlFor="name">Name</label>
                <input id="name" style={input} type="text" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
              </div>
              <div>
                <label style={label} htmlFor="email">Email</label>
                <input id="email" style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={label} htmlFor="town">Town</label>
                  <input id="town" style={input} type="text" value={town} onChange={(e) => setTown(e.target.value)} required />
                </div>
                <div>
                  <label style={label} htmlFor="suburb">Suburb</label>
                  <input id="suburb" style={input} type="text" value={suburb} onChange={(e) => setSuburb(e.target.value)} required />
                </div>
              </div>
              <div>
                <label style={label} htmlFor="phone">Phone <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--warm-grey)" }}>(optional)</span></label>
                <input id="phone" style={input} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
              </div>
              <div>
                <button type="submit" style={{ ...cta, opacity: status === "sending" ? 0.6 : 1 }} disabled={status === "sending"}>
                  {status === "sending" ? "Sending..." : "Register interest"}
                </button>
              </div>
              {status === "error" && (
                <p style={{ ...body, fontSize: 15, color: "#a03232" }}>
                  Something went wrong. Please try again, or email welcome@curatedfit.co.nz.
                </p>
              )}
            </form>
          )}
        </section>
      </main>

      <footer style={{ borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", padding: "28px 24px", fontFamily: sans, fontSize: 13, color: "var(--muted)" }}>
          <span>&copy; {new Date().getFullYear()} Curated Fit &middot; Founded in New Zealand</span>
          <span style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <a href="/register" style={{ color: "var(--muted)" }}>Register as an Exercise Professional</a>
            <a href="/privacy" style={{ color: "var(--muted)" }}>Privacy Policy</a>
            <a href="/terms" style={{ color: "var(--muted)" }}>Terms</a>
            <a href="mailto:welcome@curatedfit.co.nz" style={{ color: "var(--muted)" }}>Contact</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
