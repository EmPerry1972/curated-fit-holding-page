const serif = "var(--font-serif), 'Playfair Display', Georgia, serif";
const mono = "var(--font-mono), 'IBM Plex Mono', ui-monospace, monospace";
const sans = "var(--font-sans)";

const wrap = { maxWidth: 780, margin: "0 auto", padding: "0 24px" } as const;
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

export default function EarlyAccessPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--warm-white)" }}>
      <header style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", padding: "22px 24px" }}>
          <a href="/">
            <img src="/logo.png" alt="Curated Fit" style={{ height: 64 }} />
          </a>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <section style={{ ...wrap, padding: "clamp(64px, 12vw, 140px) 24px", textAlign: "center" }}>
          <p style={eyebrow}>Curated Fit</p>
          <h1 style={h1}>Register for early access</h1>
          <p style={{ ...body, marginTop: 20, textAlign: "center" }}>
            Leave your details to be among the first invited to Find Your Fit when Curated Fit launches.
          </p>
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
