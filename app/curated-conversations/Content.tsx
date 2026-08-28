import { ConversationsFooter, ConversationsNav } from "./Chrome";
import { EPISODES } from "./episodes";
import { CALL_TO_ACTION, POSTS } from "./posts";

const serif = "var(--font-serif), 'Playfair Display', Georgia, serif";
const mono = "var(--font-mono), 'IBM Plex Mono', ui-monospace, monospace";
const sans = "var(--font-sans), 'Inter', -apple-system, Helvetica, Arial, sans-serif";

const wrap = { maxWidth: 1080, margin: "0 auto", padding: "0 24px" } as const;
const sectionPad = { padding: "clamp(48px, 8vw, 88px) 0" } as const;

const h1 = {
  fontFamily: serif,
  fontWeight: 300,
  letterSpacing: "0.005em",
  fontSize: "clamp(34px, 6vw, 60px)",
  lineHeight: 1.1,
  color: "var(--text-primary)",
  margin: 0,
} as const;

// Display copy sits in divs rather than paragraphs: globals.css styles every
// <p> with !important, which would otherwise flatten these to body text.
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

const sectionLabel = {
  fontFamily: mono,
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--warm-grey)",
} as const;

const postMeta = {
  fontFamily: mono,
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--warm-grey)",
} as const;

const postTitle = {
  fontFamily: serif,
  fontWeight: 300,
  lineHeight: 1.2,
  color: "var(--text-primary)",
  margin: "12px 0 0",
} as const;

const postExcerpt = {
  fontFamily: sans,
  fontSize: 17,
  lineHeight: 1.6,
  color: "var(--text-secondary)",
  margin: "14px 0 0",
  maxWidth: 620,
} as const;

const readMore = {
  fontFamily: sans,
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "0.04em",
  color: "var(--text-primary)",
  textDecoration: "underline",
  display: "inline-block",
  marginTop: 18,
} as const;

const cta = {
  display: "inline-block",
  background: "var(--ink)",
  color: "var(--warm-white)",
  border: "none",
  borderRadius: 0,
  padding: "15px 30px",
  fontFamily: sans,
  fontSize: 16,
  fontWeight: 600,
  textDecoration: "none",
} as const;

export default function Content() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--warm-white)" }}>
      <ConversationsNav />

      <section style={{ ...sectionPad, paddingBottom: 0 }}>
        <div style={wrap}>
          <div style={{ ...sectionLabel, marginBottom: 16 }}>Stories, listening and reflection</div>
          <h1 style={h1}>Curated Conversations</h1>
          <div style={lede}>The questions that usually go unasked, answered honestly.</div>
        </div>
      </section>

      <section style={sectionPad}>
        <div style={wrap}>
          <div style={sectionLabel}>Listen</div>
          <div style={{ borderTop: "1px solid var(--line)", marginTop: 14 }}>
            {EPISODES.map((episode) => (
              <article
                key={episode.slug}
                style={{
                  borderBottom: "1px solid var(--line)",
                  padding: "36px 0",
                  display: "grid",
                  gridTemplateColumns: episode.guestImage ? "160px 1fr" : "1fr",
                  gap: 32,
                  alignItems: "start",
                }}
              >
                {episode.guestImage ? (
                  <a href={`/curated-conversations/${episode.slug}`} style={{ display: "block" }}>
                    <img
                      src={episode.guestImage}
                      alt={episode.guestImageAlt ?? ""}
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        borderRadius: "50%",
                        aspectRatio: "1 / 1",
                        objectFit: "cover",
                      }}
                    />
                  </a>
                ) : null}
                <div>
                  <div style={postMeta}>
                    {episode.dateLabel} &middot; {episode.duration}
                  </div>
                  <h2 style={{ ...postTitle, fontSize: "clamp(22px, 3vw, 30px)" }}>
                    <a href={`/curated-conversations/${episode.slug}`} style={{ color: "inherit" }}>
                      {episode.title}
                    </a>
                  </h2>
                  <div style={postExcerpt}>{episode.excerpt}</div>
                  {episode.guest ? (
                    <div style={{ ...postMeta, marginTop: 14 }}>{episode.guest}</div>
                  ) : null}
                  <audio controls preload="none" style={{ width: "100%", maxWidth: 520, marginTop: 20 }}>
                    <source src={episode.audio} />
                    Your browser does not support the audio element.
                  </audio>
                  <a href={`/curated-conversations/${episode.slug}`} style={readMore}>
                    Listen to this episode &rarr;
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionPad, paddingTop: 0 }}>
        <div style={wrap}>
          <div style={sectionLabel}>Read</div>
          <div style={{ borderTop: "1px solid var(--line)", marginTop: 14 }}>
            {POSTS.map((post) => (
              <article
                key={post.slug}
                className="journal-entry"
                style={{
                  borderBottom: "1px solid var(--line)",
                  padding: "36px 0",
                  display: "grid",
                  gridTemplateColumns: post.image ? "280px 1fr" : "1fr",
                  gap: 32,
                  alignItems: "start",
                }}
              >
                {post.image ? (
                  <a href={`/curated-conversations/${post.slug}`} style={{ display: "block" }}>
                    <img
                      src={post.image}
                      alt={post.imageAlt ?? ""}
                      style={{ width: "100%", height: "auto", display: "block", borderRadius: 6 }}
                    />
                  </a>
                ) : null}
                <div>
                  <div style={postMeta}>
                    {post.dateLabel} &middot; {post.readingTime}
                  </div>
                  <h2 style={postTitle}>
                    <a href={`/curated-conversations/${post.slug}`} style={{ color: "inherit" }}>
                      {post.title}
                    </a>
                  </h2>
                  <div style={postExcerpt}>{post.excerpt}</div>
                  <a href={`/curated-conversations/${post.slug}`} style={readMore}>
                    Read this piece &rarr;
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionPad, paddingTop: 0 }}>
        <div style={wrap}>
          <div style={{ ...lede, margin: 0, maxWidth: 620 }}>{CALL_TO_ACTION}</div>
          <div style={{ marginTop: 28 }}>
            <a href="/find-your-fit" style={cta}>
              Find your Fit
            </a>
          </div>
        </div>
      </section>

      <ConversationsFooter />
    </main>
  );
}
