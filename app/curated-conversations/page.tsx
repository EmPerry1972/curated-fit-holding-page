"use client";

const serif = "var(--font-serif), 'Playfair Display', Georgia, serif";
const mono = "var(--font-mono), 'IBM Plex Mono', ui-monospace, monospace";
const sans = "var(--font-sans), 'Inter', -apple-system, Helvetica, Arial, sans-serif";

const wrap = { maxWidth: 1080, margin: "0 auto", padding: "0 24px" } as const;
const sectionPad = { padding: "clamp(48px, 8vw, 88px) 0" } as const;

const eyebrow = {
  fontFamily: mono,
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--warm-grey)",
  marginBottom: 16,
} as const;

const h1 = {
  fontFamily: serif,
  fontWeight: 300,
  letterSpacing: "0.005em",
  fontSize: "clamp(34px, 6vw, 60px)",
  lineHeight: 1.1,
  color: "var(--text-primary)",
  margin: 0,
} as const;

const lede = {
  fontFamily: serif,
  fontWeight: 300,
  fontSize: "clamp(19px, 2.6vw, 26px)",
  lineHeight: 1.4,
  color: "var(--text-secondary)",
  margin: "24px 0 0",
  maxWidth: 720,
  fontStyle: "italic",
} as const;

const h2 = {
  fontFamily: serif,
  fontWeight: 300,
  fontSize: "clamp(24px, 3.4vw, 32px)",
  lineHeight: 1.15,
  color: "var(--text-primary)",
  margin: 0,
} as const;

const sectionLabel = {
  fontFamily: mono,
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--warm-grey)",
  marginBottom: 12,
} as const;

const cardEyebrow = {
  fontFamily: mono,
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--warm-grey)",
  margin: 0,
} as const;

const cardTitle = {
  fontFamily: serif,
  fontWeight: 400,
  fontSize: 20,
  lineHeight: 1.25,
  color: "var(--text-primary)",
  margin: "10px 0 0",
} as const;

const cardBody = {
  fontFamily: sans,
  fontSize: 15,
  lineHeight: 1.6,
  color: "var(--text-secondary)",
  margin: "10px 0 0",
} as const;

const cardMeta = {
  fontFamily: mono,
  fontSize: 11,
  letterSpacing: "0.06em",
  color: "var(--warm-grey)",
  margin: "16px 0 0",
} as const;

const PODCASTS = [
  {
    kind: "Podcast",
    title: "The morning it felt easier to get off the floor",
    body: "A conversation about strength that shows up in ordinary moments, and why it matters more than any number.",
    meta: "Episode 01 · 34 min",
  },
  {
    kind: "Podcast",
    title: "When the walk stopped being enough",
    body: "On recognising the point where everyday movement asks for a little more, and how to add it gently.",
    meta: "Episode 02 · 41 min",
  },
  {
    kind: "Podcast",
    title: "The years no one warned her about",
    body: "Menopause, muscle and the quiet changes that reshape how exercise feels from your forties onward.",
    meta: "Episode 03 · 38 min",
  },
];

const BLOGS = [
  {
    kind: "Written by a professional",
    title: "The afternoon she carried the shopping without thinking",
    body: "A trainer on building strength that disappears into everyday life, so capability becomes something you simply have.",
    meta: "Jessica Wacey · 6 min read",
  },
  {
    kind: "Written by a professional",
    title: "Returning after the season you stepped away",
    body: "Gentle, practical guidance for coming back to movement without starting from a place of pressure.",
    meta: "Aroha Ngata · 5 min read",
  },
  {
    kind: "Written by a professional",
    title: "The energy you notice by Thursday",
    body: "How consistent, well-matched training changes the way an ordinary week feels by the time you reach its end.",
    meta: "Daniel Reeve · 4 min read",
  },
];

function Card({ item }: { item: { kind: string; title: string; body: string; meta: string } }) {
  return (
    <div style={{ padding: 28, borderRight: "1px solid var(--line)" }}>
      <p style={cardEyebrow}>{item.kind}</p>
      <h3 style={cardTitle}>{item.title}</h3>
      <p style={cardBody}>{item.body}</p>
      <p style={cardMeta}>{item.meta}</p>
    </div>
  );
}

function Grid({ items }: { items: { kind: string; title: string; body: string; meta: string }[] }) {
  return (
    <div
      className="three-col"
      style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", border: "1px solid var(--line)", marginTop: 28 }}
    >
      {items.map((item, i) => (
        <div key={i} style={i === items.length - 1 ? { padding: 28 } : undefined}>
          {i === items.length - 1 ? (
            <div style={{ padding: 0 }}>
              <p style={cardEyebrow}>{item.kind}</p>
              <h3 style={cardTitle}>{item.title}</h3>
              <p style={cardBody}>{item.body}</p>
              <p style={cardMeta}>{item.meta}</p>
            </div>
          ) : (
            <Card item={item} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CuratedConversationsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--warm-white)" }}>
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
          <img src="/logo.png" alt="Curated Fit" style={{ height: 64 }} />
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
            borderRadius: 4,
            display: "inline-block",
            border: "1px solid var(--line)",
          }}
        >
          Register here as an Exercise Professional
        </a>
      </nav>

      <section style={{ ...sectionPad, paddingBottom: 0 }}>
        <div style={wrap}>
          <p style={eyebrow}>Stories, listening and reflection</p>
          <h1 style={h1}>Curated Conversations</h1>
          <p style={lede}>
            Every title carries a moment she&rsquo;d recognise before it carries a subject.
          </p>
        </div>
      </section>

      <section style={sectionPad}>
        <div style={wrap}>
          <p style={sectionLabel}>Listen</p>
          <h2 style={h2}>Podcasts</h2>
          <Grid items={PODCASTS} />
        </div>
      </section>

      <section style={{ ...sectionPad, paddingTop: 0 }}>
        <div style={wrap}>
          <p style={sectionLabel}>Read</p>
          <h2 style={h2}>From the professionals</h2>
          <Grid items={BLOGS} />
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--line)" }}>
        <div style={{ ...wrap, padding: "32px 24px" }}>
          <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.06em", color: "var(--warm-grey)", margin: 0 }}>
            &copy; 2026 Curated Fit &middot; Founded in New Zealand
          </p>
        </div>
      </footer>
    </main>
  );
}
