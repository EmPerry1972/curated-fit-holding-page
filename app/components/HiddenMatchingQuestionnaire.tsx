"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";

import {
  ALL_CLIENT_WORK_MODES,
  AVAILABILITY_OPTIONS,
  CLIENT_WORK_MODES,
  CLIENT_GENDER_PREFERENCES,
  EXERCISE_STAGES,
  EXPERIENCE_LEVELS,
  EXPERTISE_OPTIONS,
  INSURANCE_CONFIRMATIONS,
  PROFESSIONAL_GENDERS,
  PROFESSIONAL_ROLES,
  QUALIFICATION_COMPLETION_STATUSES,
  SERVICE_AREAS,
  SETTINGS,
  SUPPORT_STYLES,
} from "../lib/matching-questionnaires";

type Props = { kind: "client" | "professional"; token?: string; clientAuthenticated?: boolean };
type FieldErrors = Record<string, string>;
type ChoiceOption = { id: string; label: string };
type ExpertiseOption = ChoiceOption & { category: string; safetySensitive: boolean };
type ExpertiseResponse = { submittedLevel: string; evidence: string; approximateClientsSupported: string };
type ServiceAreaOption = ChoiceOption & { regionName: string; regionId: string; locationType: string; online: boolean };

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
  secondaryButton: { border: "1px solid var(--line)", background: "var(--field)", color: "var(--text-primary)", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13 },
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

