import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConversationsFooter, ConversationsNav } from "../Chrome";
import { CALL_TO_ACTION, POSTS, getPost } from "../posts";
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
  if (!post) return {};

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
  if (!post) {
    notFound();
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

          {post.body.map((block, i) =>
            block.type === "h2" ? (
              <h2 key={i} style={{ marginTop: 44 }}>
                {block.text}
              </h2>
            ) : (
              <p key={i} style={{ marginTop: 18 }}>
                {block.text}
              </p>
            ),
          )}

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
