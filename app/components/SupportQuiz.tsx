"use client";

import { useEffect, useMemo, useState } from "react";

type Match = {
  id: string;
  name: string;
  initials: string;
  photo?: string | null;
  suburb?: string;
  reason?: string;
  scoreBand?: string;
  rank?: number;
};

function Avatar({ photo, name, initials }: { photo?: string | null; name: string; initials: string }) {
  const [failed, setFailed] = useState(false);
  const size = 64;
  const base: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    flex: "0 0 auto",
    objectFit: "cover",
    background: "var(--field)",
    border: "1px solid var(--line)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-display)",
    fontSize: 20,
    color: "var(--text-secondary)",
    overflow: "hidden",
  };
  if (photo && !failed) {
    return <img src={photo} alt={name} style={base} onError={() => setFailed(true)} />;
  }
  return <div style={base}>{initials}</div>;
}

function ResultsView({ submission }: { submission: Record<string, unknown> }) {
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [matches, setMatches] = useState<Match[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [sent, setSent] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/find-your-fit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submission),
        });
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        const list: Match[] = Array.isArray(data?.matches) ? data.matches : [];
        if (res.ok && list.length > 0) {
          setMatches(list);
          setStatus("ready");
        } else if (res.ok) {
          setStatus("empty");
        } else {
          setStatus("error");
        }
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [submission]);

  async function connect(match: Match) {
    if (!contact.name.trim() || !contact.email.trim()) return;
    try {
      await fetch("/api/find-your-fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...submission,
          intent: "connect",
          clientName: contact.name.trim(),
          email: contact.email.trim(),
          phoneNumber: contact.phone.trim(),
          professionalId: match.id,
        }),
      });
    } catch {
      // best effort; we still confirm to the visitor
    }
    setSent((prev) => ({ ...prev, [match.id]: true }));
    setOpenId(null);
    setContact({ name: "", email: "", phone: "" });
  }

  const outer: React.CSSProperties = { maxWidth: 640, margin: "0 auto", padding: "0 24px" };
  const eyebrow: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--text-secondary)",
    marginBottom: 12,
  };
  const heading: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 400,
    letterSpacing: "-0.01em",
    fontSize: 34,
    lineHeight: 1.1,
    color: "var(--text-primary)",
    margin: 0,
  };
  const sub: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    lineHeight: 1.6,
    color: "var(--text-secondary)",
    marginTop: 12,
    marginBottom: 28,
  };
  const note: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    color: "var(--text-secondary)",
    lineHeight: 1.6,
  };
  const field: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    background: "var(--field)",
    border: "1px solid var(--line)",
    borderRadius: 8,
    padding: "10px 12px",
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    color: "var(--text-primary)",
    marginTop: 8,
    outline: "none",
  };
  const primaryBtn: React.CSSProperties = {
    display: "inline-block",
    background: "var(--charcoal)",
    color: "var(--warm-white)",
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    cursor: "pointer",
    marginTop: 12,
  };

  return (
    <section style={outer}>
      <p style={eyebrow}>Your matches</p>
      <h2 style={heading}>Three coaches, chosen for you.</h2>
      <p style={sub}>Ranked on how you want to move, feel and be supported.</p>

      {status === "loading" && <p style={note}>Finding your matches…</p>}

      {status === "empty" && (
        <p style={note}>
          Thank you. We do not have a confirmed match to show you just yet, but we have noted what
          you are looking for and will be in touch soon.
        </p>
      )}

      {status === "error" && (
        <p style={note}>Something went wrong finding your matches. Please try again shortly.</p>
      )}

      {status === "ready" &&
        matches.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
              padding: "20px 0",
              borderTop: "1px solid var(--line)",
            }}
          >
            <Avatar photo={m.photo} name={m.name} initials={m.initials} />
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--text-primary)", margin: 0 }}>
                {m.name}
              </p>
              {m.suburb && (
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text-secondary)", margin: "4px 0 0" }}>
                  {m.suburb}
                </p>
              )}
              {m.reason && (
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)", margin: "8px 0 0" }}>
                  {m.reason}
                </p>
              )}

              {sent[m.id] ? (
                <p style={{ ...note, marginTop: 12 }}>
                  Thank you. We've connected you with {m.name} by email — you'll both hear from each other shortly.
                </p>
              ) : openId === m.id ? (
                <div style={{ marginTop: 12 }}>
                  <input
                    style={field}
                    placeholder="Your name"
                    value={contact.name}
                    onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  />
                  <input
                    style={field}
                    placeholder="Your email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  />
                  <input
                    style={field}
                    placeholder="Your phone (optional)"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  />
                  <button type="button" style={primaryBtn} onClick={() => connect(m)}>
                    Send my details
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  style={primaryBtn}
                  onClick={() => {
                    setOpenId(m.id);
                    setSent({});
                  }}
                >
                  Connect with {m.name}
                </button>
              )}
            </div>
          </div>
        ))}
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
  allowOther?: boolean;
  allowNote?: boolean;
  options: Option[];
};

