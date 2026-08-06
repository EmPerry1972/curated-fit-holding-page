"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";

type Professional = { id: string; name: string };

const styles: Record<string, React.CSSProperties> = {
  shell: { minHeight: "100vh", padding: "24px clamp(20px, 5vw, 64px) 72px" },
  nav: { maxWidth: 980, margin: "0 auto", paddingBottom: 24, borderBottom: "1px solid var(--line)" },
  logo: { height: 62, width: "auto" },
  card: { maxWidth: 760, margin: "0 auto", padding: "clamp(48px, 8vw, 84px) 0" },
  eyebrow: { fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-label)", marginBottom: 12 },
  heading: { fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(30px, 5vw, 43px)", lineHeight: 1.12, margin: 0 },
  body: { fontSize: 15, lineHeight: 1.65, color: "var(--text-secondary)", margin: "8px 0 20px" },
  fieldWrap: { marginBottom: 18 },
  field: { width: "100%", border: "1px solid var(--line)", background: "var(--field)", borderRadius: 10, padding: "13px 14px", fontSize: 15, color: "var(--text-primary)" },
  label: { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 7, color: "var(--text-primary)" },
  button: { border: 0, background: "var(--charcoal)", color: "var(--warm-white)", padding: "15px 26px", borderRadius: 10, cursor: "pointer", fontSize: 15 },
  secondaryButton: { border: "1px solid var(--line)", background: "var(--field)", color: "var(--text-primary)", padding: "14px 22px", borderRadius: 10, cursor: "pointer", fontSize: 15 },
  panel: { border: "1px solid var(--line)", background: "var(--field)", borderRadius: 12, padding: 20, margin: "22px 0" },
  error: { color: "#9b332d", fontSize: 13, margin: "12px 0" },
  link: { overflowWrap: "anywhere", lineHeight: 1.55, margin: "10px 0 18px" },
};

function Frame({ children }: { children: React.ReactNode }) {
  return <main style={styles.shell}><nav style={styles.nav}><Image src="/logo.png" alt="Curated Fit" width={180} height={62} priority style={styles.logo} /></nav><section style={styles.card}>{children}</section></main>;
}

function Field({ label, type = "text", value, onChange, required = true }: { label: string; type?: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <div style={styles.fieldWrap}><label htmlFor={id} style={styles.label}>{label}{required ? " *" : ""}</label><input id={id} type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} style={styles.field} /></div>;
}

function AccessGate() {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  async function authenticate(event: FormEvent) {
    event.preventDefault(); setSubmitting(true); setError("");
    try {
      const response = await fetch("/api/matching-staging/invitation-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (!response.ok) throw new Error("Unavailable");
      window.location.reload();
    } catch {
      setError("This facility is unavailable.");
    } finally {
      setSubmitting(false);
    }
  }
  return <Frame><p style={styles.eyebrow}>Internal access</p><h1 style={styles.heading}>Professional invitations</h1><p style={styles.body}>Enter the separate invitation administration password to continue.</p><form onSubmit={authenticate}><Field label="Invitation administration password" type="password" value={password} onChange={setPassword} />{error && <p role="alert" style={styles.error}>{error}</p>}<button type="submit" disabled={submitting} style={{ ...styles.button, opacity: submitting ? 0.5 : 1 }}>{submitting ? "Checking..." : "Continue"}</button></form></Frame>;
}

function InvitationForm() {
  const [professionalRecordId, setProfessionalRecordId] = useState("");
  const [expiry, setExpiry] = useState("");
  const [origin, setOrigin] = useState("");
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [invitationUrl, setInvitationUrl] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => { setOrigin(window.location.origin); }, []);

  function changeProfessionalId(value: string) {
    setProfessionalRecordId(value); setProfessional(null); setInvitationUrl(""); setCopied(false); setError("");
  }

  async function request(action: "verify" | "generate") {
    setWorking(true); setError("");
    try {
      const response = await fetch("/api/matching-staging/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          professionalRecordId: professionalRecordId.trim(),
          expiry: action === "generate" && expiry ? new Date(expiry).toISOString() : expiry,
          origin: origin.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Unavailable");
      setProfessional(data.professional);
      if (action === "generate") setInvitationUrl(data.invitationUrl);
    } catch {
      setProfessional(null); setInvitationUrl(""); setError("The invitation could not be processed.");
    } finally {
      setWorking(false);
    }
  }

  async function verify(event: FormEvent) {
    event.preventDefault(); setInvitationUrl(""); setCopied(false); await request("verify");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(invitationUrl); setCopied(true);
  }

  return <Frame><p style={styles.eyebrow}>Internal tool</p><h1 style={styles.heading}>Create a professional invitation</h1><p style={styles.body}>Verify one Waitlist professional, then create a link. The plaintext token is shown only in the generated link and is not stored.</p><form onSubmit={verify}>
    <Field label="Waitlist Professional ID" value={professionalRecordId} onChange={changeProfessionalId} />
    <Field label="Invitation expiry date and time" type="datetime-local" value={expiry} onChange={setExpiry} />
    <Field label="Questionnaire origin" type="url" value={origin} onChange={setOrigin} />
    <button type="submit" disabled={working} style={{ ...styles.secondaryButton, opacity: working ? 0.5 : 1 }}>{working ? "Checking..." : "Verify professional"}</button>
  </form>
  {professional && !invitationUrl ? <section style={styles.panel}><p style={styles.eyebrow}>Confirm professional</p><h2 style={{ margin: "0 0 8px" }}>{professional.name}</h2><p style={styles.body}>{professional.id}</p><button type="button" disabled={working} onClick={() => request("generate")} style={{ ...styles.button, opacity: working ? 0.5 : 1 }}>{working ? "Generating..." : "Generate questionnaire link"}</button></section> : null}
  {invitationUrl ? <section style={styles.panel}><p style={styles.eyebrow}>Invitation created</p><h2 style={{ margin: "0 0 8px" }}>{professional?.name}</h2><p style={styles.link}>{invitationUrl}</p><button type="button" onClick={copyLink} style={styles.button}>{copied ? "Copied" : "Copy Link"}</button></section> : null}
  {error && <p role="alert" style={styles.error}>{error}</p>}
  </Frame>;
}

export default function MatchingInvitationAdmin({ authenticated }: { authenticated: boolean }) {
  return authenticated ? <InvitationForm /> : <AccessGate />;
}
