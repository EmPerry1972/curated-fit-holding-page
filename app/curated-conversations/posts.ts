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
  // Optional until artwork exists for a post.
  image?: string;
  imageAlt?: string;
  body: Block[];
};

// Shared closing line across the journal.
export const CALL_TO_ACTION =
  "Tell us a little about yourself, and we will match you with an exercise professional worth your time.";

// Newest first. The index renders them in this order.
export const POSTS: Post[] = [
  {
    slug: "out-of-place-in-a-gym",
    title: "“I felt out of place the last time I walked into a gym”",
    metaTitle: "Women’s Gym Auckland: A Different Start | Curated Fit",
    metaDescription:
      "Feeling out of place in a gym is common and reasonable. What a different starting point actually looks like.",
    excerpt:
      "Feeling out of place in a gym is common and reasonable. What a different starting point actually looks like.",
    date: "2026-08-15",
    dateLabel: "15 August 2026",
    readingTime: "3 min read",
    kind: "Curated Fit Journal",
    body: [
      {
        type: "p",
        text: "The detail people remember about gyms is rarely the equipment. It’s the mirrors, the music or the fact that everyone else appeared to know exactly where they were going and what they were doing when they got there.",
      },
      {
        type: "p",
        text: "You left or you finished the session and did not go back, and you filed it under something you’re not suited to. Searching for a women’s gym in Auckland afterwards is a reasonable next move but it’s also not the only choice you have, and it may not even be the right one for you.",
      },
      { type: "h2", text: "Why gyms can make you feel insecure" },
      {
        type: "p",
        text: "A conventional gym is a space where everyone’s competence is on display. Everyone can see everyone. The equipment assumes you already know how it works. Nothing in the design of the room accounts for someone arriving without much of a plan.",
      },
      {
        type: "p",
        text: "That is not a criticism of gyms - they’re built for people who already go to gyms and they serve those people well.",
      },
      {
        type: "p",
        text: "But it does mean the feeling you had was a response to the environment rather than anything to do with your ability.",
      },
      { type: "h2", text: "What actually changes it" },
      {
        type: "p",
        text: "Someone expecting you - not a membership card and a room, but a person who knows your name and has already thought about what you are going to do before you arrive.",
      },
      {
        type: "p",
        text: "A setting you would return to - this might mean a small studio, a garage with good equipment in it, a park, or your own living room. It may also be a conventional gym, once someone is meeting you there.",
      },
      {
        type: "p",
        text: "A first session you finish knowing you could have done more - feeling capable at the end of the hour is what makes the second hour possible.",
      },
      {
        type: "p",
        text: "Self-efficacy, meaning your belief that you can do the thing, is one of the more reliable predictors of whether someone continues with exercise. Environment and social support both feed into it.",
      },
      {
        type: "p",
        text: "The setting has almost no bearing on whether the work is effective. A well-designed programme in a living room does what a well-designed programme in a gym does - your muscles aren’t fussed about where they are.",
      },
      { type: "h2", text: "When would you notice NOT being out of place?" },
      {
        type: "p",
        text: "The out-of-place feeling generally fades faster than people expect once the environment changes, often within the first two or three sessions.",
      },
      {
        type: "p",
        text: "Physical change follows the same timeline it always does. Things feel easier at four to six weeks. Measurable strength changes between eight and twelve.",
      },
      { type: "h2", text: "Where that leaves you" },
      {
        type: "p",
        text: "You do not need to become someone who is comfortable in a conventional gym. You need one professional, in one setting you would willingly return to - a much easier thing to arrange.",
      },
    ],
  },
  {
    slug: "body-feels-different-after-40",
    title: "“My body feels different and I can’t point to why”",
    metaTitle: "Muscle Loss After 40 | Curated Fit",
    metaDescription:
      "Your body feels different and you cannot point to why. What’s changing and what strength work does about it.",
    excerpt:
      "Your body feels different and you cannot point to why. What’s changing and what strength work does about it.",
    date: "2026-08-15",
    dateLabel: "15 August 2026",
    readingTime: "3 min read",
    kind: "Curated Fit Journal",
    image: "/journal/body-feels-different-after-40.jpg",
    imageAlt: "A woman doing a bodyweight squat on a mat in her living room.",
    body: [
      {
        type: "p",
        text: "The scales say roughly what they said five years ago (or crept up a bit) and nothing hurts in a way that’s worth mentioning to anyone.",
      },
      {
        type: "p",
        text: "But the stairs at the back of the house are a bit more of an event. Getting up off the floor requires a decision. The suitcase into the overhead locker used to be nothing and now it’s a bit of a struggle.",
      },
      {
        type: "p",
        text: "Muscle loss after 40 is one of the least dramatic things that will happen to your body but one of the most consequential.",
      },
      { type: "h2", text: "What’s actually changing" },
      {
        type: "p",
        text: "From your mid-thirties you lose muscle mass gradually - the rate increases through your forties and fifties. Nobody notices it happening because it happens at roughly one percent a year.",
      },
      {
        type: "p",
        text: "Two things follow. The first is strength, which is what you feel on the stairs. The second is less visible: muscle is where a large share of the body's glucose is taken up, so composition matters for more than appearance.",
      },
      { type: "h2", text: "How strength work helps" },
      {
        type: "p",
        text: "Strength work is the intervention for rebuilding muscle rather than simply slowing the loss. Not walking, not swimming, not even being generally active. Those are worth doing but they don’t ask enough of the muscle to make it rebuild.",
      },
      {
        type: "p",
        text: "What’s needed is less than most people assume. Even just one session a week, working muscles hard enough that the last few repetitions are difficult, is enough to make measurable change at this stage of life.",
      },
      {
        type: "p",
        text: "The point is not to look different - it’s to keep the suitcase, the stairs and the floor easy for another thirty years.",
      },
      { type: "h2", text: "How good is the evidence?" },
      {
        type: "p",
        text: "Resistance work for maintaining and rebuilding muscle in adults over forty is one of the better-supported findings in the field, replicated across decades and populations. It’s certainly not a contested area.",
      },
      {
        type: "p",
        text: "How much you personally will gain, how fast, and how that translates into the specific things you care most about depends on where you’re starting, your sleep, your protein intake and your consistency.",
      },
      {
        type: "p",
        text: "There is also no good evidence that any supplement replaces the work. Protein and creatine support what strength work does but they don’t substitute for it.",
      },
      { type: "h2", text: "When you’ll notice changes" },
      {
        type: "p",
        text: "Many people find things easier at four to six weeks even though nothing looks different, because early gains are largely your nervous system getting better at recruiting the muscle you already have.",
      },
      {
        type: "p",
        text: "Measurable changes in muscle generally show up between eight and twelve weeks of consistent work. Consistent means once a week, most weeks. The stairs are a better measure than the mirror, and a much better one than the scales.",
      },
      { type: "h2", text: "Where that leaves you" },
      {
        type: "p",
        text: "You are not imagining it and it’s not simply age doing something to you that cannot be answered - it’s a specific, well-understood change with a specific, well-evidenced response.",
      },
      {
        type: "p",
        text: "The response takes one session a week and someone who knows how to start you off - that’s it.",
      },
    ],
  },
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
    image: "/journal/what-happens-in-a-first-session.jpg",
    imageAlt:
      "An exercise professional with a clipboard, sitting and talking with a client on a gym floor.",
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
    image: "/journal/been-meaning-to-start.jpg",
    imageAlt:
      "A woman on a country road with her arms raised, facing snow-covered mountains.",
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