const QUESTIONS: Question[] = [
  {
    id: "support",
    eyebrow: "A considered question",
    question: "What would you most like support with right now?",
    helper: "Choose up to two. There are no wrong answers.",
    mode: "multi",
    maxSelect: 2,
    allowOther: true,
    options: [
      { id: "OUT-01", title: "Build strength and maintain muscle", desc: "I want to feel stronger and maintain the muscle I have." },
      { id: "OUT-02", title: "Improve my energy and stamina", desc: "I want everyday activity to feel easier and to have more energy for the things I enjoy." },
      { id: "OUT-05", title: "Move with greater confidence and stability", desc: "I want to improve my balance, support my bone health and feel more capable day to day." },
      { id: "OUT-06", title: "Return to exercise after time away", desc: "I want support that takes account of time away, pain, injury, illness or surgery." },
      { id: "OUT-04", title: "Build confidence with exercise", desc: "I want to feel more confident and at ease when I exercise." },
      { id: "OUT-03", title: "Find a routine that works for me", desc: "I want guidance, accountability and support to exercise more consistently." },
    ],
  },
  {
    id: "current",
    eyebrow: "A considered question",
    question: "Which best describes exercise in your life at the moment?",
    helper: "Choose the one that fits best.",
    mode: "single",
    options: [
      { id: "STG-01", title: "I exercise regularly and would like more focused support." },
      { id: "STG-02", title: "I exercise sometimes and would like greater consistency." },
      { id: "STG-03", title: "Most of my activity comes from walking, golf, gardening or everyday life." },
      { id: "STG-04", title: "I am returning after some time away." },
      { id: "STG-05", title: "Regular exercise would be new for me." },
    ],
  },
  {
    id: "experience",
    eyebrow: "A considered question",
    question: "How would you like your coach to support you?",
    helper: "Choose any that apply, or add a note of your own. This is optional.",
    mode: "all",
    allowNote: true,
    options: [
      { id: "CON-01", title: "Support through perimenopause or menopause" },
      { id: "CON-03", title: "Building balance, stability and confidence" },
      { id: "CON-02", title: "Easing back in gently after time away" },
      { id: "CON-04", title: "Pacing that adapts to how I feel day to day" },
      { id: "CON-06", title: "Support through body changes" },
      { id: "CON-05", title: "A medical condition, injury or medication my coach should know about" },
      { id: "none", title: "None of these", exclusive: true },
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
      { id: "SET-01", title: "At home" },
      { id: "SET-02", title: "In a private studio" },
      { id: "SET-03", title: "In a shared studio" },
      { id: "SET-04", title: "In a gym" },
      { id: "SET-05", title: "Outdoors" },
      { id: "SET-06", title: "Online" },
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
      { id: "STY-01", title: "Calm and reassuring", desc: "I value patience and support that helps me build confidence." },
      { id: "STY-02", title: "Clear and structured", desc: "I want a considered plan and a clear sense of progress." },
      { id: "STY-03", title: "Encouraging and motivating", desc: "I respond well to regular encouragement and follow-through." },
      { id: "STY-04", title: "Direct and accountable", desc: "I respond well to honest challenge and progress-focused support." },
      { id: "STY-05", title: "Detailed and explanatory", desc: "I like understanding what I am doing and why." },
      { id: "STY-06", title: "Flexible and responsive", desc: "I want support that adapts as my needs and confidence change." },
    ],
  },
  {
    id: "preference",
    eyebrow: "A final considered question",
    question: "Do you have a preference for who you work with?",
    helper: "Choose the one that fits best.",
    mode: "single",
    options: [
      { id: "Woman", title: "I would prefer to work with a woman." },
      { id: "Man", title: "I would prefer to work with a man." },
      { id: "No preference", title: "I do not have a preference." },
    ],
  },
];


