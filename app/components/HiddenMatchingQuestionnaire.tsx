"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";

import {
  AVAILABILITY_OPTIONS,
  CLIENT_GENDER_PREFERENCES,
  EXERCISE_STAGES,
  EXPERIENCE_LEVELS,
  EXPERTISE_OPTIONS,
  INSURANCE_CONFIRMATIONS,
  PROFESSIONAL_GENDERS,
  PROFESSIONAL_ROLES,
  SERVICE_AREAS,
  SETTINGS,
  SUPPORT_STYLES,
} from "../lib/matching-questionnaires";

type Props = { kind: "client" | "professional"; token?: string };
type FieldErrors = Record<string, string>;
type ChoiceOption = { id: string; label: string };
type ExpertiseOption = ChoiceOption & { category: string; safetySensitive: boolean };
type ExpertiseResponse = { submittedLevel: string; evidence: string; approximateClientsSupported: string };

const expertiseOptions = EXPERTISE_OPTIONS as ExpertiseOption[];

const styles: Record<string, React.CSSProperties> = {
  shell: { minHeight: "100vh", padding: "24px clamp(20px, 5vw, 64px) 72px" },
  nav: { maxWidth: 980, margin: "0 auto", paddingBottom: 24, borderBottom: "1px solid var(--line)" },
  logo: { height: 62, width: "auto" },
  card: { maxWidth: 860, margin: "0 auto", padding: "clamp(48px, 8vw, 84px) 0" },
  eyebrow: { fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-label)", marginBottom: 12 },
  heading: { fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(30px, 5vw, 43px)", lineHeight: 1.12, margin: 0 },
  section: { padding: "34px 0", borderTop: "1px solid var(--line)" },
  sectionTitle: { fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 27, margin: "0 0 8px" },
  body: { fontSize: 15, lineHeight: 1.65, color: "var(--text-secondary)", margin: "8px 0 20px" },
  grid: { display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" },
  field: { width: "100%", border: "1px solid var(--line)", background: "var(--field)", borderRadius: 10, padding: "13px 14px", fontSize: 15, color: "var(--text-primary)" },
  label: { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 7, color: "var(--text-primary)" },
  error: { color: "#9b332d", fontSize: 13, margin: "7px 0 0" },
  choice: { display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--field)", fontSize: 14, lineHeight: 1.45 },
  button: { border: 0, background: "var(--charcoal)", color: "var(--warm-white)", padding: "15px 26px", borderRadius: 10, cursor: "pointer", fontSize: 15 },
  tableWrap: { overflowX: "auto", border: "1px solid var(--line)", borderRadius: 12 },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 760 },
  cell: { padding: 12, borderBottom: "1px solid var(--line)", verticalAlign: "top", textAlign: "left", fontSize: 13 },
};

const idOptions = (values: string[]): ChoiceOption[] => values.map((value) => ({ id: value, label: value }));

function Field({ label, value, onChange, error, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; error?: string; type?: string; required?: boolean }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <div><label htmlFor={id} style={styles.label}>{label}{required ? " *" : ""}</label><input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} style={styles.field} />{error && <p style={styles.error}>{error}</p>}</div>;
}

function SelectField({ label, value, onChange, options, error, required = false }: { label: string; value: string; onChange: (value: string) => void; options: string[]; error?: string; required?: boolean }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <div><label htmlFor={id} style={styles.label}>{label}{required ? " *" : ""}</label><select id={id} value={value} onChange={(event) => onChange(event.target.value)} style={styles.field}><option value="">Choose one</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>{error && <p style={styles.error}>{error}</p>}</div>;
}

function MultiChoice({ options, values, onChange, max, error }: { options: ChoiceOption[]; values: string[]; onChange: (values: string[]) => void; max?: number; error?: string }) {
  function toggle(id: string) {
    if (values.includes(id)) onChange(values.filter((value) => value !== id));
    else if (!max || values.length < max) onChange([...values, id]);
  }
  return <div style={{ display: "grid", gap: 10 }}>{options.map((option) => {
    const checked = values.includes(option.id);
    const disabled = !checked && Boolean(max && values.length >= max);
    return <label key={option.id} style={{ ...styles.choice, opacity: disabled ? 0.5 : 1 }}><input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(option.id)} /><span>{option.label}</span></label>;
  })}{error && <p style={styles.error}>{error}</p>}</div>;
}

function Frame({ children }: { children: React.ReactNode }) {
  return <main style={styles.shell}><nav style={styles.nav}><Image src="/logo.png" alt="Curated Fit" width={180} height={62} priority style={styles.logo} /></nav><section style={styles.card}>{children}</section></main>;
}

