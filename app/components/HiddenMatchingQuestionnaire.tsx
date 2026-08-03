"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Option = { value: string; label: string; exclusive?: boolean };
type Question = { id: string; title: string; helper: string; max?: number; options: Option[] };
type Answers = Record<string, string[]>;
type FieldErrors = Record<string, string>;

type Props = {
  kind: "client" | "professional";
  questions: Question[];
  token?: string;
};

const styles: Record<string, React.CSSProperties> = {
  shell: { minHeight: "100vh", padding: "24px clamp(20px, 5vw, 64px) 72px" },
  nav: { maxWidth: 920, margin: "0 auto", paddingBottom: 24, borderBottom: "1px solid var(--line)" },
  logo: { height: 62, width: "auto" },
  card: { maxWidth: 760, margin: "0 auto", padding: "clamp(54px, 9vw, 94px) 0" },
  eyebrow: { fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-label)", marginBottom: 16 },
  heading: { fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(30px, 5vw, 43px)", lineHeight: 1.12, margin: 0 },
  body: { fontSize: 16, lineHeight: 1.65, color: "var(--text-secondary)", marginTop: 14 },
  field: { width: "100%", border: "1px solid var(--line)", background: "var(--field)", borderRadius: 10, padding: "14px 16px", fontSize: 16, color: "var(--text-primary)" },
  label: { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 7, color: "var(--text-primary)" },
  error: { color: "#9b332d", fontSize: 14, marginTop: 8 },
  primary: { border: 0, background: "var(--charcoal)", color: "var(--warm-white)", padding: "15px 26px", borderRadius: 10, cursor: "pointer" },
  secondary: { border: 0, background: "transparent", color: "var(--text-secondary)", padding: "15px 4px", cursor: "pointer" },
};

function Choice({ option, selected, disabled, onSelect }: { option: Option; selected: boolean; disabled: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "16px 18px",
        marginTop: 12,
        border: selected ? "1px solid var(--charcoal)" : "1px solid var(--line)",
        borderRadius: 12,
        background: selected ? "var(--stone)" : "var(--field)",
        color: "var(--text-primary)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.48 : 1,
        fontSize: 15,
        lineHeight: 1.45,
        letterSpacing: 0,
        textTransform: "none",
      }}
    >
      {option.label}
    </button>
  );
}

