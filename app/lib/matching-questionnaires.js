const option = (value, label, extra = {}) => ({ value, label, ...extra });

export const CLIENT_QUESTIONS = [
  {
    id: "outcomes",
    title: "What would you most like support with right now?",
    helper: "Choose up to two.",
    max: 2,
    options: [
      option("strength", "Build strength and maintain muscle"),
      option("energy", "Improve my energy and stamina"),
      option("weight", "Support a change in my weight"),
      option("stability", "Move with greater confidence and stability"),
      option("comfort", "Exercise more comfortably or return after time away"),
      option("routine", "Build confidence and find a routine that works for me"),
      option("unsure", "I’m not sure yet", { exclusive: true }),
    ],
  },
  {
    id: "exerciseSituation",
    title: "Which best describes exercise in your life at the moment?",
    helper: "Choose one.",
    max: 1,
    options: [
      option("regular", "I exercise regularly and would like more focused support."),
      option("sometimes", "I exercise sometimes and would like greater consistency."),
      option("everyday", "Most of my activity comes from walking, golf, gardening or everyday life."),
      option("returning", "I am returning after some time away."),
      option("new", "Regular exercise would be new for me."),
      option("unsure", "I’m not sure how to describe where I am at the moment."),
    ],
  },
  {
    id: "experienceNeeded",
    title: "Is there anything you would like your professional to have particular experience with?",
    helper: "Choose all that apply.",
    options: [
      option("menopause", "Perimenopause or menopause"),
      option("injury", "Injury, ongoing pain or returning after surgery"),
      option("bone", "Bone health, balance or stability"),
      option("condition", "A health condition that affects how I exercise"),
      option("pelvic", "Pelvic health considerations"),
      option("weightMedication", "Weight change or weight-loss medication"),
      option("none", "None of these", { exclusive: true }),
      option("later", "I would prefer to discuss this later", { exclusive: true }),
    ],
  },
  {
    id: "settings",
    title: "Where would you feel most comfortable exercising?",
    helper: "Choose up to two, then add the suburb or postcode that suits you.",
    max: 2,
    options: [
      option("home", "At home"),
      option("studio", "In a private studio"),
      option("gym", "In a gym"),
      option("outdoors", "Outdoors"),
      option("online", "Online"),
      option("open", "I am open to different settings"),
    ],
  },
  {
    id: "supportStyle",
    title: "What kind of support helps you respond well?",
    helper: "Choose up to two.",
    max: 2,
    options: [
      option("calm", "Calm and reassuring"),
      option("clear", "Clear and structured"),
      option("direct", "Direct and accountable"),
      option("detailed", "Detailed and explanatory"),
      option("flexible", "Flexible and responsive"),
      option("warm", "Warm and conversational"),
      option("unsure", "I’m not sure yet", { exclusive: true }),
    ],
  },
  {
    id: "genderPreference",
    title: "Do you have a preference for who you work with?",
    helper: "Choose one.",
    max: 1,
    options: [
      option("woman", "I would prefer to work with a woman."),
      option("man", "I would prefer to work with a man."),
      option("noPreference", "I do not have a preference."),
    ],
  },
];

export const PROFESSIONAL_QUESTIONS = [
  {
    id: "outcomesSupported",
    title: "What would you feel best placed to help a client with?",
    helper: "Choose all that genuinely reflect your work.",
    options: CLIENT_QUESTIONS[0].options.filter(({ value }) => value !== "unsure"),
  },
  {
    id: "exerciseSituationsSupported",
    title: "Which starting points are you well placed to support?",
    helper: "Choose all that apply.",
    options: CLIENT_QUESTIONS[1].options.filter(({ value }) => value !== "unsure"),
  },
  {
    id: "experienceAreas",
    title: "Which areas do you have relevant experience supporting?",
    helper: "Choose all that apply. Only select areas you can support safely and confidently.",
    options: CLIENT_QUESTIONS[2].options.filter(({ value }) => !["later"].includes(value)),
  },
  {
    id: "serviceSettings",
    title: "Where can you work with clients?",
    helper: "Choose all that apply, then add your service area.",
    options: CLIENT_QUESTIONS[3].options.filter(({ value }) => value !== "open"),
  },
  {
    id: "coachingStyles",
    title: "How would you describe the support you provide?",
    helper: "Choose up to three that best describe your usual approach.",
    max: 3,
    options: CLIENT_QUESTIONS[4].options.filter(({ value }) => value !== "unsure"),
  },
  {
    id: "gender",
    title: "How should we record your gender for clients who express a preference?",
    helper: "Choose one.",
    max: 1,
    options: [
      option("woman", "Woman"),
      option("man", "Man"),
      option("another", "Another gender"),
      option("notRecorded", "Prefer not to record"),
    ],
  },
  {
    id: "availability",
    title: "Are you currently available for Curated Fit introductions?",
    helper: "Choose one. You can update this later.",
    max: 1,
    options: [
      option("accepting", "Yes, I am accepting new clients"),
      option("limited", "Yes, with limited availability"),
      option("waitlist", "Waitlist only"),
      option("unavailable", "Not at the moment"),
    ],
  },
];

export function labelsForAnswers(questions, answers) {
  return Object.fromEntries(
    questions.map((question) => {
      const selected = Array.isArray(answers?.[question.id]) ? answers[question.id] : [];
      const labels = selected.map((value) => question.options.find((item) => item.value === value)?.label).filter(Boolean);
      return [question.id, labels];
    }),
  );
}

export function validateAnswers(questions, answers) {
  const errors = {};
  for (const question of questions) {
    const selected = Array.isArray(answers?.[question.id]) ? answers[question.id] : [];
    const allowed = new Set(question.options.map(({ value }) => value));
    const exclusive = question.options.filter(({ exclusive }) => exclusive).map(({ value }) => value);
    if (selected.length === 0) errors[question.id] = "Please choose an answer.";
    else if (selected.some((value) => !allowed.has(value))) errors[question.id] = "One or more answers are not valid.";
    else if (new Set(selected).size !== selected.length) errors[question.id] = "Duplicate answers are not allowed.";
    else if (question.max && selected.length > question.max) errors[question.id] = `Choose no more than ${question.max}.`;
    else if (selected.some((value) => exclusive.includes(value)) && selected.length > 1) errors[question.id] = "This answer cannot be combined with another choice.";
  }
  return errors;
}

export function isValidToken(token) {
  return typeof token === "string" && /^[A-Za-z0-9_-]{16,128}$/.test(token);
}
