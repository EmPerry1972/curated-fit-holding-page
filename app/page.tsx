"use client";

import { useRef } from "react";

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
const h2 = { fontFamily: serif, fontWeight: 400, letterSpacing: "0.005em", fontSize: "clamp(24px, 3.4vw, 32px)", lineHeight: 1.15, color: "var(--ink)" } as const;
const h3 = { fontFamily: serif, fontWeight: 300, fontSize: 19, color: "var(--ink)", marginBottom: 8 } as const;
const body = { fontFamily: sans, fontSize: 17, lineHeight: 1.7, color: "var(--muted)", textAlign: "left" } as const;
const sectionPad = { padding: "clamp(56px, 8vw, 88px) 0" } as const;
const divider = { height: 1, background: "var(--line)", border: 0 } as const;
const cta = {
  display: "inline-block",
  background: "var(--ink)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "15px 30px",
  fontFamily: "inherit",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
} as const;
const stepNum = { fontFamily: mono, fontSize: 13, letterSpacing: "0.14em", color: "var(--warm-grey)" } as const;

export default function Page() {
  const topRef = useRef<HTMLDivElement>(null);
  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main ref={topRef}>
      <section className="hero-over-video" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <video
          src="https://videos.pexels.com/video-files/6970140/6970140-hd_1280_720_60fps.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(30,30,30,0.72) 0%, rgba(30,30,30,0.55) 30%, rgba(30,30,30,0.25) 60%, rgba(30,30,30,0.10) 100%), linear-gradient(180deg, rgba(30,30,30,0.35) 0%, rgba(30,30,30,0.15) 45%, rgba(30,30,30,0.45) 100%)", zIndex: 1 }} />

        <nav style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px", maxWidth: 1080, margin: "0 auto", width: "100%", flexWrap: "wrap", gap: 12 }}>
          <img src="/logo.png" alt="Curated Fit" style={{ height: 64, filter: "brightness(0) invert(1)" }} />
          <a href="/register" style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--warm-white)", textDecoration: "none" }}>
            Register here as an Exercise Professional
          </a>
        </nav>

        <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", textAlign: "left", padding: "clamp(48px, 8vw, 96px) 24px", maxWidth: 1080, margin: "0 auto", width: "100%" }}>
          <p style={{ ...eyebrow, color: "var(--warm-white)", marginBottom: 16 }}>The movement layer of Curated Wellness</p>
          <h1 style={{ maxWidth: 680,  ...h1, color: "var(--warm-white)" }}>The right place to begin starts with the right person.</h1>
          <p style={{ ...body, color: "var(--warm-white)", marginTop: 22, maxWidth: 500, textAlign: "left" }}>
            Curated Fit helps you find an exercise professional suited to what you want to achieve, where you would feel most comfortable, and the kind of support you would prefer.
          </p>
          <p style={{ ...body, color: "var(--warm-white)", marginTop: 16, maxWidth: 500, textAlign: "left" }}>
            Begin with a few considered questions, then choose from three professionals matched to your answers.
          </p>
          <div style={{ marginTop: 30 }}>
            <a href="/early-access" style={{ ...cta, textDecoration: "none" }}>Register your interest</a>
          </div>
        </div>
      </section>

      <section style={sectionPad}>
        <div style={wrap}>
          <div className="three-col" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            <div>
              <h3 style={h3}>Already active in your own way</h3>
              <p style={body}>Walking, gardening, golf, Pilates and everyday movement all matter. Curated Fit helps you understand what kind of support could complement what you already do.</p>
            </div>
            <div>
              <h3 style={h3}>Consistency starts with the right fit</h3>
              <p style={body}>A well-matched professional can help you find an approach that feels manageable enough to continue.</p>
            </div>
            <div>
              <h3 style={h3}>There is more than one way to build strength</h3>
              <p style={body}>It can begin simply, with thoughtful guidance and an approach suited to your experience.</p>
            </div>
          </div>
        </div>
      </section>

      <hr style={divider} />

      <section style={sectionPad}>
        <div style={{ ...wrap, maxWidth: 1080 }}>
          <div className="why-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 48, alignItems: "center" }}>
            <div>
              <p style={eyebrow}>Why muscle matters</p>
              <h2 style={h2}>Muscle is what keeps everyday life feeling easier.</h2>
              <p style={{ ...body, marginTop: 20 }}>You may already walk regularly, eat well and make thoughtful choices about your health. Muscle is often the part that receives less attention, even though it supports how you move, function and feel every day.</p>
              <p style={{ ...body, marginTop: 16 }}>From walking uphill and getting up from the floor to playing a round of golf and continuing to do the things you enjoy, muscle supports far more than exercise.</p>
              <p style={{ ...body, marginTop: 16 }}>From our 40s, changes associated with age and menopause can make muscle harder to maintain. Over time, everyday movement can begin to require more effort than it once did.</p>
              <p style={{ ...body, marginTop: 16 }}>Building strength helps support the physical capacity you rely on each day. Research also links resistance exercise with benefits for mood, memory and mental sharpness.</p>
              <p style={{ ...body, marginTop: 16 }}>It can begin simply, with an approach that suits your experience, your preferences and the way you want to live.</p>
              <p style={{ ...body, marginTop: 24, fontStyle: "italic", color: "var(--ink)" }}>Look after today, and tomorrow will look after itself.</p>
            </div>
            <div>
              <img src="/why-muscle-matters.jpg" alt="Why muscle matters" style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />
            </div>
          </div>
        </div>
      </section>

      

      <hr style={divider} />

      <section style={{ ...wrap, textAlign: "center", padding: "clamp(56px, 9vw, 96px) 24px" }}>
        <h2 style={h2}>You do not need to have every answer before you begin.</h2>
        <p style={{ ...body, marginTop: 20, maxWidth: 620, marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>Start with what matters to you today.</p>
        <p style={{ ...body, marginTop: 16, maxWidth: 620, marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>Answer a few considered questions and see three matched professionals, without creating an account or sharing your personal details.</p>
        <p style={{ ...body, marginTop: 16, maxWidth: 620, marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>There is no pressure to continue. Curated Fit helps make the next step clearer, while keeping the decision entirely yours.</p>
        <div style={{ marginTop: 30 }}>
          <a href="/early-access" style={{ ...cta, textDecoration: "none" }}>Register your interest</a>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", padding: "28px 24px", fontFamily: sans, fontSize: 13, color: "var(--muted)" }}>
          <span>ÃÂÃÂ© {new Date().getFullYear()} Curated Fit ÃÂÃÂ· Founded in New Zealand</span>
          <span style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <a href="/register" style={{ color: "var(--muted)" }}>Register as an Exercise Professional</a>
            <a href="/privacy" style={{ color: "var(--muted)" }}>Privacy Policy</a>
            <a href="/terms" style={{ color: "var(--muted)" }}>Terms</a>
            <a href="mailto:welcome@curatedfit.co.nz" style={{ color: "var(--muted)" }}>Contact</a>
          </span>
        </div>
      </footer>
    </main>
  );
}
