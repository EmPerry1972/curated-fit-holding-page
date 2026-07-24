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
  const mono = "var(--font-mono), 'Space Mono', ui-monospace, monospace"; const sans = "var(--font-sans)";
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
  const h2 = { fontFamily: serif, fontWeight: 400, letterSpacing: "0.005em", fontSize: "clamp(24px, 3.4vw, 32px)", lineHeight: 1.18, color: "var(--ink)" };
  const h3 = { fontFamily: serif, fontWeight: 300, fontSize: 19, color: "var(--ink)", marginBottom: 8 };
  const body = { fontFamily: sans, fontSize: 17, lineHeight: 1.7, color: "var(--muted)", textAlign: "left" as const };
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
  const labelStyle = { display: "block", fontFamily: sans, fontSize: 12, fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--label)", marginBottom: 7 };
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
              <a href="mailto:welcome@curatedfit.co.nz">Contact</a>
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
          Curated Fit introduces you to women who are ready to find an exercise professional, including many who would never have walked into a gym to find you. We understand each woman first: her goals, her confidence, how she wants to exercise and the kind of professional she'll respond to. Then we introduce her to someone genuinely suited to help. We're currently inviting Auckland professionals to apply ahead of launch.
        </p>
        <div style={{ marginTop: 30 }}>
          <button type="button" onClick={scrollToForm} style={cta}>Apply to Curated Fit</button>
        </div>
      </section>

      <section style={sectionPad}>
        <div style={wrap}>
          <h2 style={h2}>A more considered professional network</h2>
          <p style={{ ...body, marginTop: 18 }}>
            Curated Fit helps you reach the clients your work is genuinely built for, including women who may never have had the confidence, information or motivation to seek professional support. By creating alignment before the first conversation, we make introductions that are more likely to become lasting, meaningful working relationships. We manage the marketing and matching, so you can focus on what you do best. </p> </div> </section> <hr style={divider} /> <section style={sectionPad}> <div style={wrap}> <h2 style={h2}>Who you'll be introduced to</h2> <p style={{ ...body, marginTop: 18 }}> She's active in everyday life, walking, gardening, golf, but often isn't doing the strength work needed to maintain muscle as she ages. Strength can sound like heavy weights and unfamiliar equipment, and she may feel unsure where to start or worried about injury. Curated Fit gives her a clearer way in, and introduces her to a professional who suits how she wants to exercise. Knowing this before the first conversation means you meet clients who are ready, informed and a genuine fit for your expertise. </p> </div> </section> <hr style={divider} /> <section style={sectionPad}> <div style={wrap}> <h2 style={h2}>Why Curated Fit</h2> <div style={{ display: "grid", gap: 28, marginTop: 34, maxWidth: 640 }}>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
              <h3 style={h3}>Professionally positioned</h3>
              <p style={body}>Not a listing. A considered profile that explains who you work best with, how you support them, and why an introduction makes sense.</p>
            </div>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
              <h3 style={h3}>Matched introductions</h3>
              <p style={body}>Introductions are based on each woman's goals, lifestyle and stage of life, so the fit is real before the first conversation.</p>
            </div>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
              <h3 style={h3}>Selected on merit</h3>
              <p style={body}>You're here because your work fits, not for any other reason.</p>
            </div>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
              <h3 style={h3}>A selected network</h3>
              <p style={body}>Every application is reviewed individually. A smaller, considered network protects the quality and credibility of every introduction.</p>
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
            Curated Fit then identifies suitable professionals based on fit. Professionals are not ranked or promoted ahead of one another; suitability is the only factor. An introduction is an opportunity to connect, not an
            obligation for either party.
          </p>
        </div>
      </section>

      <hr style={divider} />

      <section style={sectionPad}>
        <div style={wrap}>
          <h2 style={h2}>A considered approach</h2>
          <div style={{ marginTop: 30, display: "grid", gap: 26 }}>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
              <h3 style={h3}>Three professionals. Not thirty.</h3>
              <p style={body}>Not an open list. You answer a few considered questions and meet three exercise professionals matched to how you think, not only what you want to achieve, reviewed one at a time.</p>
            </div>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
              <h3 style={h3}>One standard, applied to people</h3>
              <p style={body}>If a professional would not clear the same bar as an ingredient, they do not get listed. Every professional is vetted before they appear, and ranked on how well they suit you, never on who paid to appear.</p>
            </div>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
              <h3 style={h3}>Warm, qualified matches</h3>
              <p style={body}>When it is a mutual fit, we introduce you. Professionals receive warm introductions from women who already suit how they work, a considered start for both sides.</p>
            </div>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
              <h3 style={h3}>One ecosystem, one standard</h3>
              <p style={body}>Curated Fit extends the trust of Curated Wellness into finding the right exercise support. The same surfaces, the same light, the same restraint, across the whole ecosystem.</p>
            </div>
          </div>
        </div>
      </section>

      <hr style={divider} />


      <section style={sectionPad} ref={formRef} id="apply">
        <div style={wrap}>
          <h2 style={h2}>Apply to Curated Fit</h2>
          <p style={{ ...body, marginTop: 18 }}>
            Submit this initial application for review. Once approved, we will work with you to develop your Curated Fit profile, understand how you work, and make sure you are represented accurately.
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
              <span>No ranking, only fit</span>
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
              <summary style={{ cursor: "pointer", fontFamily: serif, fontWeight: 500, fontSize: 18, color: "var(--ink)", listStyle: "none" }}>How do I become part of Curated Fit?</summary>
              <p style={{ ...body, marginTop: 12 }}>Submit an initial application. If your work fits, we invite you to a short conversation and then help you build your Curated Fit profile.</p>
            </details>
            <details style={{ borderTop: "1px solid var(--line)", padding: "18px 0" }}>
              <summary style={{ cursor: "pointer", fontFamily: serif, fontWeight: 500, fontSize: 18, color: "var(--ink)", listStyle: "none" }}>How are professionals selected?</summary>
              <p style={{ ...body, marginTop: 12 }}>Applications are reviewed individually against Curated Fit's professional, experience, service, and brand standards. Registration alone does not guarantee acceptance.</p>
            </details>
            <details style={{ borderTop: "1px solid var(--line)", padding: "18px 0" }}>
              <summary style={{ cursor: "pointer", fontFamily: serif, fontWeight: 500, fontSize: 18, color: "var(--ink)", listStyle: "none" }}>How do introductions work?</summary>
              <p style={{ ...body, marginTop: 12 }}>Introductions are based on the woman's goals, preferences, location, lifestyle, experience, and stage of life. Curated Fit does not rank professionals or prioritise anyone; introductions are made purely on fit.</p>
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
            <a href="mailto:welcome@curatedfit.co.nz">Contact</a>
          </span>
        </div>
      </footer>
    </main>
  );
}
