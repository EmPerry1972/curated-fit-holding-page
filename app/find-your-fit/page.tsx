import SupportQuiz from "../components/SupportQuiz";
import { CONVERSATIONS_PUBLISHED } from "../config";

const mono = "var(--font-mono), 'IBM Plex Mono', ui-monospace, monospace";

export default function FindYourFitPage() {
  return (
    <main>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px", maxWidth: 1080, margin: "0 auto", width: "100%", flexWrap: "wrap", gap: 12, borderBottom: "1px solid var(--line)" }}>
        <a href="/"><img src="/logo.png" alt="Curated Fit" style={{ height: 64 }} /></a>
        <a href="/register" id="register-pro-link" style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#000000", fontWeight: 700, textDecoration: "none", backgroundColor: "#ffffff", padding: "8px 14px", borderRadius: 4, display: "inline-block", border: "1px solid var(--line)" }}>
          Register here as an Exercise Professional
        </a>
        {CONVERSATIONS_PUBLISHED && (
          <a
            href="/curated-conversations"
            style={{
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-primary)",
              textDecoration: "none",
            }}
          >
            Curated Conversations
          </a>
        )}
      </nav>
      <SupportQuiz />
    </main>
  );
}