function SearchableAreaMultiChoice({ options, values, onChange, error }: { options: ServiceAreaOption[]; values: string[]; onChange: (values: string[]) => void; error?: string }) {
  const [search, setSearch] = useState("");
  const byId = new Map(options.map((option) => [option.id, option]));
  const visible = options.filter((option) => `${option.label} ${option.regionName}`.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 40);
  const toggle = (id: string) => onChange(values.includes(id) ? values.filter((value) => value !== id) : [...values, id]);
  return <div><input type="search" aria-label="Search travel areas" placeholder="Search towns, suburbs or areas" value={search} onChange={(event) => setSearch(event.target.value)} style={styles.field} />
    {values.length ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0" }}>{values.map((id) => <button key={id} type="button" onClick={() => toggle(id)} style={styles.secondaryButton}>{byId.get(id)?.label || id} ×</button>)}</div> : null}
    <div style={{ display: "grid", gap: 8, marginTop: 12 }}>{visible.map((option) => <label key={option.id} style={styles.choice}><input type="checkbox" checked={values.includes(option.id)} onChange={() => toggle(option.id)} /><span>{option.label}<br /><small>{option.regionName}</small></span></label>)}</div>
    {error && <p style={styles.error}>{error}</p>}
  </div>;
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
  const [serviceAreas, setServiceAreas] = useState<ServiceAreaOption[]>([]);
  const [regionId, setRegionId] = useState("");
  const [baseLocationSearch, setBaseLocationSearch] = useState("");
  const [form, setForm] = useState({
    roles: [] as string[], otherRole: "", matchingQualifications: "", matchingTrainingProvider: "", qualificationCompletionStatus: "",
    matchingProfessionalRegistration: "", matchingRegistrationNumber: "", matchingInsuranceConfirmation: "",
    structuredAvailability: "", experiencedClientStages: [] as string[],
    workingSettings: [] as string[], baseSuburb: "", locationNotListed: false, travelAreas: [] as string[], clientWorkModes: [] as string[],
    otherArea: "", supportStyles: [] as string[], gender: "",
    expertise: Object.fromEntries(expertiseOptions.map(({ id }) => [id, { submittedLevel: "", evidence: "", approximateClientsSupported: "" }])) as Record<string, ExpertiseResponse>,
  });

  useEffect(() => {
    if (!token) { setFatalError("This questionnaire link is not valid."); setLoading(false); return; }
    const controller = new AbortController();
    fetch(`/api/matching-staging/professional?token=${encodeURIComponent(token)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "This questionnaire link is not valid."); setProfessionalName(data.professional?.name || ""); setServiceAreas(data.serviceAreas || []); })
      .catch((error) => { if (error.name !== "AbortError") setFatalError("This questionnaire link is not valid."); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [token]);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));
  const updateExpertise = (id: string, key: keyof ExpertiseResponse, value: string) => setForm((current) => ({ ...current, expertise: { ...current.expertise, [id]: { ...current.expertise[id], [key]: value } } }));
  const locationOptions = serviceAreas.filter((area) => !area.online && area.regionName === regionId);
  const travelAreaOptions = serviceAreas.filter((area) => !area.online);
  const regions = Array.from(new Map(serviceAreas.filter((area) => !area.online && area.regionName).map((area) => [area.regionName, area.regionName])).entries()).sort((left, right) => left[1].localeCompare(right[1]));
  const locationDisplay = (area: ServiceAreaOption) => area.label;
  const travelsToClients = form.clientWorkModes.includes("I can travel to clients") || form.clientWorkModes.includes(ALL_CLIENT_WORK_MODES);

  function updateRoles(roles: string[]) {
    setForm((current) => ({ ...current, roles, ...(!roles.includes("Other") ? { otherRole: "" } : {}) }));
  }

  function updateSubmittedLevel(id: string, submittedLevel: string) {
    setForm((current) => ({ ...current, expertise: { ...current.expertise, [id]: { ...current.expertise[id], submittedLevel, ...(submittedLevel !== "Substantial or specialist" ? { evidence: "", approximateClientsSupported: "" } : {}) } } }));
  }

  function updateRegion(value: string) {
    setRegionId(value); setBaseLocationSearch(""); update("baseSuburb", "");
  }

  function updateBaseLocation(value: string) {
    setBaseLocationSearch(value);
    const selected = locationOptions.find((area) => locationDisplay(area) === value);
    update("baseSuburb", selected?.id || "");
  }

  function updateLocationNotListed(checked: boolean) {
    setForm((current) => ({ ...current, locationNotListed: checked, baseSuburb: "", otherArea: checked ? current.otherArea : "" }));
    setBaseLocationSearch("");
  }

  function toggleWorkMode(mode: string) {
    setForm((current) => {
      const currentModes = current.clientWorkModes;
      const clientWorkModes = mode === ALL_CLIENT_WORK_MODES
        ? (currentModes.includes(ALL_CLIENT_WORK_MODES) ? [] : [ALL_CLIENT_WORK_MODES])
        : (currentModes.includes(mode) ? currentModes.filter((value) => value !== mode) : [...currentModes.filter((value) => value !== ALL_CLIENT_WORK_MODES), mode]);
      const canTravel = clientWorkModes.includes("I can travel to clients") || clientWorkModes.includes(ALL_CLIENT_WORK_MODES);
      return { ...current, clientWorkModes, ...(!canTravel ? { travelAreas: [] } : {}) };
    });
  }

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

  return <Frame><p style={styles.eyebrow}>Private professional questionnaire</p><h1 style={styles.heading}>Your Curated Fit matching profile</h1><p style={styles.body}>Complete all nine questions. Qualifications, insurance and specialist experience remain subject to Curated Fit review.</p><form onSubmit={submit}>
    <Question number={1} title="Professional roles"><MultiChoice options={idOptions(PROFESSIONAL_ROLES)} values={form.roles} onChange={updateRoles} error={errors.roles} />{form.roles.includes("Other") ? <div style={{ marginTop: 16 }}><Field label="Please describe your role" value={form.otherRole} onChange={(value) => update("otherRole", value)} error={errors.otherRole} required /></div> : null}</Question>
    <Question number={2} title="Qualifications, registration and insurance"><div style={styles.grid}><Field label="Qualifications" value={form.matchingQualifications} onChange={(value) => update("matchingQualifications", value)} error={errors.matchingQualifications} required /><Field label="Training provider" value={form.matchingTrainingProvider} onChange={(value) => update("matchingTrainingProvider", value)} error={errors.matchingTrainingProvider} required /><SelectField label="Qualification Completion Status" value={form.qualificationCompletionStatus} onChange={(value) => update("qualificationCompletionStatus", value)} options={QUALIFICATION_COMPLETION_STATUSES} error={errors.qualificationCompletionStatus} required /><Field label="Professional registration" value={form.matchingProfessionalRegistration} onChange={(value) => update("matchingProfessionalRegistration", value)} /><Field label="Registration number" value={form.matchingRegistrationNumber} onChange={(value) => update("matchingRegistrationNumber", value)} /><SelectField label="Do you currently hold the professional insurance required for the services you provide?" value={form.matchingInsuranceConfirmation} onChange={(value) => update("matchingInsuranceConfirmation", value)} options={INSURANCE_CONFIRMATIONS} error={errors.matchingInsuranceConfirmation} required /></div></Question>
    <Question number={3} title="Availability"><SelectField label="Structured availability" value={form.structuredAvailability} onChange={(value) => update("structuredAvailability", value)} options={AVAILABILITY_OPTIONS} error={errors.structuredAvailability} required /></Question>
    <Question number={4} title="Which types of clients do you have the most experience supporting?"><p style={styles.body}>Choose up to three areas where your experience is strongest.</p><MultiChoice options={EXERCISE_STAGES} values={form.experiencedClientStages} onChange={(value) => update("experiencedClientStages", value)} max={3} error={errors.experiencedClientStages} /></Question>
    <Question number={5} title="Tell us where your experience is strongest"><p style={styles.body}>Please complete each row so we can introduce you to clients whose goals and needs align well with your experience.</p><p style={styles.body}>If you select substantial or specialist experience, we may contact you for a little more information before including that experience in matching. Areas involving health conditions, pain, injury, surgery or other specialist needs are reviewed by Curated Fit to help ensure every introduction is appropriate.</p><div style={styles.tableWrap}><table style={styles.table}><thead><tr><th style={styles.cell}>Expertise</th><th style={styles.cell}>Submitted level</th><th style={styles.cell}>Tell us a little about your experience in this area</th><th style={styles.cell}>Approximate clients supported</th></tr></thead><tbody>{expertiseOptions.map((option) => { const showExperience = form.expertise[option.id].submittedLevel === "Substantial or specialist"; return <tr key={option.id}><td style={styles.cell}><strong>{option.id}</strong><br />{option.label}{option.safetySensitive ? <><br /><small>Specialist review applies</small></> : null}</td><td style={styles.cell}><select aria-label={`${option.id} Submitted Level`} value={form.expertise[option.id].submittedLevel} onChange={(event) => updateSubmittedLevel(option.id, event.target.value)} style={styles.field}><option value="">Choose</option>{EXPERIENCE_LEVELS.map((level) => <option key={level}>{level}</option>)}</select>{errors[`expertise.${option.id}`] && <p style={styles.error}>{errors[`expertise.${option.id}`]}</p>}</td><td style={styles.cell}>{showExperience ? <><label htmlFor={`${option.id}-experience`} style={styles.label}>Tell us a little about your experience in this area</label><p style={styles.body}>For example, relevant training, how long you have worked in this area, or the types of clients you have supported.</p><textarea id={`${option.id}-experience`} aria-label={`${option.id} experience`} value={form.expertise[option.id].evidence} onChange={(event) => updateExpertise(option.id, "evidence", event.target.value)} style={styles.field} /></> : null}</td><td style={styles.cell}>{showExperience ? <input aria-label={`${option.id} Approximate Clients Supported`} type="number" min="0" value={form.expertise[option.id].approximateClientsSupported} onChange={(event) => updateExpertise(option.id, "approximateClientsSupported", event.target.value)} style={styles.field} /> : null}</td></tr>; })}</tbody></table></div>{errors.expertise && <p style={styles.error}>{errors.expertise}</p>}</Question>
    <Question number={6} title="Working settings"><MultiChoice options={SETTINGS} values={form.workingSettings} onChange={(value) => update("workingSettings", value)} error={errors.workingSettings} /></Question>
    <Question number={7} title="Where are you based?"><div style={styles.grid}><SelectField label="Region" value={regionId} onChange={updateRegion} options={regions.map(([id]) => id)} required={false} />{regionId && !form.locationNotListed ? <div><label htmlFor="base-town-or-suburb" style={styles.label}>Searchable town or suburb</label><input id="base-town-or-suburb" type="search" list="base-location-options" value={baseLocationSearch} onChange={(event) => updateBaseLocation(event.target.value)} style={styles.field} /><datalist id="base-location-options">{locationOptions.map((area) => <option key={area.id} value={locationDisplay(area)}>{area.label}</option>)}</datalist>{errors.baseSuburb && <p style={styles.error}>{errors.baseSuburb}</p>}</div> : null}</div><label style={{ ...styles.choice, marginTop: 16 }}><input type="checkbox" checked={form.locationNotListed} onChange={(event) => updateLocationNotListed(event.target.checked)} /><span>My location is not listed</span></label>{form.locationNotListed ? <div style={{ marginTop: 16 }}><Field label="Town, suburb or area" value={form.otherArea} onChange={(value) => update("otherArea", value)} error={errors.otherArea} required /></div> : null}{!form.locationNotListed && errors.baseSuburb && !regionId ? <p style={styles.error}>{errors.baseSuburb}</p> : null}<h3 style={{ ...styles.sectionTitle, fontSize: 22, marginTop: 28 }}>How can clients work with you?</h3><p style={styles.body}>Choose all that apply.</p><div style={{ display: "grid", gap: 10 }}>{[...CLIENT_WORK_MODES, ALL_CLIENT_WORK_MODES].map((mode) => <label key={mode} style={styles.choice}><input type="checkbox" checked={form.clientWorkModes.includes(mode)} onChange={() => toggleWorkMode(mode)} /><span>{mode}</span></label>)}</div>{errors.clientWorkModes && <p style={styles.error}>{errors.clientWorkModes}</p>}{travelsToClients ? <div style={{ marginTop: 24 }}><h3 style={{ ...styles.sectionTitle, fontSize: 22 }}>Which towns, suburbs or areas can you travel to?</h3><p style={styles.body}>Choose all that apply.</p><SearchableAreaMultiChoice options={travelAreaOptions} values={form.travelAreas} onChange={(value) => update("travelAreas", value)} error={errors.travelAreas} /></div> : null}</Question>
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
    <Question title="Location"><div style={styles.grid}><SelectIdField label="Suburb" value={form.suburb} onChange={(value) => update("suburb", value)} options={SERVICE_AREAS} error={errors.suburb} /><Field label="Postcode" value={form.postcode} onChange={(value) => update("postcode", value)} error={errors.postcode} required /></div><p style={styles.body}>Only listed Service Areas may be linked. No suburb or region records are created automatically.</p></Question>
    <Question title="Preferred Support Styles"><p style={styles.body}>Choose up to two.</p><MultiChoice options={SUPPORT_STYLES} values={form.preferredSupportStyles} onChange={(value) => update("preferredSupportStyles", value)} max={2} error={errors.preferredSupportStyles} /></Question>
    <Question title="Gender Preference"><SelectField label="Gender Preference" value={form.genderPreference} onChange={(value) => update("genderPreference", value)} options={CLIENT_GENDER_PREFERENCES} error={errors.genderPreference} required /></Question>
    {fatalError && <p role="alert" style={styles.error}>{fatalError}</p>}<button type="submit" disabled={submitting} style={{ ...styles.button, opacity: submitting ? 0.5 : 1 }}>{submitting ? "Saving…" : "Create test record"}</button>
  </form></Frame>;
}

function ClientAccessGate() {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  async function authenticate(event: FormEvent) {
    event.preventDefault(); setSubmitting(true); setError("");
    try {
      const response = await fetch("/api/matching-staging/client-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (!response.ok) throw new Error("Unavailable");
      window.location.reload();
    } catch {
      setError("This facility is unavailable.");
    } finally {
      setSubmitting(false);
    }
  }
  return <Frame><p style={styles.eyebrow}>Internal staging access</p><h1 style={styles.heading}>Client matching test</h1><p style={styles.body}>Enter the separate client-test password to continue.</p><form onSubmit={authenticate}><Field label="Client-test password" type="password" value={password} onChange={setPassword} required />{error && <p role="alert" style={styles.error}>{error}</p>}<button type="submit" disabled={submitting} style={{ ...styles.button, opacity: submitting ? 0.5 : 1 }}>{submitting ? "Checking…" : "Continue"}</button></form></Frame>;
}

function SelectIdField({ label, value, onChange, options, error, required = true, emptyLabel = "Choose one" }: { label: string; value: string; onChange: (value: string) => void; options: ChoiceOption[]; error?: string; required?: boolean; emptyLabel?: string }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <div><label htmlFor={id} style={styles.label}>{label}{required ? " *" : ""}</label><select id={id} value={value} onChange={(event) => onChange(event.target.value)} style={styles.field}><option value="">{emptyLabel}</option>{options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select>{error && <p style={styles.error}>{error}</p>}</div>;
}

function Question({ number, title, children }: { number?: number; title: string; children: React.ReactNode }) {
  return <section style={styles.section}>{number ? <p style={styles.eyebrow}>Question {number} of 9</p> : null}<h2 style={styles.sectionTitle}>{title}</h2>{children}</section>;
}

export default function HiddenMatchingQuestionnaire({ kind, token = "", clientAuthenticated = false }: Props) {
  if (kind === "professional") return <ProfessionalQuestionnaire token={token} />;
  return clientAuthenticated ? <ClientQuestionnaire /> : <ClientAccessGate />;
}
