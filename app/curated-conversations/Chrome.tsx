// Shared nav and footer for the Curated Conversations journal.

const mono = "var(--font-mono), 'IBM Plex Mono', ui-monospace, monospace";

const wrap = { maxWidth: 1080, margin: "0 auto", padding: "0 24px" } as const;

export function ConversationsNav() {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "22px 24px",
        maxWidth: 1080,
        margin: "0 auto",
        width: "100%",
        flexWrap: "wrap",
        gap: 12,
        borderBottom: "1px solid var(--line)",
      }}
    >
      <a href="/">
        <img src="/logo.png" alt="Curated Fit" style={{ height: 64, filter: "brightness(0)" }} />
      </a>
      <a
        href="/register"
        id="register-pro-link"
        style={{
          fontFamily: mono,
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#000000",
          fontWeight: 700,
          textDecoration: "none",
          backgroundColor: "#ffffff",
          padding: "8px 14px",
          borderRadius: 0,
          display: "inline-block",
          border: "1px solid var(--line)",
        }}
      >
        Register here as an Exercise Professional
      </a>
    </nav>
  );
}

export function ConversationsFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)" }}>
      <div
        style={{
          ...wrap,
          padding: "32px 24px",
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.06em", color: "var(--warm-grey)", margin: 0 }}>
          &copy; {new Date().getFullYear()} Curated Fit &middot; Founded in New Zealand
        </p>
        <span style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 13, color: "var(--muted)" }}>
          <a href="/privacy" style={{ color: "var(--muted)" }}>
            Privacy Policy
          </a>
          <a href="/terms" style={{ color: "var(--muted)" }}>
            Terms
          </a>
          <a href="mailto:welcome@curatedfit.co.nz" style={{ color: "var(--muted)" }}>
            Contact
          </a>
        </span>
      </div>
    </footer>
  );
}
