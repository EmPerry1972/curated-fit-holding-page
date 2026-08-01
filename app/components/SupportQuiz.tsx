"use client";

import { useState } from "react";

const MAIN_OPTIONS = [
  {
    id: "strength",
    title: "Build strength and maintain muscle",
    desc: "I want to feel stronger and maintain the muscle I have.",
  },
  {
    id: "energy",
    title: "Improve my energy and stamina",
    desc: "I want everyday activity to feel easier and have more energy for the things I enjoy.",
  },
  {
    id: "weight",
    title: "Support a change in my weight",
    desc: "I want exercise that supports weight loss, weight maintenance or maintaining muscle as my weight changes.",
  },
  {
    id: "stability",
    title: "Move with greater confidence and stability",
    desc: "I want to improve my balance, support my bone health and feel more capable in everyday activity.",
  },
  {
    id: "comfort",
    title: "Exercise more comfortably or return after time away",
    desc: "I want support that takes account of pain, injury, illness, surgery or time away from exercise.",
  },
  {
    id: "routine",
    title: "Build confidence and find a routine that works for me",
    desc: "I want guidance, accountability and support to exercise more consistently.",
  },
];
const UNSURE_OPTION = {
  id: "unsure",
  title: "I\u2019m not sure yet",
  desc: "I know I would like support, but I am not completely sure where to begin.",
};

const MAX_SELECT = 2;

export default function SupportQuiz() {
  const [selected, setSelected] = useState<string[]>([]);
  const unsureSelected = selected.includes(UNSURE_OPTION.id);

  function toggleMain(id: string) {
    setSelected((prev) => {
      const withoutUnsure = prev.filter((s) => s !== UNSURE_OPTION.id);
      if (withoutUnsure.includes(id)) {
        return withoutUnsure.filter((s) => s !== id);
      }
      if (withoutUnsure.length >= MAX_SELECT) {
        return withoutUnsure;
      }
      return [...withoutUnsure, id];
    });
  }

  function toggleUnsure() {
    setSelected((prev) =>
      prev.includes(UNSURE_OPTION.id) ? [] : [UNSURE_OPTION.id]
    );
  }

  const mainCount = selected.filter((s) => s !== UNSURE_OPTION.id).length;
  const atLimit = mainCount >= MAX_SELECT;
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
  };

  const helper: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    lineHeight: 1.6,
    color: "var(--text-secondary)",
    marginTop: 12,
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
    color: "var(--text-primary)",
    margin: 0,
  };

  const optDesc: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    lineHeight: 1.55,
    color: "var(--text-secondary)",
    margin: "6px 0 0",
  };
  return (
    <section style={wrap} aria-labelledby="support-quiz-heading">
      <p style={eyebrow}>A considered question</p>
      <h2 id="support-quiz-heading" style={heading}>
        What would you most like support with right now?
      </h2>
      <p style={helper}>Choose up to two.</p>

      <div role="group" aria-labelledby="support-quiz-heading" style={{ marginTop: 28 }}>
        {MAIN_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.id);
          const disabled = !isSelected && (atLimit || unsureSelected);
          return (
            <button
              key={opt.id}
              type="button"
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => toggleMain(opt.id)}
              style={optionStyle(isSelected, disabled)}
            >
              <p style={optTitle}>{opt.title}</p>
              <p style={optDesc}>{opt.desc}</p>
            </button>
          );
        })}

        <div
          style={{
            height: 1,
            background: "var(--line)",
            border: "none",
            margin: "26px 0 8px",
          }}
        />

        <button
          type="button"
          aria-pressed={unsureSelected}
          onClick={toggleUnsure}
          style={optionStyle(unsureSelected, false)}
        >
          <p style={optTitle}>{UNSURE_OPTION.title}</p>
          <p style={optDesc}>{UNSURE_OPTION.desc}</p>
        </button>
      </div>
    </section>
  );
}