export default function SupportQuiz() {
  const [showMatches, setShowMatches] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [location, setLocation] = useState("");
  const [locationFocused, setLocationFocused] = useState(false);
  const [postcode, setPostcode] = useState("");
  const [areas, setAreas] = useState<{ id: string; label: string }[]>([]);
  const [suburbId, setSuburbId] = useState("");
  const [otherText, setOtherText] = useState("");
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/find-your-fit")
      .then((r) => r.json())
      .then((d) => {
        if (active && Array.isArray(d?.serviceAreas)) {
          setAreas(d.serviceAreas.map((a: { id: string; label: string }) => ({ id: a.id, label: a.label })));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

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
  const onlineSelected = isSetting && selected.includes("SET-06");
  const locationRequired = isSetting && !onlineSelected;

  const canContinue = (() => {
    if (selected.length === 0) return false;
    if (isSetting && locationRequired && !suburbId) return false;
    return true;
  })();

    const locationSuggestions = useMemo(() => {
    const term = location.trim().toLowerCase();
    if (term.length < 2) return [];
    return areas.filter((a) => a.label.toLowerCase().includes(term)).slice(0, 8);
  }, [location, areas]);

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
    fontWeight: 700,
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
        return (
      <ResultsView
        submission={{
          selectedOutcomes: answers.support || [],
          selectedConsiderations: (answers.experience || []).filter((id) => id.startsWith("CON-")),
          exerciseStage: (answers.current || [])[0],
          preferredSettings: answers.setting || [],
          preferredSupportStyles: answers.style || [],
          genderPreference: (answers.preference || [])[0],
          suburb: onlineSelected ? "AREA-ONLINE" : suburbId,
          postcode: onlineSelected ? "0000" : postcode.trim() || "0000",
          otherText: otherText.trim(),
          noteText: noteText.trim(),
        }}
      />
    );
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
                <p style={optTitle}><strong style={{ fontWeight: 700, fontFamily: "inherit" }}>{opt.title}</strong></p>
                {opt.desc && <p style={optDesc}>{opt.desc}</p>}
              </button>
            </div>
          );
        })}
      </div>
        {q.allowOther && (
          <input
            type="text"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="Something else? Tell us in your own words (optional)"
            aria-label="Anything else you would like support with"
            autoComplete="off"
            style={{ ...input, marginTop: 12 }}
          />
        )}
        {q.allowNote && (
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Fill in your answer (optional)"
            aria-label="Anything you would like your professional to keep in mind"
            autoComplete="off"
            style={{ ...input, marginTop: 12 }}
          />
        )}

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
              onChange={(e) => { setLocation(e.target.value); setSuburbId(""); }}
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
                  <li key={s.id}>
                    <button
                      type="button"
                      onMouseDown={() => { setLocation(s.label); setSuburbId(s.id); }}
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
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {!onlineSelected && (
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="Postcode"
              aria-label="Postcode"
              autoComplete="off"
              style={{ ...input, marginTop: 8 }}
            />
          )}
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