export default function HiddenMatchingQuestionnaire({ kind, questions, token = "" }: Props) {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(kind === "client" ? -1 : 0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [consent, setConsent] = useState(false);
  const [professionalName, setProfessionalName] = useState("");
  const [loading, setLoading] = useState(kind === "professional");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [fatalError, setFatalError] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const endpoint = `/api/matching-staging/${kind}`;
  const question = step >= 0 ? questions[step] : null;
  const selected = question ? answers[question.id] || [] : [];

  useEffect(() => {
    if (kind !== "professional") return;
    if (!token) {
      setFatalError("This questionnaire link is incomplete.");
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    fetch(`${endpoint}?token=${encodeURIComponent(token)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "This questionnaire link could not be opened.");
        setProfessionalName(data.professional?.name || "");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setFatalError(error.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [endpoint, kind, token]);

  const canContinue = (() => {
    if (step === -1) return Boolean(fullName.trim() && /^\S+@\S+\.\S+$/.test(email));
    if (!question || selected.length === 0) return false;
    if (question.id === "settings" && !location.trim()) return false;
    if (question.id === "serviceSettings" && !serviceArea.trim()) return false;
    return true;
  })();

  function toggle(option: Option) {
    if (!question) return;
    const current = answers[question.id] || [];
    const isSelected = current.includes(option.value);
    let next: string[];
    if (option.exclusive) next = isSelected ? [] : [option.value];
    else {
      const withoutExclusive = current.filter((value) => !question.options.find((item) => item.value === value)?.exclusive);
      if (withoutExclusive.includes(option.value)) next = withoutExclusive.filter((value) => value !== option.value);
      else if (question.max === 1) next = [option.value];
      else if (question.max && withoutExclusive.length >= question.max) return;
      else next = [...withoutExclusive, option.value];
    }
    setAnswers((previous) => ({ ...previous, [question.id]: next }));
    setErrors((previous) => ({ ...previous, [question.id]: "" }));
  }

  async function submit() {
    if (kind === "client" && !consent) {
      setErrors((previous) => ({ ...previous, consent: "Please confirm that we may store these test responses." }));
      return;
    }
    setSubmitting(true);
    setFatalError("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, answers, fullName, email, phone, location, serviceArea, consent }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrors(data.fields || {});
        throw new Error(data.error || "Your responses could not be saved.");
      }
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setFatalError(error instanceof Error ? error.message : "Your responses could not be saved.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <QuestionnaireFrame><p style={styles.body}>Opening your questionnaire…</p></QuestionnaireFrame>;
  if (fatalError && kind === "professional" && !professionalName) {
    return <QuestionnaireFrame><p style={styles.eyebrow}>Private questionnaire</p><h1 style={styles.heading}>We could not open this link.</h1><p style={styles.body}>{fatalError}</p></QuestionnaireFrame>;
  }
  if (done) {
    return (
      <QuestionnaireFrame>
        <p style={styles.eyebrow}>Responses received</p>
        <h1 style={styles.heading}>Thank you{professionalName ? `, ${professionalName.split(" ")[0]}` : ""}.</h1>
        <p style={styles.body}>Your responses have been saved to the Curated Fit staging workspace for review. No match has been selected or sent.</p>
      </QuestionnaireFrame>
    );
  }

  if (step === -1) {
    return (
      <QuestionnaireFrame>
        <p style={styles.eyebrow}>Private matching test</p>
        <h1 style={styles.heading}>Find the support that fits you.</h1>
        <p style={styles.body}>This private test records your answers in the Curated Fit staging workspace. It does not select, contact or introduce a professional.</p>
        <div style={{ display: "grid", gap: 18, marginTop: 34 }}>
          <Field label="Full name" value={fullName} onChange={setFullName} error={errors.fullName} autoComplete="name" />
          <Field label="Email address" value={email} onChange={setEmail} error={errors.email} type="email" autoComplete="email" />
          <Field label="Mobile number (optional)" value={phone} onChange={setPhone} type="tel" autoComplete="tel" />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 34 }}>
          <button type="button" disabled={!canContinue} onClick={() => setStep(0)} style={{ ...styles.primary, opacity: canContinue ? 1 : 0.42 }}>Begin</button>
        </div>
      </QuestionnaireFrame>
    );
  }

  if (!question) return null;
  const isLast = step === questions.length - 1;
  return (
    <QuestionnaireFrame>
      <p style={styles.eyebrow}>{kind === "professional" ? "Professional matching questionnaire" : "A considered question"}</p>
      {professionalName && step === 0 && <p style={{ ...styles.body, marginTop: 0, marginBottom: 16 }}>Hello {professionalName.split(" ")[0]}.</p>}
      <p style={{ ...styles.eyebrow, marginBottom: 12 }}>Question {step + 1} of {questions.length}</p>
      <h1 style={styles.heading}>{question.title}</h1>
      <p style={styles.body}>{question.helper}</p>
      <div role="group" aria-label={question.title} style={{ marginTop: 26 }}>
        {question.options.map((item) => {
          const active = selected.includes(item.value);
          const exclusiveSelected = selected.some((value) => question.options.find((candidate) => candidate.value === value)?.exclusive);
          const atLimit = Boolean(question.max && selected.length >= question.max);
          const disabled = !active && (exclusiveSelected || (atLimit && !item.exclusive));
          return <Choice key={item.value} option={item} selected={active} disabled={disabled} onSelect={() => toggle(item)} />;
        })}
      </div>
      {errors[question.id] && <p role="alert" style={styles.error}>{errors[question.id]}</p>}
      {question.id === "settings" && (
        <div style={{ marginTop: 30 }}><Field label="Preferred suburb or postcode" value={location} onChange={setLocation} error={errors.location} /></div>
      )}
      {question.id === "serviceSettings" && (
        <div style={{ marginTop: 30 }}><Field label="Service area, suburbs or online coverage" value={serviceArea} onChange={setServiceArea} error={errors.serviceArea} /></div>
      )}
      {isLast && kind === "client" && (
        <div style={{ marginTop: 30, paddingTop: 22, borderTop: "1px solid var(--line)" }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", fontSize: 14 }}>
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} style={{ marginTop: 4 }} />
            <span>I agree to Curated Fit storing these responses in its private staging workspace for matching-system testing. See the <a href="/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</a>.</span>
          </label>
          {errors.consent && <p role="alert" style={styles.error}>{errors.consent}</p>}
        </div>
      )}
      {fatalError && <p role="alert" style={styles.error}>{fatalError}</p>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, marginTop: 36 }}>
        {kind === "client" || step > 0 ? (
          <button type="button" onClick={() => setStep((current) => current - 1)} style={styles.secondary}>Back</button>
        ) : <span />}
        {isLast ? (
          <button type="button" disabled={!canContinue || submitting} onClick={submit} style={{ ...styles.primary, opacity: canContinue && !submitting ? 1 : 0.42 }}>
            {submitting ? "Saving…" : "Submit responses"}
          </button>
        ) : (
          <button type="button" disabled={!canContinue} onClick={() => setStep((current) => current + 1)} style={{ ...styles.primary, opacity: canContinue ? 1 : 0.42 }}>Continue</button>
        )}
      </div>
    </QuestionnaireFrame>
  );
}

function Field({ label, value, onChange, error, type = "text", autoComplete = "off" }: { label: string; value: string; onChange: (value: string) => void; error?: string; type?: string; autoComplete?: string }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div>
      <label htmlFor={id} style={styles.label}>{label}</label>
      <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} style={styles.field} />
      {error && <p role="alert" style={styles.error}>{error}</p>}
    </div>
  );
}

function QuestionnaireFrame({ children }: { children: React.ReactNode }) {
  return (
    <main style={styles.shell}>
      <nav style={styles.nav}><Image src="/logo.png" alt="Curated Fit" width={180} height={62} priority style={styles.logo} /></nav>
      <section style={styles.card}>{children}</section>
    </main>
  );
}
