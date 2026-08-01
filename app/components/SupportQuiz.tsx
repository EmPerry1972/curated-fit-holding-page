"use client";

import { useMemo, useState } from "react";

type Trainer = {
  id: string;
  name: string;
  initials: string;
  photo?: string;
  speciality: string;
  suburb: string;
  formats: string;
  baseFit: number;
  tags: {
    focus: string[];
    experience: string[];
    setting: string[];
    style: string[];
  };
  why: string;
};

const TRAINERS: Trainer[] = [
  {
    id: "jessica",
    name: "Jessica Wacey",
    initials: "JW",
    photo: "/jessica.jpg",
    speciality: "Strength, muscle and menopause support",
    suburb: "Massey, Auckland",
    formats: "In-person and online",
    baseFit: 96,
    tags: {
      focus: ["strength", "weight"],
      experience: ["menopause"],
      setting: ["gym", "online", "home"],
      style: ["clear"],
    },
    why: "Strong on building strength and supporting you through menopause.",
  },
  {
    id: "aroha",
    name: "Aroha Ngata",
    initials: "AN",
    speciality: "Confidence, stability and returning to movement",
    suburb: "Mount Eden, Auckland",
    formats: "In-person and outdoors",
    baseFit: 93,
    tags: {
      focus: ["stability", "comfort", "routine"],
      experience: ["bone", "injury"],
      setting: ["outdoors", "home", "studio"],
      style: ["calm"],
    },
    why: "Gentle, reassuring support to rebuild confidence and stability.",
  },
  {
    id: "daniel",
    name: "Daniel Reeve",
    initials: "DR",
    speciality: "Energy, stamina and weight support",
    suburb: "Ponsonby, Auckland",
    formats: "In-person and online",
    baseFit: 91,
    tags: {
      focus: ["energy", "weight"],
      experience: [],
      setting: ["gym", "online"],
      style: ["direct"],
    },
    why: "Focused on lifting your energy, stamina and everyday capacity.",
  },
];

function overlap(a: string[], b: string[]) {
  if (!a || !b) return 0;
  return a.filter((x) => b.includes(x)).length;
}

function rankTrainers(answers: Record<string, string[]>) {
  const focus = answers["support"] || [];
  const setting = answers["setting"] || [];
  const experience = answers["experience"] || [];
  const style = answers["style"] || [];
  const hasAnswers = focus.length + setting.length + experience.length + style.length > 0;

  const scored = TRAINERS.map((t) => {
    const score =
      overlap(focus, t.tags.focus) * 3 +
      overlap(setting, t.tags.setting) * 2 +
      overlap(experience, t.tags.experience) * 2 +
      overlap(style, t.tags.style) * 1;
    const maxScore = focus.length * 3 + setting.length * 2 + experience.length * 2 + style.length * 1;
    const fit = hasAnswers && maxScore > 0
      ? Math.min(98, Math.max(78, Math.round(78 + (score / maxScore) * 20)))
      : t.baseFit;
    return { ...t, fit, score };
  });

  scored.sort((a, b) => b.fit - a.fit || b.score - a.score);
  return scored.slice(0, 3);
}

function Avatar({ trainer }: { trainer: Trainer }) {
  const [failed, setFailed] = useState(false);
  const box: React.CSSProperties = {
    width: 84,
    height: 84,
    borderRadius: "50%",
    flexShrink: 0,
    overflow: "hidden",
    background: "var(--stone)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  if (trainer.photo && !failed) {
    return (
      <div style={box}>
        <img
          src={trainer.photo}
          alt={trainer.name}
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", filter: "grayscale(1)" }}
        />
      </div>
    );
  }
  return (
    <div style={box}>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--text-primary)" }}>
        {trainer.initials}
      </span>
    </div>
  );
}

