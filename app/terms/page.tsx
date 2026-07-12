import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms | Curated Fit",
  description: "The terms that apply when you apply to join the Curated Fit professional network.",
};

const wrap = { maxWidth: 780, margin: "0 auto", padding: "0 24px" };
const serif = "var(--font-serif), Fraunces, Georgia, serif";
const h1 = { fontFamily: serif, fontWeight: 600, fontSize: "clamp(28px, 4.5vw, 40px)", lineHeight: 1.15, color: "var(--ink)" };
const h2 = { fontFamily: serif, fontWeight: 500, fontSize: 21, color: "var(--ink)", margin: "34px 0 10px" };
const body = { fontSize: 16, lineHeight: 1.7, color: "var(--muted)", marginBottom: 14 };

export default function TermsPage() {
  return (
    <main>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px", maxWidth: 1080, margin: "0 auto" }}>
        <Link href="/"><img src="/logo.png" alt="Curated Fit" style={{ height: 26 }} /></Link>
        <Link href="/" style={{ fontSize: 14, color: "var(--muted)" }}>Back to home</Link>
      </nav>

      <section style={{ ...wrap, padding: "clamp(48px, 8vw, 80px) 24px" }}>
        <p style={{ fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>Curated Fit</p>
        <h1 style={h1}>Terms</h1>
        <p style={{ ...body, marginTop: 20 }}>
          These terms apply when you apply to join the Curated Fit professional network. Curated Fit is a
          service founded in New Zealand. By submitting an application you agree to these terms.
        </p>

        <h2 style={h2}>Applications</h2>
        <p style={body}>
          Submitting an application does not guarantee acceptance. Every application is reviewed individually
          against Curated Fit's professional, experience, service, and brand standards. We may contact you for
          a short conversation before making a decision.
        </p>

        <h2 style={h2}>Accurate information</h2>
        <p style={body}>
          You confirm that the information you provide is accurate and that you are entitled to provide it,
          including any professional registration, insurance, and qualification details. Please keep your
          information up to date.
        </p>

        <h2 style={h2}>Introductions</h2>
        <p style={body}>
          Introductions are based on suitability and fit, not on payment, popularity, or advertising spend. An
          introduction is an opportunity to connect and is not an obligation for either party. You may decline
          an introduction where your capacity, location, scope, or experience is not the right fit.
        </p>

        <h2 style={h2}>No exclusivity and no launch fees</h2>
        <p style={body}>
          Curated Fit does not require professional exclusivity. There is no joining fee or monthly listing fee
          during the launch stage. Any future commercial changes will be communicated clearly before they take
          effect.
        </p>

        <h2 style={h2}>Your content</h2>
        <p style={body}>
          You grant Curated Fit permission to use the information and images you submit for the purpose of
          assessing your application and, if approved, creating your Curated Fit profile and arranging suitable
          introductions.
        </p>

        <h2 style={h2}>Changes to these terms</h2>
        <p style={body}>
          We may update these terms from time to time. Material changes will be communicated to approved
          professionals.
        </p>

        <h2 style={h2}>Contact</h2>
        <p style={body}>
          For any questions about these terms, contact us at{" "}
          <a href="mailto:hello@curatedfit.co.nz" style={{ textDecoration: "underline", color: "var(--ink)" }}>hello@curatedfit.co.nz</a>.
        </p>

        <p style={{ ...body, marginTop: 30, fontSize: 14 }}>
          <Link href="/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</Link> · <Link href="/" style={{ textDecoration: "underline" }}>Home</Link>
        </p>
      </section>

      <footer style={{ borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", padding: "28px 24px", fontSize: 14, color: "var(--muted)" }}>
          <span>© {new Date().getFullYear()} Curated Fit · Founded in New Zealand</span>
          <span style={{ display: "flex", gap: 20 }}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
            <a href="mailto:hello@curatedfit.co.nz">Contact</a>
          </span>
        </div>
      </footer>
    </main>
  );
}