function ProfessionalQuestionnaire({ token }: { token: string }) {
  const [professionalName, setProfessionalName] = useState("");
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({
    roles: [] as string[], matchingQualifications: "", matchingTrainingProvider: "", matchingQualificationYear: "",
    matchingProfessionalRegistration: "", matchingRegistrationNumber: "", matchingInsuranceConfirmation: "",
    matchingInsuranceDetails: "", structuredAvailability: "", experiencedClientStages: [] as string[],
    workingSettings: [] as string[], baseSuburb: "", travelAreas: [] as string[], travelsToClients: false,
    travelCharge: "", otherArea: "", supportStyles: [] as string[], gender: "",
    expertise: Object.fromEntries(expertiseOptions.map(({ id }) => [id, { submittedLevel: "", evidence: "", approximateClientsSupported: "" }])) as Record<string, ExpertiseResponse>,
  });

  useEffect(() => {
    if (!token) { setFatalError("This questionnaire link is not valid."); setLoading(false); return; }
    const controller = new AbortController();
    fetch(`/api/matching-staging/professional?token=${encodeURIComponent(token)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "This questionnaire link is not valid."); setProfessionalName(data.professional?.name || ""); })
      .catch((error) => { if (error.name !== "AbortError") setFatalError("This questionnaire link is not valid."); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [token]);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));
  const updateExpertise = (id: string, key: keyof ExpertiseResponse, value: string) => setForm((current) => ({ ...current, expertise: { ...current.expertise, [id]: { ...current.expertise[id], [key]: value } } }));

  async function submit(event: FormEvent) {
    event.preventDefault(); setSubmitting(true); setFatalError(""); setErrors({});
    try {
      const response = await fetch("/api/matching-staging/professional", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, ...form }) });
      const data = await response.json();
      if (!response.ok) { setErrors(data.fields || {}); throw new Error(data.error || "The questionnaire could not be saved."); }
      setDone(true); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) { setFatalError(error instanceof Error ? error.message : "The questionnaire could not be saved."); }
    finally { setSubmitting(false); }
  }

  if (loading) return <Frame><p style={styles.body}>Opening your questionnaire…</p></Frame>;
  if (fatalError && !professionalName) return <Frame><p style={styles.eyebrow}>Private questionnaire</p><h1 style={styles.heading}>We could not open this link.</h1><p style={styles.body}>This questionnaire link is not valid.</p></Frame>;
  if (done) return <Frame><p style={styles.eyebrow}>Responses received</p><h1 style={styles.heading}>Thank you{professionalName ? `, ${professionalName.split(" ")[0]}` : ""}.</h1><p style={styles.body}>Your questionnaire has been saved for review. It has not approved you for matching or triggered an introduction, email or notification.</p></Frame>;

  return <Frame><p style={styles.eyebrow}>Private professional questionnaire</p><h1 style={styles.heading}>Your Curated Fit matching profile</h1><p style={styles.body}>Complete all nine questions. Safety-sensitive experience, qualifications, insurance and evidence remain subject to review.</p><form onSubmit={submit}>
    <Question number={1} title="Professional roles"><MultiChoice options={idOptions(PROFESSIONAL_ROLES)} values={form.roles} onChange={(value) => update("roles", value)} error={errors.roles} /></Question>
    <Question number={2} title="Qualifications, registration and insurance"><div style={styles.grid}><Field label="Qualifications" value={form.matchingQualifications} onChange={(value) => update("matchingQualifications", value)} error={errors.matchingQualifications} required /><Field label="Training provider" value={form.matchingTrainingProvider} onChange={(value) => update("matchingTrainingProvider", value)} error={errors.matchingTrainingProvider} required /><Field label="Qualification year" value={form.matchingQualificationYear} onChange={(value) => update("matchingQualificationYear", value)} error={errors.matchingQualificationYear} type="number" required /><Field label="Professional registration" value={form.matchingProfessionalRegistration} onChange={(value) => update("matchingProfessionalRegistration", value)} /><Field label="Registration number" value={form.matchingRegistrationNumber} onChange={(value) => update("matchingRegistrationNumber", value)} /><SelectField label="Insurance confirmation" value={form.matchingInsuranceConfirmation} onChange={(value) => update("matchingInsuranceConfirmation", value)} options={INSURANCE_CONFIRMATIONS} error={errors.matchingInsuranceConfirmation} required /><Field label="Insurance details" value={form.matchingInsuranceDetails} onChange={(value) => update("matchingInsuranceDetails", value)} error={errors.matchingInsuranceDetails} /></div><p style={styles.body}>Qualification and insurance evidence is required for review. Secure evidence upload is not enabled in this questionnaire, so no file or base64 data will be sent to Airtable. Curated Fit will request evidence through an approved secure process.</p></Question>
    <Question number={3} title="Availability"><SelectField label="Structured availability" value={form.structuredAvailability} onChange={(value) => update("structuredAvailability", value)} options={AVAILABILITY_OPTIONS} error={errors.structuredAvailability} required /></Question>
    <Question number={4} title="Client exercise stages"><p style={styles.body}>Choose up to three.</p><MultiChoice options={EXERCISE_STAGES} values={form.experiencedClientStages} onChange={(value) => update("experiencedClientStages", value)} max={3} error={errors.experiencedClientStages} /></Question>
    <Question number={5} title="Relevant professional experience"><p style={styles.body}>Complete all 12 rows. Substantial or specialist experience remains capped until evidence is verified. Safety-sensitive scope is never automatically approved.</p><div style={styles.tableWrap}><table style={styles.table}><thead><tr><th style={styles.cell}>Expertise</th><th style={styles.cell}>Submitted level</th><th style={styles.cell}>Evidence</th><th style={styles.cell}>Approximate clients supported</th></tr></thead><tbody>{expertiseOptions.map((option) => <tr key={option.id}><td style={styles.cell}><strong>{option.id}</strong><br />{option.label}{option.safetySensitive ? <><br /><small>Safety-sensitive</small></> : null}</td><td style={styles.cell}><select aria-label={`${option.id} Submitted Level`} value={form.expertise[option.id].submittedLevel} onChange={(event) => updateExpertise(option.id, "submittedLevel", event.target.value)} style={styles.field}><option value="">Choose</option>{EXPERIENCE_LEVELS.map((level) => <option key={level}>{level}</option>)}</select>{errors[`expertise.${option.id}`] && <p style={styles.error}>{errors[`expertise.${option.id}`]}</p>}</td><td style={styles.cell}><input aria-label={`${option.id} Evidence`} value={form.expertise[option.id].evidence} onChange={(event) => updateExpertise(option.id, "evidence", event.target.value)} style={styles.field} /></td><td style={styles.cell}><input aria-label={`${option.id} Approximate Clients Supported`} type="number" min="0" value={form.expertise[option.id].approximateClientsSupported} onChange={(event) => updateExpertise(option.id, "approximateClientsSupported", event.target.value)} style={styles.field} /></td></tr>)}</tbody></table></div>{errors.expertise && <p style={styles.error}>{errors.expertise}</p>}</Question>
    <Question number={6} title="Working settings"><MultiChoice options={SETTINGS} values={form.workingSettings} onChange={(value) => update("workingSettings", value)} error={errors.workingSettings} /></Question>
    <Question number={7} title="Location and travel"><div style={styles.grid}><Field label="Base suburb" value={form.baseSuburb} onChange={(value) => update("baseSuburb", value)} error={errors.baseSuburb} required /><Field label="Other area" value={form.otherArea} onChange={(value) => update("otherArea", value)} /><Field label="Travel charge" type="number" value={form.travelCharge} onChange={(value) => update("travelCharge", value)} error={errors.travelCharge} /></div><p style={styles.body}>Canonical travel areas</p><MultiChoice options={SERVICE_AREAS} values={form.travelAreas} onChange={(value) => update("travelAreas", value)} /><label style={{ ...styles.choice, marginTop: 16 }}><input type="checkbox" checked={form.travelsToClients} onChange={(event) => update("travelsToClients", event.target.checked)} /><span>I travel to clients</span></label></Question>
    <Question number={8} title="Support style"><p style={styles.body}>Choose up to two.</p><MultiChoice options={SUPPORT_STYLES} values={form.supportStyles} onChange={(value) => update("supportStyles", value)} max={2} error={errors.supportStyles} /></Question>
    <Question number={9} title="Gender"><SelectField label="Gender" value={form.gender} onChange={(value) => update("gender", value)} options={PROFESSIONAL_GENDERS} error={errors.gender} required /></Question>
    {fatalError && <p role="alert" style={styles.error}>{fatalError}</p>}<button type="submit" disabled={submitting} style={{ ...styles.button, opacity: submitting ? 0.5 : 1 }}>{submitting ? "Saving…" : "Submit questionnaire"}</button>
  </form></Frame>;
}

function ClientQuestionnaire() {
  const [submitting, setSubmitting] = useState(false); const [done, setDone] = useState(false); const [fatalError, setFatalError] = useState(""); const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({ clientName: "", email: "", phoneNumber: "", selectedOutcomes: [] as string[], selectedConsiderations: [] as string[], exerciseStage: "", preferredSettings: [] as string[], suburb: "", postcode: "", preferredSupportStyles: [] as string[], genderPreference: "" });
  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) { event.preventDefault(); setSubmitting(true); setErrors({}); setFatalError(""); try { const response = await fetch("/api/matching-staging/client", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const data = await response.json(); if (!response.ok) { setErrors(data.fields || {}); throw new Error(data.error || "The test record could not be saved."); } setDone(true); window.scrollTo({ top: 0, behavior: "smooth" }); } catch (error) { setFatalError(error instanceof Error ? error.message : "The test record could not be saved."); } finally { setSubmitting(false); } }
  if (done) return <Frame><p style={styles.eyebrow}>Test record saved</p><h1 style={styles.heading}>Client responses received.</h1><p style={styles.body}>No match has been selected, assigned or contacted.</p></Frame>;
  return <Frame><p style={styles.eyebrow}>Internal staging questionnaire</p><h1 style={styles.heading}>Client matching test</h1><p style={styles.body}>This route creates a test record only. It does not trigger matching, introductions, email or notifications.</p><form onSubmit={submit}>
    <Question title="Client details"><div style={styles.grid}><Field label="Client Name" value={form.clientName} onChange={(value) => update("clientName", value)} error={errors.clientName} required /><Field label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} error={errors.email} required /><Field label="Phone Number" value={form.phoneNumber} onChange={(value) => update("phoneNumber", value)} /></div></Question>
    <Question title="Selected Outcomes"><p style={styles.body}>Choose up to two.</p><MultiChoice options={expertiseOptions.filter((item) => item.category === "Outcome")} values={form.selectedOutcomes} onChange={(value) => update("selectedOutcomes", value)} max={2} error={errors.selectedOutcomes} /></Question>
    <Question title="Selected Considerations"><MultiChoice options={expertiseOptions.filter((item) => item.category === "Consideration")} values={form.selectedConsiderations} onChange={(value) => update("selectedConsiderations", value)} error={errors.selectedConsiderations} /></Question>
    <Question title="Exercise Stage"><SelectIdField label="Exercise Stage" value={form.exerciseStage} onChange={(value) => update("exerciseStage", value)} options={EXERCISE_STAGES} error={errors.exerciseStage} /></Question>
    <Question title="Preferred Settings"><p style={styles.body}>Choose up to two.</p><MultiChoice options={SETTINGS} values={form.preferredSettings} onChange={(value) => update("preferredSettings", value)} max={2} error={errors.preferredSettings} /></Question>
    <Question title="Location"><div style={styles.grid}><SelectIdField label="Suburb" value={form.suburb} onChange={(value) => update("suburb", value)} options={SERVICE_AREAS} error={errors.suburb} /><Field label="Postcode" value={form.postcode} onChange={(value) => update("postcode", value)} error={errors.postcode} required /></div><p style={styles.body}>Only canonical Service Areas may be linked. No suburb or region records are created automatically.</p></Question>
    <Question title="Preferred Support Styles"><p style={styles.body}>Choose up to two.</p><MultiChoice options={SUPPORT_STYLES} values={form.preferredSupportStyles} onChange={(value) => update("preferredSupportStyles", value)} max={2} error={errors.preferredSupportStyles} /></Question>
    <Question title="Gender Preference"><SelectField label="Gender Preference" value={form.genderPreference} onChange={(value) => update("genderPreference", value)} options={CLIENT_GENDER_PREFERENCES} error={errors.genderPreference} required /></Question>
    {fatalError && <p role="alert" style={styles.error}>{fatalError}</p>}<button type="submit" disabled={submitting} style={{ ...styles.button, opacity: submitting ? 0.5 : 1 }}>{submitting ? "Saving…" : "Create test record"}</button>
  </form></Frame>;
}

function SelectIdField({ label, value, onChange, options, error }: { label: string; value: string; onChange: (value: string) => void; options: ChoiceOption[]; error?: string }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <div><label htmlFor={id} style={styles.label}>{label} *</label><select id={id} value={value} onChange={(event) => onChange(event.target.value)} style={styles.field}><option value="">Choose one</option>{options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select>{error && <p style={styles.error}>{error}</p>}</div>;
}

function Question({ number, title, children }: { number?: number; title: string; children: React.ReactNode }) {
  return <section style={styles.section}>{number ? <p style={styles.eyebrow}>Question {number} of 9</p> : null}<h2 style={styles.sectionTitle}>{title}</h2>{children}</section>;
}

export default function HiddenMatchingQuestionnaire({ kind, token = "" }: Props) {
  return kind === "professional" ? <ProfessionalQuestionnaire token={token} /> : <ClientQuestionnaire />;
}