function ResultsView({ answers }: { answers: Record<string, string[]> }) {
  const matches = useMemo(() => rankTrainers(answers), [answers]);
  const wrap: React.CSSProperties = {
    maxWidth: 720,
    margin: "0 auto",
    padding: "clamp(56px, 9vw, 96px) 24px",
  };
  return (
    <section style={wrap}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--text-label)",
          marginBottom: 16,
        }}
      >
        Your matches
      </p>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          letterSpacing: "-0.01em",
          fontSize: "clamp(28px, 4.4vw, 40px)",
          lineHeight: 1.1,
          color: "var(--text-primary)",
          margin: 0,
        }}
      >
        Three coaches, chosen for you.
      </h2>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 16,
          lineHeight: 1.5,
          color: "var(--text-secondary)",
          marginTop: 12,
          marginBottom: 40,
        }}
      >
        Ranked on how you want to move, feel and be supported.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {matches.map((t) => (
          <div
            key={t.id}
            style={{
              display: "flex",
              gap: 20,
              alignItems: "center",
              padding: 20,
              border: "1px solid var(--line)",
              background: "var(--field)",
            }}
          >
            <Avatar trainer={t} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--text-primary)" }}>
                  {t.name}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-label)", whiteSpace: "nowrap" }}>
                  {t.fit}% fit
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text-secondary)", margin: "4px 0 0" }}>
                {t.speciality} · {t.suburb}
              </p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text-primary)", margin: "10px 0 0", lineHeight: 1.5 }}>
                {t.why}
              </p>
              <a
                href="/early-access"
                style={{
                  display: "inline-block",
                  marginTop: 14,
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: "var(--text-primary)",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                Register your interest →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

type Option = { id: string; title: string; desc?: string; exclusive?: boolean };
type Mode = "single" | "multi" | "all";
type Question = {
  id: string;
  eyebrow: string;
  question: string;
  helper: string;
  mode: Mode;
  maxSelect?: number;
  options: Option[];
};

const QUESTIONS: Question[] = [
  {
    id: "support",
    eyebrow: "A considered question",
    question: "What would you most like support with right now?",
    helper: "Choose up to two.",
    mode: "multi",
    maxSelect: 2,
    options: [
      { id: "strength", title: "Build strength and maintain muscle", desc: "I want to feel stronger and maintain the muscle I have." },
      { id: "energy", title: "Improve my energy and stamina", desc: "I want everyday activity to feel easier and have more energy for the things I enjoy." },
      { id: "weight", title: "Support a change in my weight", desc: "I want exercise that supports weight loss, weight maintenance or maintaining muscle as my weight changes." },
      { id: "stability", title: "Move with greater confidence and stability", desc: "I want to improve my balance, support my bone health and feel more capable in everyday activity." },
      { id: "comfort", title: "Exercise more comfortably or return after time away", desc: "I want support that takes account of pain, injury, illness, surgery or time away from exercise." },
      { id: "routine", title: "Build confidence and find a routine that works for me", desc: "I want guidance, accountability and support to exercise more consistently." },
      { id: "unsure", title: "I\u2019m not sure yet", desc: "I know I would like support, but I am not completely sure where to begin.", exclusive: true },
    ],
  },
  {
    id: "current",
    eyebrow: "A considered question",
    question: "Which best describes exercise in your life at the moment?",
    helper: "Choose one.",
    mode: "single",
    options: [
      { id: "regular", title: "I exercise regularly and would like more focused support." },
      { id: "sometimes", title: "I exercise sometimes and would like greater consistency." },
      { id: "everyday", title: "Most of my activity comes from walking, golf, gardening or everyday life." },
      { id: "returning", title: "I am returning after some time away." },
      { id: "new", title: "Regular exercise would be new for me." },
      { id: "unsure2", title: "I\u2019m not sure how to describe where I am at the moment." },
    ],
  },
  {
    id: "experience",
    eyebrow: "A considered question",
    question: "Is there anything you would like your professional to have particular experience with?",
    helper: "Choose all that apply.",
    mode: "all",
    options: [
      { id: "menopause", title: "Perimenopause or menopause" },
      { id: "injury", title: "Injury, ongoing pain or returning after surgery" },
      { id: "bone", title: "Bone health, balance or stability" },
      { id: "condition", title: "A health condition that affects how I exercise" },
      { id: "pelvic", title: "Pelvic health considerations" },
      { id: "weightmed", title: "Weight change or weight-loss medication" },
      { id: "none", title: "None of these", exclusive: true },
      { id: "later", title: "I would prefer to discuss this later", exclusive: true },
    ],
  },
  {
    id: "setting",
    eyebrow: "A considered question",
    question: "Where would you feel most comfortable exercising?",
    helper: "Choose up to two.",
    mode: "multi",
    maxSelect: 2,
    options: [
      { id: "home", title: "At home" },
      { id: "studio", title: "In a private studio" },
      { id: "gym", title: "In a gym" },
      { id: "outdoors", title: "Outdoors" },
      { id: "online", title: "Online" },
      { id: "open", title: "I am open to different settings" },
    ],
  },
  {
    id: "style",
    eyebrow: "A considered question",
    question: "What kind of support helps you respond well?",
    helper: "Choose up to two.",
    mode: "multi",
    maxSelect: 2,
    options: [
      { id: "calm", title: "Calm and reassuring", desc: "I value patience and support that helps me build confidence." },
      { id: "clear", title: "Clear and structured", desc: "I want a considered plan and a clear sense of progress." },
      { id: "direct", title: "Direct and accountable", desc: "I respond well to honest challenge and regular follow-through." },
      { id: "detailed", title: "Detailed and explanatory", desc: "I like understanding what I am doing and why." },
      { id: "flexible", title: "Flexible and responsive", desc: "I want support that adapts as my needs and confidence change." },
      { id: "warm", title: "Warm and conversational", desc: "Feeling comfortable with the person I work with matters to me." },
      { id: "unsure5", title: "I\u2019m not sure yet", desc: "I would prefer to keep an open mind.", exclusive: true },
    ],
  },
  {
    id: "preference",
    eyebrow: "A final considered question",
    question: "Do you have a preference for who you work with?",
    helper: "Choose one.",
    mode: "single",
    options: [
      { id: "woman", title: "I would prefer to work with a woman." },
      { id: "man", title: "I would prefer to work with a man." },
      { id: "nopref", title: "I do not have a preference." },
    ],
  },
];

// A compact seed list for the predictive location field. Not exhaustive — replace with a
// geocoding autocomplete API in a later phase. Typing filters these; free text is also allowed.
const LOCATIONS: string[] = [
  "Auckland CBD 1010", "Ponsonby 1011", "Grey Lynn 1021", "Mount Eden 1024",
  "Epsom 1023", "Remuera 1050", "Newmarket 1023", "Parnell 1052", "Mission Bay 1071",
  "St Heliers 1071", "Takapuna 0622", "Devonport 0624", "Milford 0620", "Albany 0632",
  "Henderson 0612", "New Lynn 0600", "Mount Albert 1025", "Point Chevalier 1022",
  "Manukau 2104", "Botany Downs 2010", "Howick 2014", "Papakura 2110", "Pukekohe 2120",
  "Wellington Central 6011", "Te Aro 6011", "Thorndon 6011", "Kelburn 6012", "Newtown 6021",
  "Miramar 6022", "Karori 6012", "Lower Hutt 5010", "Porirua 5022", "Petone 5012",
  "Christchurch Central 8011", "Riccarton 8011", "Merivale 8014", "Fendalton 8052",
  "Papanui 8053", "Sumner 8081", "Addington 8024", "Ilam 8041",
  "Hamilton Central 3204", "Chartwell 3210", "Rototuna 3210", "Tauranga 3110", "Mount Maunganui 3116",
  "Rotorua 3010", "Napier 4110", "Hastings 4122", "Palmerston North 4410", "New Plymouth 4310",
  "Whangarei 0110", "Dunedin Central 9016", "Queenstown 9300", "Nelson 7010", "Invercargill 9810",
];

export default function SupportQuiz() {
  const [showMatches, setShowMatches] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [location, setLocation] = useState("");
  const [locationFocused, setLocationFocused] = useState(false);

  const total = QUESTIONS.length;
  const q = QUESTIONS[step];
  const selected = answers[q.id] || [];

  function setSelected(next: string[]) {
    setAnswers((prev) => ({ ...prev, [q.id]: next }));
  }

  function toggle(opt: Option) {
    const isSelected = selected.includes(opt.id);
    if (q.mode === "single") {
      setSelected(isSelected ? [] : [opt.id]);
      return;
    }
    // multi and all modes
    if (opt.exclusive) {
      setSelected(isSelected ? [] : [opt.id]);
      return;
    }
    // selecting a normal option clears any exclusive selection
    const exclusiveIds = q.options.filter((o) => o.exclusive).map((o) => o.id);
    let base = selected.filter((s) => !exclusiveIds.includes(s));
    if (base.includes(opt.id)) {
      base = base.filter((s) => s !== opt.id);
    } else {
      if (q.mode === "multi" && q.maxSelect && base.length >= q.maxSelect) {
        return;
      }
      base = [...base, opt.id];
    }
    setSelected(base);
  }

  function isDisabled(opt: Option): boolean {
    if (opt.exclusive || selected.includes(opt.id)) return false;
    const exclusiveSelected = q.options.some((o) => o.exclusive && selected.includes(o.id));
    if (exclusiveSelected) return true;
    if (q.mode === "multi" && q.maxSelect && selected.length >= q.maxSelect) return true;
    return false;
  }

  const isSetting = q.id === "setting";
  const onlineSelected = isSetting && selected.includes("online");
  const locationRequired = isSetting && !onlineSelected;

  const canContinue = (() => {
    if (selected.length === 0) return false;
    if (isSetting && locationRequired && location.trim() === "") return false;
    return true;
  })();

  const locationSuggestions = useMemo(() => {
    const term = location.trim().toLowerCase();
    if (term.length < 2) return [];
    return LOCATIONS.filter((l) => l.toLowerCase().includes(term)).slice(0, 6);
  }, [location]);

  function goNext() {
    if (step < total - 1) setStep(step + 1);
  }
  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  const wrap: React.CSSProperties = {
    maxWidth: 760,
    margin: "0 auto",
    padding: "clamp(56px, 9vw, 96px) 24px",
  };
  const eyebrow: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--text-label)",
    marginBottom: 16,
  };
  const heading: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 400,
    letterSpacing: "-0.01em",
    fontSize: "clamp(28px, 4.4vw, 40px)",
    lineHeight: 1.15,
    color: "var(--text-primary)",
    textTransform: "none",
  };
  const helper: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    lineHeight: 1.6,
    color: "var(--text-secondary)",
    marginTop: 12,
    textTransform: "none",
    letterSpacing: "normal",
  };
  const progress: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--text-label)",
    marginBottom: 24,
  };

  function optionStyle(isSelected: boolean, disabled: boolean): React.CSSProperties {
    return {
      display: "block",
      width: "100%",
      textAlign: "left",
      background: isSelected ? "var(--stone)" : "var(--field)",
      border: isSelected ? "1px solid var(--charcoal)" : "1px solid var(--line)",
      borderRadius: 14,
      padding: "18px 20px",
      marginTop: 14,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "border-color 0.15s ease, background 0.15s ease",
    };
  }
  const optTitle: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontSize: 19,
    fontWeight: 600,
    color: "var(--text-primary)",
    margin: 0,
    textTransform: "none",
    letterSpacing: "normal",
  };
  const optDesc: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    fontWeight: 400,
    lineHeight: 1.55,
    color: "var(--text-secondary)",
    margin: "6px 0 0",
    textTransform: "none",
    letterSpacing: "normal",
  };
  const label: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontSize: 19,
    fontWeight: 600,
    color: "var(--text-primary)",
    margin: "0 0 6px",
    textTransform: "none",
    letterSpacing: "normal",
  };
  const input: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    background: "var(--field)",
    border: "1px solid var(--line)",
    borderRadius: 14,
    padding: "16px 18px",
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    color: "var(--text-primary)",
    textTransform: "none",
    letterSpacing: "normal",
    outline: "none",
  };
  const ctaBtn: React.CSSProperties = {
    display: "inline-block",
    background: "var(--charcoal)",
    color: "var(--warm-white)",
    border: "none",
    borderRadius: 999,
    padding: "14px 30px",
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    textTransform: "none",
    letterSpacing: "normal",
  };
  const backBtn: React.CSSProperties = {
    display: "inline-block",
    background: "transparent",
    color: "var(--text-secondary)",
    border: "none",
    padding: "14px 8px",
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    cursor: "pointer",
    textTransform: "none",
    letterSpacing: "normal",
  };

  if (showMatches) {
    return <ResultsView answers={answers} />;
  }

  return (
    <section style={wrap} aria-labelledby="support-quiz-heading">
      <p style={progress}>
        Question {step + 1} of {total}
      </p>
      <p style={eyebrow}>{q.eyebrow}</p>
      <h2 id="support-quiz-heading" style={heading}>
        {q.question}
      </h2>
      <p style={helper}>{q.helper}</p>

      <div role="group" aria-labelledby="support-quiz-heading" style={{ marginTop: 28 }}>
        {q.options.map((opt, i) => {
          const isSelected = selected.includes(opt.id);
          const disabled = isDisabled(opt);
          const prevExclusive = i > 0 && opt.exclusive && !q.options[i - 1].exclusive;
          return (
            <div key={opt.id}>
              {prevExclusive && (
                <div
                  style={{
                    height: 1,
                    background: "var(--line)",
                    border: "none",
                    margin: "26px 0 8px",
                  }}
                />
              )}
              <button
                type="button"
                aria-pressed={isSelected}
                disabled={disabled}
                onClick={() => toggle(opt)}
                style={optionStyle(isSelected, disabled)}
              >
                <p style={optTitle}>{opt.title}</p>
                {opt.desc && <p style={optDesc}>{opt.desc}</p>}
              </button>
            </div>
          );
        })}
      </div>

      {isSetting && (
        <div style={{ marginTop: 36 }}>
          <p style={label}>Where would you usually like to exercise?</p>
          <p style={{ ...helper, marginTop: 0, marginBottom: 12 }}>
            Enter a suburb or postcode.{onlineSelected ? " Optional when exercising online." : ""}
          </p>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setLocationFocused(true)}
              onBlur={() => setTimeout(() => setLocationFocused(false), 120)}
              placeholder="Start typing a suburb or postcode"
              aria-label="Suburb or postcode"
              autoComplete="off"
              style={input}
            />
            {locationFocused && locationSuggestions.length > 0 && (
              <ul
                style={{
                  listStyle: "none",
                  margin: "6px 0 0",
                  padding: 6,
                  position: "absolute",
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  background: "var(--warm-white)",
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                }}
              >
                {locationSuggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onMouseDown={() => setLocation(s)}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        background: "transparent",
                        border: "none",
                        borderRadius: 10,
                        padding: "10px 12px",
                        fontFamily: "var(--font-sans)",
                        fontSize: 15,
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        textTransform: "none",
                        letterSpacing: "normal",
                      }}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginTop: 40,
        }}
      >
        {step > 0 ? (
          <button type="button" onClick={goBack} style={backBtn}>
            Back
          </button>
        ) : (
          <span />
        )}
        {step < total - 1 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!canContinue}
            style={{ ...ctaBtn, opacity: canContinue ? 1 : 0.4, cursor: canContinue ? "pointer" : "not-allowed" }}
          >
            Continue
          </button>
        ) : (
          <button type="button" onClick={() => setShowMatches(true)} style={{ ...ctaBtn }}>
            See your matches
          </button>
        )}
      </div>
    </section>
  );
}

