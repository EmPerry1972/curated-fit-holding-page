import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConversationsFooter, ConversationsNav } from "../Chrome";
import { CALL_TO_ACTION, POSTS, getPost } from "../posts";
import { EPISODES, getEpisode } from "../episodes";
import { CONVERSATIONS_PUBLISHED } from "../../config";

// While unpublished, a post can still be previewed at:
//   /curated-conversations/<slug>?preview=cf-preview-2026
const PREVIEW_KEY = "cf-preview-2026";

const serif = "var(--font-serif), 'Playfair Display', Georgia, serif";
const mono = "var(--font-mono), 'IBM Plex Mono', ui-monospace, monospace";
const sans = "var(--font-sans), 'Inter', -apple-system, Helvetica, Arial, sans-serif";

// Narrow enough that the rules and headings sit close to the 65ch measure
// globals.css puts on body paragraphs.
const wrap = { maxWidth: 640, margin: "0 auto", padding: "0 24px" } as const;

// Display copy sits in divs rather than paragraphs: globals.css styles every
// <p> with !important, which would otherwise flatten these to body text.
const meta = {
  fontFamily: mono,
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--warm-grey)",
} as const;

const backLink = {
  fontFamily: sans,
  fontSize: 12,
  color: "#8a8a82",
  textDecoration: "underline",
  display: "inline-block",
} as const;

const standfirst = {
  fontFamily: serif,
  fontWeight: 300,
  fontStyle: "italic",
  fontSize: "clamp(19px, 2.6vw, 24px)",
  lineHeight: 1.4,
  color: "var(--text-secondary)",
  margin: "24px 0 0",
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

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;

  const post = getPost(slug);
  if (post) {
    const url = `/curated-conversations/${post.slug}`;
    return {
      title: post.metaTitle,
      description: post.metaDescription,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        siteName: "Curated Fit",
        title: post.metaTitle,
        description: post.metaDescription,
        url,
        locale: "en_NZ",
        publishedTime: post.date,
      },
      twitter: {
        card: "summary_large_image",
        title: post.metaTitle,
        description: post.metaDescription,
      },
    };
  }

  const episode = getEpisode(slug);
  if (episode) {
    const url = `/curated-conversations/${episode.slug}`;
    const images = episode.guestImage ? [{ url: episode.guestImage }] : undefined;
    return {
      title: episode.title,
      description: episode.excerpt,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        siteName: "Curated Fit",
        title: episode.title,
        description: episode.excerpt,
        url,
        locale: "en_NZ",
        publishedTime: episode.date,
        images,
      },
      twitter: {
        card: images ? "summary_large_image" : "summary",
        title: episode.title,
        description: episode.excerpt,
      },
    };
  }

  return {};
}

