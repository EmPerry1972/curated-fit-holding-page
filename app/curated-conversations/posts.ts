// Curated Conversations journal posts.
// Copy is held here so the index and the article pages read from one source.

export type Block = { type: "h2" | "p"; text: string };

export type Post = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  date: string;
  dateLabel: string;
  readingTime: string;
  kind: string;
  body: Block[];
};

// Shared closing line across the journal.
export const CALL_TO_ACTION =
  "Tell us a little about yourself, and we will match you with an exercise professional worth your time.";

// Newest first. The index renders them in this order.
export const POSTS: Post[] = [
  {
    slug: "what-happens-in-a-first-session",
    title: "“I don’t know what actually happens in a first session”",
    metaTitle: "What Happens in a First Session | Curated Fit",
    metaDescription:
      "No surprises. What gets asked, what gets assessed, what you actually do, and what happens if something hurts.",
    excerpt:
      "No surprises. What gets asked, what gets assessed, what you actually do, and what happens if something hurts.",
    date: "2026-08-14",
    dateLabel: "14 August 2026",
    readingTime: "3 min read",
    kind: "Curated Fit Journal",
    body: [
      {
        type: "p",
        text: "It’s the question no one asks out loud, because it sounds like a small thing to be held up by. It’s not a small thing! Not knowing what an hour will involve is a perfectly good reason to keep not booking it.",
      },
      {
        type: "p",
        text: "So here’s a tour of what to expect in your very first hour with a PT. If you’re looking for a personal trainer in Auckland and this is the part you have been stuck on, read on.",
      },
      { type: "h2", text: "What actually happens, start to finish" },
      {
        type: "p",
        text: "The first ten to fifteen minutes are talking. You’ll chat through things such as: what you already do in a week, what has hurt in the past, what you are hoping to still be doing in a couple of decades, what you have tried before that did not stick, etc.",
      },
      {
        type: "p",
        text: "Then you’ll have some form of assessment. This varies depending on the person. It might be watching you stand up from a chair, walk, reach overhead and hold a light weight. There’s no pass mark and nothing to fail. The personal trainer is looking at how you move so they know where to begin.",
      },
      {
        type: "p",
        text: "Then you do a small amount of actual work. Usually four to six simple movements, well under what you are capable of, so you finish knowing you could have done more.",
      },
      { type: "p", text: "Then five minutes at the end deciding what happens next and when." },
      { type: "h2", text: "What they should ask you, and what it means if they don’t" },
      {
        type: "p",
        text: "A professional worth your time will ask about your sleep, your medications if relevant, any joint complaints, and what your week actually looks like rather than what you wish it looked like.",
      },
      {
        type: "p",
        text: "If nobody asks about the shoulder or the back or the hip, it tells you they likely run a template rather than work with the body in front of them.",
      },
      { type: "h2", text: "How much the first session decides" },
      {
        type: "p",
        text: "The exercises chosen in that first hour matter very little - almost any sensible starting programme will work at the beginning.",
      },
      {
        type: "p",
        text: "What the first session decides is whether you return. The behavioural research on this is consistent: early experience of competence and safety predicts continuation far better than the quality of the programme itself.",
      },
      {
        type: "p",
        text: "So the honest answer is that the first session is mostly about whether the fit is right, and only a little about the work.",
      },
      { type: "h2", text: "When would you notice anything" },
      {
        type: "p",
        text: "You will probably feel some muscle soreness a day or two later, mild and manageable, and it fades as your body adapts over the first two or three weeks.",
      },
      {
        type: "p",
        text: "For most people it takes three or four sessions before turning up stops being a decision and starts being a Tuesday (for example) - this is where it can start to feel sustainable.",
      },
      {
        type: "p",
        text: "Measurable strength changes generally arrive somewhere between eight and twelve weeks of consistent work.",
      },
      { type: "h2", text: "Where this leaves you" },
      {
        type: "p",
        text: "There’s nothing in that hour you need to prepare for, get fitter for, or be braver about. It’s a conversation, some observation, and a small amount of work with someone whose job is to pay attention to you and what you want.",
      },
    ],
  },
  {
    slug: "been-meaning-to-start",
    title: "“I’ve been meaning to start for about two years”",
    metaTitle: "Strength Training for Women Over 40 | Curated Fit",
    metaDescription:
      "You already know it matters. Why that hasn’t been enough to start, and how long strength work honestly takes.",
    excerpt:
      "You already know it matters. Why that hasn’t been enough to start, and how long strength work honestly takes.",
    date: "2026-08-11",
    dateLabel: "11 August 2026",
    readingTime: "3 min read",
    kind: "Curated Fit Journal",
    body: [
      {
        type: "p",
        text: "She usually says it lightly, tacked onto the end of a sentence about something else. A friend mentioned a class. A GP mentioned bone density. An article came up, got read properly, and got closed.",
      },
      {
        type: "p",
        text: "Two years is a long time to have an intention. The odd part is that nothing about the intention was ever wrong. If you have been meaning to begin strength training and still haven’t, the reason is never that you didn’t know it mattered.",
      },
      { type: "h2", text: "Why knowing hasn’t been enough" },
      {
        type: "p",
        text: "Information changes behaviour far less reliably than we assume. Knowing the mechanism, being able to explain it at dinner, having read the research properly: none of that does the work of starting.",
      },
      {
        type: "p",
        text: "What usually sits in the way is more specific than motivation. You don’t know what the first hour looks like. You don’t know whether you will be the least capable person they’ve ever trained. You don’t know whether your trainer will listen to your poor shoulder that has been complaining since 2019. You don’t know how to tell a good professional from a confident one.",
      },
      {
        type: "p",
        text: "Those aren’t willpower failures - they’re reasonable questions that nobody has answered for you, and an unanswered question is a rational reason to wait.",
      },
      { type: "h2", text: "What is actually happening in the meantime" },
      {
        type: "p",
        text: "Muscle mass declines gradually from the mid-thirties onward, and the rate picks up through the forties and fifties. Bone density follows a similar path, more sharply around menopause.",
      },
      {
        type: "p",
        text: "None of this is a reason to panic-buy a gym membership - it’s just the reason the conversation keeps finding you. It’s the ability to carry the shopping, get off the floor, hold a golf swing together, and garden for three hours on a Saturday without paying for it on Sunday.",
      },
      { type: "h2", text: "How good is the evidence" },
      {
        type: "p",
        text: "Strong - resistance work is one of the better-evidenced interventions in adult health for maintaining muscle mass and supporting bone density.",
      },
      {
        type: "p",
        text: "Where the evidence is thinner is the part people tend to skip. There is no reliable body of research on how to make a specific person start. What exists is behavioural work on habit formation, self-efficacy and environment, and it points in a consistent direction: people begin when the first step is small, specific and low-stakes, and when someone competent is expecting them.",
      },
      {
        type: "p",
        text: "So we are confident about what strength work does. We are honest that the hard part is the beginning, and that the beginning is mostly a design problem rather than a character flaw.",
      },
      { type: "h2", text: "When would you notice" },
      {
        type: "p",
        text: "The dread usually goes first. For most people it takes three or four sessions before turning up requires a big decision.",
      },
      {
        type: "p",
        text: "Measurable strength changes generally show up somewhere between eight and twelve weeks of consistent work. Twice a week, most weeks, beats four times a week for a fortnight and then nothing.",
      },
      {
        type: "p",
        text: "Bone responds more slowly again, over months rather than weeks, and it is not something you will feel. You will only ever see it on a scan.",
      },
      { type: "h2", text: "Where that leaves you" },
      {
        type: "p",
        text: "You do not need more information - you’ve had more than enough of it for years.",
      },
      {
        type: "p",
        text: "What’s missing is a first session with someone who suits how you actually want to be spoken to, in a setting you would willingly return to. That is the entire problem Curated Fit exists to solve.",
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((post) => post.slug === slug);
}
