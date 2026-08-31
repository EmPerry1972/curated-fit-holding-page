// Curated Conversations journal posts.
// Copy is held here so the index and the article pages read from one source.

// A list item can open with a bold lead-in, as the briefs write them.
export type ListItem = { lead?: string; text: string };

export type Block =
  | { type: "h2" | "p"; text: string }
  | { type: "list"; items: ListItem[] };

// A footnote entry: which claim it supports, and where that comes from.
export type Source = { note: string; citation: string; url: string };

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
  // Footnoted at the end of the post, where a piece makes claims worth
  // substantiating.
  sources?: Source[];
};

// Shared closing line across the journal.
export const CALL_TO_ACTION =
  "Tell us a little about yourself, and we will match you with an exercise professional worth your time.";

// Newest first. The index renders them in this order.
export const POSTS: Post[] = [
  {
    slug: "not-about-longevity",
    title: "This isn’t about longevity. It’s about today.",
    metaTitle: "Strength Training for Women Over 40 | Curated Fit",
    metaDescription:
      "Not about what happens in thirty years. About whether today feels harder than it used to.",
    excerpt:
      "Not about what happens in thirty years. About whether today feels harder than it used to.",
    date: "2026-08-31",
    dateLabel: "31 August 2026",
    readingTime: "2 min read",
    kind: "Curated Fit Journal",
    image: "/journal/not-about-longevity.jpg",
    imageAlt: "A woman sitting in a chair with a notebook and pen, looking away in thought.",
    body: [
      {
        type: "p",
        text: "Much of what gets written for women in their forties is written about a woman in her eighties. Healthspan, ageing well, adding “years to your life and life to your years”.",
      },
      {
        type: "p",
        text: "It’s not wrong, but it’s hard to relate to a statistic about your eighties. What you can feel is that the stairs are more of a chore than they used to be.",
      },
      { type: "h2", text: "What we’re talking about when we say “today”" },
      {
        type: "p",
        text: "It’s about getting up off the floor without hands, carrying both bags in one trip, putting the case in the overhead locker yourself. It’s even about playing eighteen holes and being fine on Sunday, or gardening for three hours and not paying for it the next day.",
      },
      {
        type: "p",
        text: "That’s the list - it’s short, specific and every item is something you either can do easily now or you can’t. Nothing is about living longer. And ALL of it is about how this week goes.",
      },
      { type: "h2", text: "Why the long-term framing doesn’t work" },
      {
        type: "p",
        text: "Nobody sustains a habit on that basis. The behavioural research on this is fairly consistent - distant, abstract rewards are poor motivators, and immediate, noticeable ones are better. Pretty inconvenient for an industry that often sells the distant kind.",
      },
      { type: "h2", text: "What you’ll actually notice, and when" },
      {
        type: "p",
        text: "Once you start strength training today, things feel easier at four to six weeks, before anything looks different. That’s largely your nervous system getting better at using the muscle you already have, and it’s the first signal.",
      },
      {
        type: "p",
        text: "The stairs, the floor and the suitcase are the measures. They’re better than the mirror and much better than the scales, because they’re the things you actually use your body for.",
      },
      { type: "h2", text: "The part we’re not going to skip" },
      {
        type: "p",
        text: "Strength work does have long-term effects, and they’re well evidenced. Muscle and bone both respond to being loaded and both matter later. We’re not pretending otherwise.",
      },
      {
        type: "p",
        text: "We’re just saying it’s not a great reason to start, because it’s a reason you can’t feel nowish. The long-term benefit arrives whether or not it’s what got you through the door - so we’d rather sell you the thing you’ll notice.",
      },
      { type: "h2", text: "Where that leaves you" },
      {
        type: "p",
        text: "If you’re waiting to feel motivated by what happens in thirty years, you’ll wait. Start because the stairs are annoying you now. That’s a good enough reason and it’s the one that works.",
      },
    ],
    sources: [
      {
        note: "Immediate rewards motivating better than distant ones",
        citation: "Do immediate external rewards really enhance intrinsic motivation? Frontiers in Psychology, 2022",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9150741/",
      },
      {
        note: "How that plays out in exercise behaviour specifically",
        citation: "Temporal discounting rates and their relation to exercise behavior in older adults",
        url: "https://pubmed.ncbi.nlm.nih.gov/26440317/",
      },
      {
        note: "Muscle responding to being loaded",
        citation:
          "Effects of resistance training, endurance training and whole-body vibration on lean body mass, muscle strength and physical performance in older people: a systematic review and network meta-analysis, Age and Ageing, 2018",
        url: "https://academic.oup.com/ageing/article/47/3/367/4868620",
      },
      {
        note: "Bone responding to being loaded",
        citation:
          "Watson et al., LIFTMOR randomised controlled trial, Journal of Bone and Mineral Research, 2018",
        url: "https://pubmed.ncbi.nlm.nih.gov/28975661/",
      },
      {
        note: "Early gains being largely neural, before anything looks different",
        citation: "Moritani and deVries, Neural factors versus hypertrophy, 1979",
        url: "https://pubmed.ncbi.nlm.nih.gov/453338/",
      },
    ],
  },
  {
    slug: "walking-and-strength",
    title: "“I walk most days, isn’t that enough?”",
    metaTitle: "Walking vs Strength Work After 40 | Curated Fit",
    metaDescription:
      "Walking is worth doing and it isn’t strength work. Where one stops and the other begins.",
    excerpt:
      "Walking is worth doing and it isn’t strength work. Where one stops and the other begins.",
    date: "2026-08-28",
    dateLabel: "28 August 2026",
    readingTime: "3 min read",
    kind: "Curated Fit Journal",
    image: "/journal/walking-and-strength.jpg",
    imageAlt: "A woman walking a waterfront path at dusk, with the Auckland skyline behind her.",
    body: [
      {
        type: "p",
        text: "The short answer is that walking is genuinely worth doing and it isn’t a substitute for strength work. Those two things are both true and they definitely don’t cancel each other out.",
      },
      { type: "h2", text: "What walking is very good at" },
      {
        type: "p",
        text: "It’s the easiest thing in the world to keep doing, which is key. It’s good for your heart, it’s good for your head, it gets you outside and it costs nothing. If you walk most days you’ve already solved the problem many people never do, which is doing something regularly. None of the following is an argument for walking less.",
      },
      { type: "h2", text: "Where it stops" },
      {
        type: "p",
        text: "Muscle only holds onto itself when something asks it to. The signal it responds to is effort near its limit - a load heavy enough that you couldn’t do many more repetitions.",
      },
      {
        type: "p",
        text: "Walking doesn’t provide that because well, it just can’t. Your legs are already comfortable carrying you, which is exactly what makes walking sustainable. The thing that makes it easy to keep doing is the same thing that stops it building anything. That’s the distinction - walking maintains the habit but it doesn’t maintain the muscle.",
      },
      { type: "h2", text: "Why that matters now" },
      {
        type: "p",
        text: "From your mid-thirties onwards you lose muscle gradually if nothing intervenes - bone follows a similar pattern.",
      },
      {
        type: "p",
        text: "You’d notice it as the stairs being slightly more of an issue, or getting up off the floor involving a couple of hands, or the suitcase being heavier than it was. Not dramatic, just a bit more effort for the same things than there used to be.",
      },
      {
        type: "p",
        text: "Walking every day and still finding those things harder isn’t a sign you’re doing it wrong. It’s a sign you’re doing one thing well and a different thing not at all.",
      },
      { type: "h2", text: "How good is the evidence" },
      {
        type: "p",
        text: "It’s very strong (excuse the pun) and unusually clear-cut for this field. Walking and other low-intensity activity have well-documented benefits but they don’t reliably build or preserve muscle mass - resistance work does.",
      },
      {
        type: "p",
        text: "Where it gets less clear is dose - exactly how much resistance work, at what intensity, for a specific person. The general finding is solid, the personal prescription isn’t so much unfortunately.",
      },
      { type: "h2", text: "What to add in terms of exercise" },
      {
        type: "p",
        text: "You don’t need a gym and you don’t need to slog it out for an hour. What you need is enough load that the last few repetitions are hard, which is the part that’s difficult to get right on your own - most people going it alone stay comfortable, and comfortable is the one thing that doesn’t work here.",
      },
      { type: "h2", text: "Where that leaves you" },
      {
        type: "p",
        text: "Keep walking! It’s doing something real and it’s a great habit. Then add the thing walking can’t do, even just once a week, with someone who’ll help you do it well.",
      },
    ],
    sources: [
      {
        note: "Muscle mass and strength declining with age if nothing intervenes",
        citation:
          "Sarcopenia, dynapenia, and the impact of advancing age on human skeletal muscle size and strength: a quantitative review",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3429036/",
      },
      {
        note: "Bone following a similar pattern for women through midlife",
        citation:
          "Bone mineral density changes during the menopause transition in a multiethnic cohort of women (SWAN), 2008",
        url: "https://pubmed.ncbi.nlm.nih.gov/18160467/",
      },
      {
        note: "Resistance work building lean mass where endurance activity does not",
        citation:
          "Effects of resistance training, endurance training and whole-body vibration on lean body mass, muscle strength and physical performance in older people: a systematic review and network meta-analysis, Age and Ageing, 2018",
        url: "https://academic.oup.com/ageing/article/47/3/367/4868620",
      },
    ],
  },
  {
    slug: "personal-trainer-cost-auckland",
    title: "What does a personal trainer actually cost in Auckland?",
    metaTitle: "Personal Trainer Cost Auckland | Curated Fit",
    metaDescription:
      "What you’ll actually pay, what changes the price, and what to ask before you commit to anyone.",
    excerpt:
      "What you’ll actually pay, what changes the price, and what to ask before you commit to anyone.",
    date: "2026-08-25",
    dateLabel: "25 August 2026",
    readingTime: "3 min read",
    kind: "Curated Fit Journal",
    image: "/journal/personal-trainer-cost-auckland.jpg",
    imageAlt: "A woman at a kitchen table with a notebook and a laptop, looking out of the window.",
    body: [
      {
        type: "p",
        text: "Personal trainer rates are rarely published. Most websites describe their approach and then ask you to book a consultation to find out the rate. Here are the numbers and the variables that move them.",
      },
      { type: "h2", text: "The range" },
      {
        type: "p",
        text: "One-to-one sessions in Auckland generally fall between $50 and $150 per hour, with the majority near $80.",
      },
      {
        type: "p",
        text: "Small group sessions of two to four people run lower per person, roughly $30 to $70 per person per session.",
      },
      {
        type: "p",
        text: "Block pricing is standard. Five and ten-session blocks usually reduce the per-session rate, and single sessions are typically charged at the upper end.",
      },
      { type: "h2", text: "What determines the rate" },
      {
        type: "list",
        items: [
          {
            lead: "Location.",
            text: "A commercial gym carries rent, which is reflected in the rate. A professional travelling to your home is charging for travel time. A small private studio generally sits between the two.",
          },
          {
            lead: "Experience.",
            text: "Longer-practising professionals charge more, which is often justified where there’s a history of injury or a condition to work around.",
          },
          {
            lead: "Specialisation.",
            text: "Someone working primarily with women over 40, or with return-to-exercise after injury, will generally charge above a generalist.",
          },
          {
            lead: "Frequency.",
            text: "Twice weekly is nearly always lower per session than once weekly. Fortnightly is usually the most expensive way to buy this service.",
          },
        ],
      },
      { type: "h2", text: "What the rate doesn’t tell you" },
      {
        type: "p",
        text: "There’s no reliable correlation between hourly rate and whether a client is still going at three months. Retention is determined by fit, scheduling and the first few sessions, not by price.",
      },
      {
        type: "p",
        text: "The rate does indicate something about supply. A price well below the local range usually reflects part-time operation, which has implications for availability and continuity.",
      },
      { type: "h2", text: "What to establish before committing" },
      {
        type: "list",
        items: [
          {
            lead: "Is this per session or per block, and what’s the cancellation policy?",
            text: "Terms vary considerably and this is where most disputes happen.",
          },
          {
            lead: "What’s provided between sessions?",
            text: "Some professionals include a programme for the other days at no additional cost and some don’t - both are legitimate, but you should know which applies.",
          },
          {
            lead: "What’s the minimum commitment?",
            text: "A commitment longer than a month before you’ve met them warrants scrutiny.",
          },
          {
            lead: "How many current clients are in a comparable position to me?",
            text: "Current, not cumulative.",
          },
        ],
      },
      { type: "h2", text: "Cost relative to the alternative" },
      {
        type: "p",
        text: "The relevant comparison isn’t hourly rate against hourly rate - it’s total spend against sessions actually attended.",
      },
      {
        type: "p",
        text: "A gym membership used twice a month carries a higher effective cost per session than most one-to-one arrangements. If you already exercise consistently without supervision the calculation runs the other way.",
      },
      { type: "h2", text: "Where that leaves you" },
      {
        type: "p",
        text: "You now have the range, the variables and the questions to ask. What remains is narrowing the field to professionals whose rate, location and working method match your requirements.",
      },
    ],
  },
  {
    slug: "reached-my-goal-weight",
    title: "“I’ve reached my goal weight.” What needs protecting now",
    metaTitle: "Protecting Muscle After Weight Loss | Curated Fit",
    metaDescription:
      "You’ve reached your goal weight. What’s worth protecting now, and why the movement side matters most.",
    excerpt:
      "You’ve reached your goal weight. What’s worth protecting now, and why the movement side matters most.",
    date: "2026-08-25",
    dateLabel: "25 August 2026",
    readingTime: "3 min read",
    kind: "Curated Fit Journal",
    image: "/journal/reached-my-goal-weight.jpg",
    imageAlt: "A woman sitting on driftwood on a beach at dusk, looking out to sea.",
    body: [
      {
        type: "p",
        text: "Believe it or not, reaching a goal weight can be an anticlimax. The number arrives and the structure that produced it - the plan, the appointments, the advice - stops with it. Almost none of that was aimed at what happens next.",
      },
      { type: "h2", text: "What comes off with the weight" },
      {
        type: "p",
        text: "Weight loss isn’t selective. Any reduction in body weight, by any method, draws on both fat mass and lean mass (lean mass is mostly skeletal muscle).",
      },
      {
        type: "p",
        text: "The proportion varies. The main determinants are the rate of loss, protein intake during it, and whether the muscle was being loaded at the time. Faster loss and lower protein intake both increase the share that comes from lean tissue.",
      },
      {
        type: "p",
        text: "The result is a lighter body carrying less of the tissue that produces force. This is why some women report feeling weaker at their goal weight than they did carrying more, and why the number on the scale can improve while function doesn’t.",
      },
      { type: "h2", text: "What’s worth protecting and why it matters now" },
      {
        type: "p",
        text: "Skeletal muscle, and the force it produces, is totally worth protecting. Muscle mass determines maximum force output, and force output is what carrying shopping, rising from a low chair and climbing stairs under load require. As lean mass falls, those tasks consume a higher percentage of available capacity. That’s what registers as things being harder.",
      },
      { type: "h2", text: "What maintains it" },
      {
        type: "p",
        text: "Resistance exercise, two to three times a week. Muscle mass responds to mechanical loading and without a sufficient load stimulus it declines regardless of diet. Walking and other low-intensity activity don’t supply that stimulus, because the load sits well below the threshold that triggers adaptation.",
      },
      {
        type: "p",
        text: "The effective dose is modest - a small number of compound movements, loaded so the final repetitions approach “failure”, performed consistently.",
      },
      {
        type: "p",
        text: "Adequate protein is a requirement rather than an addition. It supplies the substrate; the loading supplies the signal.",
      },
      { type: "h2", text: "What the evidence supports" },
      {
        type: "p",
        text: "Resistance exercise during and after weight loss preserves more lean mass than the same weight loss without it. This is pretty well evidenced.",
      },
      {
        type: "p",
        text: "What the evidence doesn’t support is your individual prediction. The magnitude and rate vary with baseline muscle mass, how quickly the weight came off, protein intake and consistency.",
      },
      {
        type: "p",
        text: "If the weight loss was medically supervised, maintenance is a conversation for the clinician who supervised it, which covers the exercise component only.",
      },
      { type: "h2", text: "Strength changes precede visible ones" },
      {
        type: "p",
        text: "Improvements in force production are typically reported at four to six weeks and are largely neural - better recruitment of existing muscle rather than new tissue.",
      },
      {
        type: "p",
        text: "Measurable change in muscle mass generally occurs between eight and twelve weeks of consistent loading.",
      },
      {
        type: "p",
        text: "Function is a more useful measure than either the mirror or the scale - getting up from a chair without using your hands, and carrying a load upstairs, are both testable at home.",
      },
      { type: "h2", text: "Where that leaves you" },
      {
        type: "p",
        text: "Weight loss and weight maintenance are different beasts and they need different interventions. The first is largely dietary. The second is largely mechanical.",
      },
      {
        type: "p",
        text: "Even one resistance session a week can start the intervention, so why not start now?",
      },
    ],
    sources: [
      {
        note: "Lean mass coming off alongside fat, and the part played by the rate of loss and protein intake",
        citation:
          "Cava, Yeat and Mittendorfer, Preserving healthy muscle during weight loss, Advances in Nutrition, 2017",
        url: "https://academic.oup.com/advances/article/8/3/511/4558114",
      },
      {
        note: "Resistance exercise preserving lean mass through weight loss",
        citation:
          "Resistance training prevents muscle loss induced by caloric restriction in obese elderly individuals: a systematic review and meta-analysis, 2018",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5946208/",
      },
      {
        note: "Early strength gains being largely neural, before muscle change is measurable",
        citation: "Moritani and deVries, Neural factors versus hypertrophy, 1979",
        url: "https://pubmed.ncbi.nlm.nih.gov/453338/",
      },
    ],
  },
  {
    slug: "how-the-matching-works",
    title: "“How do you decide who’s right for me?”",
    metaTitle: "How Curated Fit Matching Works | Curated Fit",
    metaDescription:
      "Not a directory and not a search box. What we ask and what we know and don’t know about a match.",
    excerpt:
      "Not a directory and not a search box. What we ask and what we know and don’t know about a match.",
    date: "2026-08-19",
    dateLabel: "19 August 2026",
    readingTime: "3 min read",
    kind: "Curated Fit Journal",
    image: "/journal/how-the-matching-works.jpg",
    imageAlt:
      "An exercise professional with a notebook, talking with a client in a gym.",
    body: [
      {
        type: "p",
        text: "Searching for a personal trainer near me returns a list. A list isn’t a recommendation and sorting one requires the expertise you’re trying to buy. So here is what we do instead, described so you can judge whether it is worth giving a go.",
      },
      { type: "h2", text: "What we ask you" },
      {
        type: "p",
        text: "Where you are and how far you would actually travel. Not how far you would like to think you would travel.",
      },
      {
        type: "p",
        text: "What you already do in a week. Walking, gardening, golf, swimming, nothing at all - all are useful answers.",
      },
      {
        type: "p",
        text: "What has hurt, currently or historically. This is the single most useful thing you can tell us and the thing people most often leave out.",
      },
      {
        type: "p",
        text: "How you want to be spoken to. Some women want to be pushed hard, some want to be explained to, some want to be left to get on with things once shown.",
      },
      { type: "h2", text: "What we actually take into consideration" },
      {
        type: "p",
        text: "We look at whether the personal trainer has experience with women north of 40 years old. There’s a difference between someone who has worked with fifty women through perimenopause and someone who has read a course module on it.",
      },
      {
        type: "p",
        text: "We also consider how their working style matches how you said you want to be treated - this is weighted heavily because it determines whether you are still going with your trainer beyond a few sessions.",
      },
      {
        type: "p",
        text: "Obviously the practical details have to work too - location, times, setting, cost. Logistics can be the reason plenty of good matches fail.",
      },
      { type: "h2", text: "What we can’t know" },
      {
        type: "p",
        text: "We won’t know whether you’ll like them - we can rule out obvious mismatches but we unfortunately can’t manufacture the rapport between you.",
      },
      {
        type: "p",
        text: "We won’t know how you’ll feel in six weeks. Circumstances change and a match that suits you right now may not suit you in a few months.",
      },
      {
        type: "p",
        text: "We also won’t know whether they’re the single best professional for you - we are aiming for a great fit, which is a much better starting point than a list.",
      },
      { type: "h2", text: "How good is the evidence for good rapport?" },
      {
        type: "p",
        text: "The literature, mostly from healthcare and psychology, finds that the quality of the working relationship predicts outcomes substantially. It’s one of the more robust findings in that field, and there’s no reason it wouldn’t apply here.",
      },
      { type: "h2", text: "Where that leaves you" },
      {
        type: "p",
        text: "We review every professional individually and what we’re offering is a considered shortlist rather than a guarantee, and introductions rather than a directory to wade through.",
      },
    ],
    sources: [
      {
        note: "The quality of the working relationship predicting outcomes",
        citation:
          "Flückiger et al., The alliance in adult psychotherapy: a meta-analytic synthesis, Psychotherapy, 2018",
        url: "https://pubmed.ncbi.nlm.nih.gov/29792475/",
      },
    ],
  },
  {
    slug: "perimenopause-and-exercise",
    title: "“I’m sleeping badly and everything aches”",
    metaTitle: "Perimenopause and Exercise | Curated Fit",
    metaDescription:
      "Sleeping badly, aching, and nothing feels like it used to. What is worth understanding before you start.",
    excerpt:
      "Sleeping badly, aching, and nothing feels like it used to. What is worth understanding before you start.",
    date: "2026-08-15",
    dateLabel: "15 August 2026",
    readingTime: "4 min read",
    kind: "Curated Fit Journal",
    image: "/journal/perimenopause-and-exercise.jpg",
    imageAlt: "A woman walking up the stairs at home, one hand near the bannister.",
    body: [
      {
        type: "p",
        text: "You wake at three - not worried about anything in particular, but just awake. Your hips are stiff getting out of bed in a way they were not two years ago, and you feel hotter than the room.",
      },
      {
        type: "p",
        text: "Perimenopause and exercise is a subject with a great deal of confident advice attached to it, and to make things a bit confusing it can be contradictory. Here’s what to understand before you change anything.",
      },
      { type: "h2", text: "What’s actually happening" },
      {
        type: "p",
        text: "Perimenopause is the years of hormonal fluctuation before periods stop, and fluctuation is the operative word! Oestrogen does not decline smoothly. It swings and the swings get wilder before they end.",
      },
      {
        type: "p",
        text: "Oestrogen is involved in more than reproduction. It has roles in temperature control, bone maintenance and how muscle responds to being worked, and a less settled role in connective tissue. Sleep is often disturbed too, though the clearest path there runs through night sweats rather than oestrogen acting on sleep directly. That’s why the symptoms arrive as a set rather than one at a time and why they seem unrelated to each other when they’re not.",
      },
      {
        type: "p",
        text: "The two that matter most for what follows in this post are bone and muscle. Bone loss accelerates in this window. Muscle becomes slightly less responsive to the same amount of work, meaning the same effort produces a little less than it did at thirty-five.",
      },
      { type: "h2", text: "What movement does and what it doesn’t" },
      {
        type: "p",
        text: "Strength work is the most useful thing available to you, for two reasons. It loads bone, which is the signal bone needs to maintain itself. And it is a reliable way to hold onto muscle while your hormones seem to be working against you.",
      },
      {
        type: "p",
        text: "What it won’t do is regulate your hormones or stop the fluctuation. Anyone telling you that exercise “fixes” perimenopause is overselling.",
      },
      {
        type: "p",
        text: "What it may do is help with your sleep and how you feel day to day. The research on exercise and sleep quality is promising but not conclusive.",
      },
      { type: "h2", text: "The evidence is strong though" },
      {
        type: "p",
        text: "Resistance work for bone density and muscle maintenance through and after menopause is well supported and not too contested.",
      },
      {
        type: "p",
        text: "With sleep and mood, there is a consistent direction in the research and a lot of variation between individuals.",
      },
      {
        type: "p",
        text: "The evidence is weaker for the claims that circulate online. Particular exercises for hot flushes, specific protocols timed to your cycle, avoiding certain movements because of cortisol - it may turn out to be right but it’s not particularly established.",
      },
      {
        type: "p",
        text: "One more thing on this - sleeping badly and aching is a conversation you should definitely have with your GP. Movement is part of the answer but it’s not the whole of it.",
      },
      { type: "h2", text: "When you’ll notice changes" },
      {
        type: "p",
        text: "Strength within four to six weeks, in the sense that things feel easier before anything looks different. Measurable muscle change between eight and twelve weeks of consistent work.",
      },
      {
        type: "p",
        text: "Bone over months rather than weeks. Sleep and general wellbeing are the least predictable. Some people notice something within a fortnight, others notice nothing, and both are normal.",
      },
      { type: "h2", text: "Where that leaves you" },
      {
        type: "p",
        text: "Two sessions a week of properly loaded strength work is the highest-value thing you can do for your body in this decade.",
      },
      {
        type: "p",
        text: "It won’t fix everything you’re feeling, and it should sit alongside your doctor rather than instead of them. What it will do is protect the bone and the muscle, which are the two things you can’t get back later.",
      },
    ],
    sources: [
      {
        note: "Perimenopause as years of hormonal fluctuation, and how its stages are defined",
        citation: "Harlow et al., Stages of Reproductive Aging Workshop +10, 2012",
        url: "https://pubmed.ncbi.nlm.nih.gov/22344196/",
      },
      {
        note: "Bone loss accelerating around the final menstrual period",
        citation:
          "Bone mineral density changes during the menopause transition in a multiethnic cohort of women (SWAN), 2008",
        url: "https://pubmed.ncbi.nlm.nih.gov/18160467/",
      },
      {
        note: "Disturbed sleep, and its association with night sweats rather than with oestrogen levels directly",
        citation:
          "Vasomotor symptoms and menopause: findings from the Study of Women’s Health Across the Nation",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3185243/",
      },
      {
        note: "Muscle responding less to the same work as oestrogen falls",
        citation: "Role of exercise in estrogen deficiency-induced sarcopenia",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8934617/",
      },
      {
        note: "Strength work loading and maintaining bone",
        citation:
          "Watson et al., LIFTMOR randomised controlled trial, Journal of Bone and Mineral Research, 2018",
        url: "https://pubmed.ncbi.nlm.nih.gov/28975661/",
      },
      {
        note: "Strength work holding on to muscle after menopause",
        citation:
          "The effect of resistance training programs on lean body mass in postmenopausal and elderly women: a meta-analysis, 2021",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8595144/",
      },
      {
        note: "Sleep: a consistent direction, short of conclusive",
        citation:
          "Sleep quality in perimenopausal and postmenopausal women: which exercise therapy is most effective? Network meta-analysis of 31 trials, Climacteric, 2025",
        url: "https://doi.org/10.1080/13697137.2025.2509866",
      },
      {
        note: "Why we do not claim exercise treats hot flushes",
        citation: "Daley et al., Exercise for vasomotor menopausal symptoms, Cochrane Review, 2014",
        url: "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD006108.pub4/references",
      },
      {
        note: "Why we do not recommend protocols timed to your cycle",
        citation:
          "McNulty et al., The effects of menstrual cycle phase on exercise performance, Sports Medicine, 2020",
        url: "https://pubmed.ncbi.nlm.nih.gov/32661839/",
      },
      {
        note: "Early gains being largely neural, before muscle change is measurable",
        citation: "Moritani and deVries, Neural factors versus hypertrophy, 1979",
        url: "https://pubmed.ncbi.nlm.nih.gov/453338/",
      },
    ],
  },
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
    image: "/journal/out-of-place-in-a-gym.jpg",
    imageAlt: "A woman sitting on a bench in a quiet gym, looking out of the window.",
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