export default async function CuratedConversationsPost({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const previewOk = query?.preview === PREVIEW_KEY;

  if (!CONVERSATIONS_PUBLISHED && !previewOk) {
    notFound();
  }

  const post = getPost(slug);
  const episode = post ? undefined : getEpisode(slug);

  if (!post && !episode) {
    notFound();
  }

  if (episode) {
    const otherEpisodes = EPISODES.filter((other) => other.slug !== episode.slug);

    return (
      <main style={{ minHeight: "100vh", background: "var(--warm-white)" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "PodcastEpisode",
              name: episode.title,
              description: episode.excerpt,
              datePublished: episode.date,
              inLanguage: "en-NZ",
              associatedMedia: { "@type": "MediaObject", contentUrl: episode.audio },
              partOfSeries: { "@type": "PodcastSeries", name: "Curated Conversations" },
              publisher: { "@type": "Organization", name: "Curated Fit" },
              mainEntityOfPage: `https://www.curatedfit.co.nz/curated-conversations/${episode.slug}`,
            }),
          }}
        />

        <ConversationsNav />

        <article style={{ padding: "clamp(40px, 6vw, 72px) 0" }}>
          <div style={wrap}>
            <a href="/curated-conversations" style={backLink}>
              &larr; Curated Conversations
            </a>
            <div style={{ ...meta, marginTop: 28 }}>
              Listen &middot; {episode.dateLabel} &middot; {episode.duration}
            </div>
            <h1 style={{ marginTop: 14 }}>{episode.title}</h1>
            <div style={standfirst}>{episode.excerpt}</div>

            {episode.guestImage ? (
              <img
                src={episode.guestImage}
                alt={episode.guestImageAlt ?? ""}
                style={{
                  width: 120,
                  height: 120,
                  display: "block",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginTop: 36,
                }}
              />
            ) : null}

            {episode.guest ? (
              <div style={{ ...meta, marginTop: 18, textTransform: "none", letterSpacing: 0, fontSize: 14 }}>
                {episode.guest}
              </div>
            ) : null}

            <audio controls preload="none" style={{ width: "100%", maxWidth: 520, marginTop: 28 }}>
              <source src={episode.audio} />
              Your browser does not support the audio element.
            </audio>

            <div
              style={{
                marginTop: 56,
                paddingTop: 40,
                borderTop: "1px solid var(--line)",
              }}
            >
              <div style={{ ...standfirst, margin: 0 }}>{CALL_TO_ACTION}</div>
              <div style={{ marginTop: 28 }}>
                <a href="/find-your-fit" style={cta}>
                  Find your Fit
                </a>
              </div>
            </div>
          </div>
        </article>

        {(otherEpisodes.length > 0 || POSTS.length > 0) && (
          <section style={{ padding: "0 0 clamp(48px, 8vw, 88px)" }}>
            <div style={wrap}>
              <div style={{ ...meta, letterSpacing: "0.14em" }}>More from Curated Conversations</div>
              <div style={{ borderTop: "1px solid var(--line)", marginTop: 14 }}>
                {otherEpisodes.map((other) => (
                  <div key={other.slug} style={{ borderBottom: "1px solid var(--line)", padding: "28px 0" }}>
                    <div style={meta}>
                      {other.dateLabel} &middot; {other.duration}
                    </div>
                    <h3 style={{ marginTop: 10 }}>
                      <a href={`/curated-conversations/${other.slug}`} style={{ color: "inherit" }}>
                        {other.title}
                      </a>
                    </h3>
                  </div>
                ))}
                {POSTS.map((other) => (
                  <div key={other.slug} style={{ borderBottom: "1px solid var(--line)", padding: "28px 0" }}>
                    <div style={meta}>
                      {other.dateLabel} &middot; {other.readingTime}
                    </div>
                    <h3 style={{ marginTop: 10 }}>
                      <a href={`/curated-conversations/${other.slug}`} style={{ color: "inherit" }}>
                        {other.title}
                      </a>
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <ConversationsFooter />
      </main>
    );
  }

  const others = POSTS.filter((other) => other.slug !== post.slug);

  return (
    <main style={{ minHeight: "100vh", background: "var(--warm-white)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.metaDescription,
            datePublished: post.date,
            inLanguage: "en-NZ",
            author: { "@type": "Organization", name: "Curated Fit" },
            publisher: { "@type": "Organization", name: "Curated Fit" },
            mainEntityOfPage: `https://www.curatedfit.co.nz/curated-conversations/${post.slug}`,
          }),
        }}
      />

      <ConversationsNav />

      <article style={{ padding: "clamp(40px, 6vw, 72px) 0" }}>
        <div style={wrap}>
          <a href="/curated-conversations" style={backLink}>
            &larr; Curated Conversations
          </a>
          <div style={{ ...meta, marginTop: 28 }}>
            {post.kind} &middot; {post.dateLabel} &middot; {post.readingTime}
          </div>
          <h1 style={{ marginTop: 14 }}>{post.title}</h1>
          <div style={standfirst}>{post.metaDescription}</div>

          {post.image ? (
            <img
              src={post.image}
              alt={post.imageAlt ?? ""}
              style={{ width: "100%", height: "auto", display: "block", marginTop: 36 }}
            />
          ) : null}

          <hr style={{ height: 1, background: "var(--line)", border: 0, margin: "40px 0 0" }} />

          {post.body.map((block, i) => {
            if (block.type === "h2") {
              return (
                <h2 key={i} style={{ marginTop: 44 }}>
                  {block.text}
                </h2>
              );
            }
            if (block.type === "list") {
              return (
                <ul key={i} style={{ margin: "18px 0 0", paddingLeft: 22, maxWidth: "65ch" }}>
                  {block.items.map((item, j) => (
                    <li
                      key={j}
                      style={{
                        fontFamily: sans,
                        fontSize: 16,
                        lineHeight: 1.65,
                        color: "var(--text-primary)",
                        marginTop: j === 0 ? 0 : 12,
                      }}
                    >
                      {item.lead ? <strong>{item.lead}</strong> : null}
                      {item.lead ? " " : null}
                      {item.text}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} style={{ marginTop: 18 }}>
                {block.text}
              </p>
            );
          })}

          {post.sources?.length ? (
            <section style={{ marginTop: 56, paddingTop: 32, borderTop: "1px solid var(--line)" }}>
              <div style={{ ...meta, letterSpacing: "0.14em" }}>Sources</div>
              <ol style={{ margin: "18px 0 0", paddingLeft: 22 }}>
                {post.sources.map((source, i) => (
                  <li
                    key={i}
                    style={{
                      fontFamily: sans,
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "var(--text-secondary)",
                      marginTop: i === 0 ? 0 : 12,
                    }}
                  >
                    {source.note} -{" "}
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--text-primary)", textDecoration: "underline" }}
                    >
                      {source.citation}
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <div
            style={{
              marginTop: 56,
              paddingTop: 40,
              borderTop: "1px solid var(--line)",
            }}
          >
            <div style={{ ...standfirst, margin: 0 }}>{CALL_TO_ACTION}</div>
            <div style={{ marginTop: 28 }}>
              <a href="/find-your-fit" style={cta}>
                Find your Fit
              </a>
            </div>
          </div>
        </div>
      </article>

      {others.length > 0 && (
        <section style={{ padding: "0 0 clamp(48px, 8vw, 88px)" }}>
          <div style={wrap}>
            <div style={{ ...meta, letterSpacing: "0.14em" }}>More from Curated Conversations</div>
            <div style={{ borderTop: "1px solid var(--line)", marginTop: 14 }}>
              {others.map((other) => (
                <div key={other.slug} style={{ borderBottom: "1px solid var(--line)", padding: "28px 0" }}>
                  <div style={meta}>
                    {other.dateLabel} &middot; {other.readingTime}
                  </div>
                  <h3 style={{ marginTop: 10 }}>
                    <a href={`/curated-conversations/${other.slug}`} style={{ color: "inherit" }}>
                      {other.title}
                    </a>
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <ConversationsFooter />
    </main>
  );
}
