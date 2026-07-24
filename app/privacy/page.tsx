import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Curated Fit",
  description: "How Curated Fit collects, uses, and protects the information you provide.",
};

const wrap = { maxWidth: 780, margin: "0 auto", padding: "0 24px" };
const serif = "var(--font-serif), Fraunces, Georgia, serif";
const mono = "var(--font-mono), 'Space Mono', ui-monospace, monospace";
const h1 = { fontFamily: serif, fontWeight: 300, letterSpacing: "0.005em", fontSize: "clamp(28px, 4.5vw, 40px)", lineHeight: 1.15, color: "var(--ink)" };
const h2 = { fontFamily: serif, fontWeight: 400, letterSpacing: "0.005em", fontSize: 21, color: "var(--ink)", margin: "34px 0 10px" };
const body = { fontSize: 16, lineHeight: 1.7, color: "var(--muted)", marginBottom: 14 };

export default function PrivacyPage() {
  return (
    <main>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px", maxWidth: 1080, margin: "0 auto" }}>
        <Link href="/"><img src="/logo.png" alt="Curated Fit" style={{ height: 26 }} /></Link>
        <Link href="/" style={{ fontSize: 14, color: "var(--muted)" }}>Back to home</Link>
      </nav>

      <section style={{ ...wrap, padding: "clamp(48px, 8vw, 80px) 24px" }}>
        <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--slate)", marginBottom: 16 }}>Curated Fit</p>
        <h1 style={h1}>Privacy Policy</h1>
        <p style={{ ...body, marginTop: 20 }}>
          This policy explains how Curated Fit collects, uses, and protects the information you provide when
          you apply to join our professional network. Curated Fit is a service founded in New Zealand.
        </p>

        <h2 style={h2}>Information we collect</h2>
        <p style={body}>
          When you complete a professional application, we collect the details you submit, including your
          name, email address, mobile number, city and area, professional links, years of experience,
          registration details, qualifications, insurance status, availability, working locations and
          formats, areas of support, a short description of your work, and a professional headshot.
        </p>

        <h2 style={h2}>How we use your information</h2>
        <p style={body}>
          We use the information solely to assess your application, to contact you about your application,
          and, if approved, to create your Curated Fit profile and arrange suitable introductions. We record
          the date and time of your submission and your consent.
        </p>

        <h2 style={h2}>How we store your information</h2>
        <p style={body}>
          Applications are stored securely using our application and file-storage providers. Uploaded images
          are held with our file-storage provider and referenced in your application record. We retain
          application information for as long as necessary to assess and, where relevant, manage your
          participation in the network.
        </p>

        <h2 style={h2}>Sharing your information</h2>
        <p style={body}>
          We do not sell your information. Approved professional profiles may be shown to women seeking a
          suitable professional as part of the introductions process. We only share what is necessary to make
          an appropriate introduction.
        </p>

        <h2 style={h2}>Your choices</h2>
        <p style={body}>
          Marketing updates are optional and separate from your application. You can ask us to access, correct,
          or delete your information at any time by contacting us.
        </p>

        <h2 style={h2}>Contact</h2>
        <p style={body}>
          For any privacy questions or requests, contact us at{" "}
          <a href="mailto:welcome@curatedfit.co.nz" style={{ textDecoration: "underline", color: "var(--ink)" }}>welcome@curatedfit.co.nz</a>.
        </p>

        <p style={{ ...body, marginTop: 30, fontSize: 14 }}>
          <Link href="/terms" style={{ textDecoration: "underline" }}>Terms</Link> · <Link href="/" style={{ textDecoration: "underline" }}>Home</Link>
        </p>
      </section>

      <footer style={{ borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", padding: "28px 24px", fontSize: 14, color: "var(--muted)" }}>
          <span>© {new Date().getFullYear()} Curated Fit · Founded in New Zealand</span>
          <span style={{ display: "flex", gap: 20 }}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
            <a href="mailto:welcome@curatedfit.co.nz">Contact</a>
          </span>
        </div>
      </footer>
    </main>
  );
}
