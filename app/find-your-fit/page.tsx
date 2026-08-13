import SupportQuiz from "../components/SupportQuiz";
import { CONVERSATIONS_PUBLISHED } from "../config";

const mono = "var(--font-mono), 'IBM Plex Mono', ui-monospace, monospace";

export default function FindYourFitPage() {
  return (
    <main>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px", maxWidth: 1080, margin: "0 auto", width: "100%", flexWrap: "wrap", gap: 12, borderBottom: "1px solid var(--line)" }}>
        <a href="/"><img src="/logo.png" alt="Curated Fit" style={{ height: 64, filter: "brightness(0)" }} /></a>
      </nav>
      <SupportQuiz />
    </main>
  );
}
