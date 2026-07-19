"use client";

import { useState, useRef } from "react";

const SPECIALITIES = [
  "Strength and muscle",
  "General exercise support",
  "Body composition",
  "Menopause",
  "Bone health",
  "Mobility",
  "Injury recovery",
  "Return to exercise",
  "Pilates",
  "Pickleball, Tennis, Golf conditioning",
  "Pre and postnatal",
  "GLP-1 exercise support",
  "Older adult exercise",
  "Online exercise support",
  "Small group exercise",
  "Other",
];

const EXPERIENCE = ["Less than 1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"];

const REGISTRATION = [
  "REPs NZ",
  "PICP / BioSignature",
  "Physiotherapy Board of NZ",
  "Pilates Method Alliance",
  "Les Mills / Group Fitness",
  "Other",
  "Not currently registered",
];

const AVAILABILITY = ["Yes", "Limited availability", "No"];

const WORKING_FORMATS = [
  "Private studio",
  "Commercial facility",
  "Client home",
  "Outdoors",
  "Online",
  "Small group",
];

const ABOUT_LIMIT = 600;


export default function Page() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    area: "",
    website: "",
    instagram: "",
    experience: "",
    registration: "",
    registrationNumber: "",
    qualifications: "",
    insurance: "",
    acceptingClients: "",
    workingLocations: "",
    about: "",
    otherSpeciality: "",
  });
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const formRef = useRef<any>(null);

  const set = (k: string, val: any) => setForm((f) => ({ ...f, [k]: val }));

  const toggle = (list: string[], setList: any, value: string) =>
    setList((cur: string[]) => (cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value]));

  const track = (event: string) => {
    try {
      if (typeof window !== "undefined" && typeof (window as any).gtag === "function") (window as any).gtag("event", event);
    } catch (e) {}
  };

  const scrollToForm = () => {
    track("professional_apply_cta_clicked");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };


  async function onFile(e: any) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setErrors((x) => ({ ...x, photo: "" }));
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((x) => ({ ...x, photo: "Please upload a JPG, JPEG, PNG or WEBP image." }));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrors((x) => ({ ...x, photo: "Please upload an image under 8MB." }));
      return;
    }
    setPhotoUploading(true);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
      });
      if (!res.ok) throw new Error("upload failed");
      const data = await res.json();
      setPhotoUrl(data.url);
      setPhotoName(file.name);
    } catch (err) {
      setErrors((x) => ({ ...x, photo: "We could not upload your photograph. Please try again." }));
      track("professional_application_error");
    } finally {
      setPhotoUploading(false);
    }
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = "Please enter your full name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) next.email = "Please enter a valid email address.";
    const digits = form.phone.replace(/[^0-9]/g, "");
    if (digits.length < 8) next.phone = "Please enter a valid mobile number.";
    if (!form.city.trim()) next.city = "Please enter your city.";
    if (!form.website.trim() && !form.instagram.trim())
      next.website = "Please provide at least one professional link (website or Instagram).";
    if (!form.experience) next.experience = "Please select your years of experience.";
    if (!form.registration) next.registration = "Please select your registration body.";
    const needsNumber = form.registration && !["Other", "Not currently registered"].includes(form.registration);
    if (needsNumber && !form.registrationNumber.trim()) next.registrationNumber = "Please enter your registration number.";
    if (!form.insurance) next.insurance = "Please indicate your insurance status.";
    if (!form.acceptingClients) next.acceptingClients = "Please indicate your availability.";
    if (specialities.length === 0) next.specialities = "Please select at least one area of support.";
    if (specialities.includes("Other") && !form.otherSpeciality.trim())
      next.otherSpeciality = "Please describe your other area of support.";
    if (!form.about.trim()) next.about = "Please tell us who you do your best work with.";
    if (!consent) next.consent = "Please confirm and agree before submitting.";
    return next;
  }


  async function submit(e: any) {
    e.preventDefault();
    setFormError("");
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const firstKey = Object.keys(next)[0];
      const el = document.querySelector(`[data-field="${firstKey}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    track("professional_application_started");
    const specialityList = specialities.filter((s) => s !== "Other");
    if (specialities.includes("Other") && form.otherSpeciality.trim())
      specialityList.push(form.otherSpeciality.trim());
    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      area: form.area.trim(),
      website: form.website.trim(),
      instagram: form.instagram.trim(),
      experience: form.experience,
      registration: form.registration,
      registrationNumber: form.registrationNumber.trim(),
      qualifications: form.qualifications.trim(),
      insurance: form.insurance,
      acceptingClients: form.acceptingClients,
      workingLocations: form.workingLocations.trim(),
      workingFormats: formats,
      specialities: specialityList,
      otherSpeciality: form.otherSpeciality.trim(),
      about: form.about.trim(),
      photoUrl,
      consent,
      marketing,
      status: "New",
      source: "Curated Fit professional landing page",
      consentAt: new Date().toISOString(),
    };
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("submit failed");
      setDone(true);
      track("professional_application_submitted");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setFormError("We could not submit your application. Please check the highlighted fields and try again.");
      track("professional_application_error");
    } finally {
      setSubmitting(false);
    }
  }


  const serif = "var(--font-serif), Fraunces, Georgia, serif";
  const mono = "var(--font-mono), 'Space Mono', ui-monospace, monospace";
  const wrap = { maxWidth: 780, margin: "0 auto", padding: "0 24px" };
  const eyebrow = {
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#655F57",   
    marginBottom: 16,
  };
  const h1 = { fontFamily: serif, fontWeight: 300, letterSpacing: "0.005em", fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.12, color: "var(--ink)" };
  const h2 = { fontFamily: serif, fontWeight: 300, letterSpacing: "0.005em", fontSize: "clamp(24px, 3.4vw, 32px)", lineHeight: 1.18, color: "var(--ink)" };
  const h3 = { fontFamily: serif, fontWeight: 300, fontSize: 19, color: "var(--ink)", marginBottom: 8 };
  const body = { fontSize: 17, lineHeight: 1.7, color: "var(--muted)" };
  const sectionPad = { padding: "clamp(56px, 8vw, 88px) 0" };
  const divider = { height: 1, background: "var(--line)", border: 0 };
  const field = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 10,
    border: "1px solid var(--line)",
    background: "var(--field)",
    fontFamily: "inherit",
    fontSize: 15,
    color: "var(--ink)",
  };
  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--label)",
    marginBottom: 7,
  };
  const errStyle = { color: "#B4453C", fontSize: 13, marginTop: 6 };
  const pill = (active) => ({
    background: active ? "var(--ink)" : "transparent",
    color: active ? "#fff" : "var(--ink)",
    border: "1px solid " + (active ? "var(--ink)" : "var(--line)"),
    borderRadius: 999,
    padding: "9px 15px",
    fontFamily: "inherit",
    fontSize: 14,
    cursor: "pointer",
  });
  const cta = {
    display: "inline-block",
    background: "var(--ink)",
    color: "#fff",
    border: "none",
    borderRadius: 999,
    padding: "15px 30px",
    fontFamily: "inherit",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  };


  if (done) {
    return (
      <main>
        <nav style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px", maxWidth: 1080 }}>
          <img src="/logo.png" alt="Curated Fit" style={{ height: 64 }} />
        </nav>
        <section style={{ ...wrap, textAlign: "center", padding: "clamp(80px, 14vw, 160px) 24px" }}>
          <p style={eyebrow}>Curated Fit</p>
          <h1 style={h1}>Application received</h1>
          <p style={{ ...body, marginTop: 20 }}>
            Thank you for applying to Curated Fit. We review every application individually and will
            contact you within seven working days. If your experience and approach align with Curated Fit,
            the next step will be a short conversation before your profile is created.
          </p>
          <p style={{ ...body, marginTop: 16, fontSize: 15 }}>
            Please check that emails from Curated Fit are not directed to your junk folder.
          </p>
        </section>
        <footer style={{ borderTop: "1px solid var(--line)" }}>
          <div style={{ ...wrap, maxWidth: 1080, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", padding: "28px 24px", fontSize: 14, color: "var(--muted)" }}>
            <span>© {new Date().getFullYear()} Curated Fit · Founded in New Zealand</span>
            <span style={{ display: "flex", gap: 20 }}>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms</a>
              <a href="mailto:emma@curatedfit.co.nz">Contact</a>
            </span>
          </div>
        </footer>
      </main>
    );
  }


  return (
    <main>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px", maxWidth: 1080, margin: "0 auto" }}>
        <img src="/logo.png" alt="Curated Fit" style={{ height: 64 }} />
        <button type="button" onClick={scrollToForm} style={{ ...cta, padding: "10px 20px", fontSize: 14 }}>
          <span style={{ display: "none" }} className="cta-full">Apply to Curated Fit</span>
          <span>Apply to Curated Fit</span>
        </button>
      </nav>

      <section style={{ ...wrap, textAlign: "center", padding: "clamp(64px, 11vw, 120px) 24px 0" }}>
        <p style={eyebrow}>Applications now open</p>
        <h1 style={h1}>Selected professionals. Considered introductions.</h1>
        <p style={{ ...body, marginTop: 22, maxWidth: 620, marginLeft: "auto", marginRight: "auto" }}>
          Curated Fit is building a selected network of exercise professionals for women who want a more
          considered way to choose the right support. We are currently inviting Auckland professionals to
          apply ahead of launch.
        </p>
        <div style={{ marginTop: 30 }}>
          <button type="button" onClick={scrollToForm} style={cta}>Apply to Curated Fit</button>
        </div>
      </section>

      <section style={sectionPad}>
        <div style={wrap}>
          <h2 style={h2}>A more considered professional network</h2>
          <p style={{ ...body, marginTop: 18 }}>
            Curated Fit helps you reach the clients your work is genuinely built for — including women who may never have had the confidence, information or motivation to seek professional support. By creating alignment before the first conversation, we make introductions that are more likely to become lasting, meaningful working relationships. We manage the marketing and matching, so you can focus on what you do best.
          </p>
        </div>
      </section>

      <hr style={divider} />

      <section style={sectionPad}>
        <div style={wrap}>
          <h2 style={h2}>Why Curated Fit</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px 48px", marginTop: 34 }}>
            <div>
              <h3 style={h3}>Professionally positioned</h3>
              <p style={body}>We create a considered Curated Fit profile that clearly explains who you work best with and how you support them.</p>
            </div>
            <div>
              <h3 style={h3}>Matched introductions</h3>
              <p style={body}>Introductions are based on the woman's goals, preferences, lifestyle, and stage of life, not advertising spend or paid ranking.</p>
            </div>
            <div>
              <h3 style={h3}>No launch fees</h3>
              <p style={body}>There is no joining fee or monthly listing fee during the launch stage.</p>
            </div>
            <div>
              <h3 style={h3}>A selected network</h3>
              <p style={body}>Applications are reviewed individually to protect the quality and credibility of the Curated Fit experience.</p>
            </div>
          </div>
        </div>
      </section>

      <hr style={divider} />


      <section style={sectionPad}>
        <div style={wrap}>
          <h2 style={h2}>What happens next</h2>
          <div style={{ marginTop: 30, display: "grid", gap: 26 }}>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
              <h3 style={h3}>Apply</h3>
              <p style={body}>Complete the initial Curated Fit application.</p>
            </div>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
              <h3 style={h3}>Review</h3>
              <p style={body}>Every application is considered individually.</p>
            </div>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
              <h3 style={h3}>Conversation</h3>
              <p style={body}>If shortlisted, we arrange a short conversation to understand your approach and who you work best with.</p>
            </div>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
              <h3 style={h3}>Profile</h3>
              <p style={body}>Approved professionals complete their matching information and receive a Curated Fit profile ahead of launch.</p>
            </div>
          </div>
        </div>
      </section>

      <hr style={divider} />

      <section style={sectionPad}>
        <div style={wrap}>
          <h2 style={h2}>How introductions work</h2>
          <p style={{ ...body, marginTop: 18 }}>
            Women first tell us about their goals, preferences, lifestyle, experience, and stage of life.
            Curated Fit then identifies suitable professionals based on fit. Professionals are not ranked by
            payment, popularity, or advertising spend. An introduction is an opportunity to connect, not an
            obligation for either party.
          </p>
        </div>
      </section>

      <hr style={divider} />


      <section style={sectionPad} ref={formRef} id="apply">
        <div style={wrap}>
          <h2 style={h2}>Apply to Curated Fit</h2>
          <p style={{ ...body, marginTop: 18 }}>
            This initial application helps us understand your experience, professional standing, and areas
            of support. We only ask for the information needed to decide whether to invite you to the next
            stage. More detailed matching and payment information will only be requested after approval.
          </p>

          <form onSubmit={submit} noValidate style={{ marginTop: 36, display: "grid", gap: 22 }}>
            <fieldset style={{ border: 0, display: "grid", gap: 18 }}>
              <legend style={{ ...eyebrow, marginBottom: 4 }}>Contact details</legend>

              <div data-field="fullName">
                <label htmlFor="fullName" style={labelStyle}>Full name <span style={{ color: "var(--muted)" }}>*</span></label>
                <input id="fullName" type="text" style={field} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} autoComplete="name" />
                {errors.fullName && <p style={errStyle} role="alert">{errors.fullName}</p>}
              </div>

              <div data-field="email">
                <label htmlFor="email" style={labelStyle}>Email address <span style={{ color: "var(--muted)" }}>*</span></label>
                <input id="email" type="email" style={field} value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
                {errors.email && <p style={errStyle} role="alert">{errors.email}</p>}
              </div>

              <div data-field="phone">
                <label htmlFor="phone" style={labelStyle}>Mobile number <span style={{ color: "var(--muted)" }}>*</span></label>
                <input id="phone" type="tel" style={field} value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
                {errors.phone && <p style={errStyle} role="alert">{errors.phone}</p>}
              </div>

              <div data-field="city">
                <label htmlFor="city" style={labelStyle}>City <span style={{ color: "var(--muted)" }}>*</span></label>
                <input id="city" type="text" style={field} value={form.city} onChange={(e) => set("city", e.target.value)} />
                {errors.city && <p style={errStyle} role="alert">{errors.city}</p>}
              </div>

              <div data-field="area">
                <label htmlFor="area" style={labelStyle}>Auckland area or suburb</label>
                <input id="area" type="text" style={field} value={form.area} onChange={(e) => set("area", e.target.value)} />
                {errors.area && <p style={errStyle} role="alert">{errors.area}</p>}
              </div>

              <div data-field="website">
                <label htmlFor="website" style={labelStyle}>Website</label>
                <input id="website" type="url" style={field} value={form.website} onChange={(e) => set("website", e.target.value)} />
                {errors.website && <p style={errStyle} role="alert">{errors.website}</p>}
              </div>

              <div data-field="instagram">
                <label htmlFor="instagram" style={labelStyle}>Instagram or professional social profile</label>
                <input id="instagram" type="text" style={field} value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
                {errors.instagram && <p style={errStyle} role="alert">{errors.instagram}</p>}
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: -4 }}>Please provide at least one professional link (website or Instagram).</p>
            </fieldset>


            <fieldset style={{ border: 0, display: "grid", gap: 18 }}>
              <legend style={{ ...eyebrow, marginBottom: 4 }}>Professional details</legend>

              <div data-field="experience">
                <label htmlFor="experience" style={labelStyle}>Years of professional experience <span style={{ color: "var(--muted)" }}>*</span></label>
                <select id="experience" style={field} value={form.experience} onChange={(e) => set("experience", e.target.value)}>
                  <option value="">Select…</option>
                  {EXPERIENCE.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {errors.experience && <p style={errStyle} role="alert">{errors.experience}</p>}
              </div>

              <div data-field="registration">
                <label htmlFor="registration" style={labelStyle}>Current registration body <span style={{ color: "var(--muted)" }}>*</span></label>
                <select id="registration" style={field} value={form.registration} onChange={(e) => set("registration", e.target.value)}>
                  <option value="">Select…</option>
                  {REGISTRATION.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {errors.registration && <p style={errStyle} role="alert">{errors.registration}</p>}
              </div>
              {form.registration && !["Other", "Not currently registered"].includes(form.registration) && (
                <div data-field="registrationNumber">
                  <label htmlFor="registrationNumber" style={labelStyle}>Registration number <span style={{ color: "var(--muted)" }}>*</span></label>
                  <input id="registrationNumber" type="text" style={field} value={form.registrationNumber} onChange={(e) => set("registrationNumber", e.target.value)} />
                  {errors.registrationNumber && <p style={errStyle} role="alert">{errors.registrationNumber}</p>}
                </div>
              )}
              <div data-field="qualifications">
                <label htmlFor="qualifications" style={labelStyle}>Main qualifications</label>
                <input id="qualifications" type="text" style={field} value={form.qualifications} onChange={(e) => set("qualifications", e.target.value)} />
              </div>
              <div data-field="insurance">
                <label style={labelStyle}>Current professional liability insurance <span style={{ color: "var(--muted)" }}>*</span></label>
                <div style={{ display: "flex", gap: 10 }}>
                  {["Yes", "No"].map((o) => (
                    <button key={o} type="button" style={pill(form.insurance === o)} onClick={() => set("insurance", o)} aria-pressed={form.insurance === o}>{o}</button>
                  ))}
                </div>
                {errors.insurance && <p style={errStyle} role="alert">{errors.insurance}</p>}
              </div>

              <div data-field="acceptingClients">
                <label htmlFor="acceptingClients" style={labelStyle}>Currently accepting new clients <span style={{ color: "var(--muted)" }}>*</span></label>
                <select id="acceptingClients" style={field} value={form.acceptingClients} onChange={(e) => set("acceptingClients", e.target.value)}>
                  <option value="">Select…</option>
                  {AVAILABILITY.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {errors.acceptingClients && <p style={errStyle} role="alert">{errors.acceptingClients}</p>}
              </div>
              <div data-field="workingLocations">
                <label htmlFor="workingLocations" style={labelStyle}>Primary working locations</label>
                <input id="workingLocations" type="text" style={field} value={form.workingLocations} onChange={(e) => set("workingLocations", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Working format</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {WORKING_FORMATS.map((o) => (
                    <button key={o} type="button" style={pill(formats.includes(o))} onClick={() => toggle(formats, setFormats, o)} aria-pressed={formats.includes(o)}>{o}</button>
                  ))}
                </div>
              </div>
            </fieldset>


            <fieldset style={{ border: 0, display: "grid", gap: 18 }}>
              <legend style={{ ...eyebrow, marginBottom: 4 }}>Areas of support</legend>
              <div data-field="specialities">
                <label style={labelStyle}>Main areas of support <span style={{ color: "var(--muted)" }}>*</span></label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {SPECIALITIES.map((s) => (
                    <button key={s} type="button" style={pill(specialities.includes(s))} onClick={() => toggle(specialities, setSpecialities, s)} aria-pressed={specialities.includes(s)}>{s}</button>
                  ))}
                </div>
                {errors.specialities && <p style={errStyle} role="alert">{errors.specialities}</p>}
              </div>
              {specialities.includes("Other") && (
                <div data-field="otherSpeciality">
                  <label htmlFor="otherSpeciality" style={labelStyle}>Please describe your other area of support</label>
                  <input id="otherSpeciality" type="text" style={field} value={form.otherSpeciality} onChange={(e) => set("otherSpeciality", e.target.value)} />
                  {errors.otherSpeciality && <p style={errStyle} role="alert">{errors.otherSpeciality}</p>}
                </div>
              )}
              <div data-field="about">
                <label htmlFor="about" style={labelStyle}>Who do you do your best work with? <span style={{ color: "var(--muted)" }}>*</span></label>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Briefly describe the clients you are best suited to support, your approach, and what makes a professional introduction appropriate.</p>
                <textarea id="about" rows={5} maxLength={ABOUT_LIMIT} style={{ ...field, resize: "vertical" }} value={form.about} onChange={(e) => set("about", e.target.value)} />
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, textAlign: "right" }}>{form.about.length} / {ABOUT_LIMIT}</p>
                {errors.about && <p style={errStyle} role="alert">{errors.about}</p>}
              </div>
            </fieldset>


            <fieldset style={{ border: 0, display: "grid", gap: 18 }}>
              <legend style={{ ...eyebrow, marginBottom: 4 }}>Professional headshot</legend>
              <div data-field="photo">
                <label htmlFor="photo" style={labelStyle}>Professional headshot</label>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Upload a recent head-and-shoulders photograph with a clean, uncluttered background. The image should clearly show your face and be suitable for a professional Curated Fit profile.</p>
                <input id="photo" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={onFile} style={{ fontFamily: "inherit", fontSize: 14 }} />
                {photoUploading && <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>Uploading…</p>}
                {photoName && !photoUploading && <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>Uploaded: {photoName}</p>}
                {errors.photo && <p style={errStyle} role="alert">{errors.photo}</p>}
              </div>
            </fieldset>

            <div data-field="consent" style={{ display: "grid", gap: 12, padding: "20px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
              <label style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 14, color: "var(--ink)", cursor: "pointer" }}>
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3 }} />
                <span>I confirm that the information provided is accurate and agree to Curated Fit reviewing and storing it for the purpose of assessing my application. See our <a href="/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</a>.</span>
              </label>
              {errors.consent && <p style={errStyle} role="alert">{errors.consent}</p>}
              <label style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 14, color: "var(--muted)", cursor: "pointer" }}>
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} style={{ marginTop: 3 }} />
                <span>Keep me updated with Curated Fit launch news (optional).</span>
              </label>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", fontSize: 13, color: "var(--muted)" }}>
              <span>Individually reviewed applications</span>
              <span>·</span>
              <span>Selected professionals only</span>
              <span>·</span>
              <span>No paid rankings</span>
              <span>·</span>
              <span>Founded in New Zealand</span>
            </div>

            {formError && <p style={{ ...errStyle, fontSize: 15 }} role="alert">{formError}</p>}

            <div>
              <button type="submit" disabled={submitting || photoUploading} style={{ ...cta, opacity: submitting || photoUploading ? 0.6 : 1 }}>
                {submitting ? "Submitting…" : "Apply to Curated Fit"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <hr style={divider} />


      <section style={sectionPad}>
        <div style={wrap}>
          <h2 style={h2}>Questions</h2>
          <div style={{ marginTop: 24 }}>
            <details style={{ borderTop: "1px solid var(--line)", padding: "18px 0" }}>
              <summary style={{ cursor: "pointer", fontFamily: serif, fontWeight: 500, fontSize: 18, color: "var(--ink)", listStyle: "none" }}>Is there a joining fee?</summary>
              <p style={{ ...body, marginTop: 12 }}>No, it's free to apply and be listed with Curated Fit</p>
            </details>
            <details style={{ borderTop: "1px solid var(--line)", padding: "18px 0" }}>
              <summary style={{ cursor: "pointer", fontFamily: serif, fontWeight: 500, fontSize: 18, color: "var(--ink)", listStyle: "none" }}>How are professionals selected?</summary>
              <p style={{ ...body, marginTop: 12 }}>Applications are reviewed individually against Curated Fit's professional, experience, service, and brand standards. Registration alone does not guarantee acceptance.</p>
            </details>
            <details style={{ borderTop: "1px solid var(--line)", padding: "18px 0" }}>
              <summary style={{ cursor: "pointer", fontFamily: serif, fontWeight: 500, fontSize: 18, color: "var(--ink)", listStyle: "none" }}>How do introductions work?</summary>
              <p style={{ ...body, marginTop: 12 }}>Introductions are based on the woman's goals, preferences, location, lifestyle, experience, and stage of life. Curated Fit does not sell ranking positions or prioritise professionals based on advertising spend.</p>
            </details>
            <details style={{ borderTop: "1px solid var(--line)", padding: "18px 0" }}>
              <summary style={{ cursor: "pointer", fontFamily: serif, fontWeight: 500, fontSize: 18, color: "var(--ink)", listStyle: "none" }}>Can I decline an introduction?</summary>
              <p style={{ ...body, marginTop: 12 }}>Yes. An introduction should be appropriate for both the woman and the professional. You can decline when your capacity, location, scope, or experience is not the right fit.</p>
            </details>
            <details style={{ borderTop: "1px solid var(--line)", padding: "18px 0" }}>
              <summary style={{ cursor: "pointer", fontFamily: serif, fontWeight: 500, fontSize: 18, color: "var(--ink)", listStyle: "none" }}>Do I need to work exclusively with Curated Fit?</summary>
              <p style={{ ...body, marginTop: 12 }}>No. Curated Fit does not require professional exclusivity.</p>
            </details>
            <details style={{ borderTop: "1px solid var(--line)", padding: "18px 0" }}>
              <summary style={{ cursor: "pointer", fontFamily: serif, fontWeight: 500, fontSize: 18, color: "var(--ink)", listStyle: "none" }}>When will Curated Fit launch?</summary>
              <p style={{ ...body, marginTop: 12 }}>Curated Fit is currently building its first Auckland professional network ahead of the public launch. Approved professionals will receive launch updates and will be asked to reconfirm their availability before matching begins.</p>
            </details>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", padding: "28px 24px", fontSize: 14, color: "var(--muted)" }}>
          <span>© {new Date().getFullYear()} Curated Fit · Founded in New Zealand</span>
          <span style={{ display: "flex", gap: 20 }}>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms</a>
            <a href="mailto:emma@curatedfit.co.nz">Contact</a>
          </span>
        </div>
      </footer>
    </main>
  );
}
