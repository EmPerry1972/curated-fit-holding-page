const option = (id, label, extra = {}) => ({ id, label, ...extra });

export const REQUIRED_STAGING_BASE_ID = "apphwcmdSVSl7H0iR";

export const EXPERTISE_OPTIONS = [
  option("OUT-01", "Building strength and maintaining muscle", { category: "Outcome", safetySensitive: false }),
  option("OUT-02", "Improving energy and stamina", { category: "Outcome", safetySensitive: false }),
  option("OUT-03", "Establishing a consistent exercise routine", { category: "Outcome", safetySensitive: false }),
  option("OUT-04", "Building confidence with exercise", { category: "Outcome", safetySensitive: false }),
  option("OUT-05", "Improving balance, stability and everyday movement", { category: "Outcome", safetySensitive: false }),
  option("OUT-06", "Returning to regular exercise after time away", { category: "Outcome", safetySensitive: false }),
  option("CON-01", "Perimenopause or menopause", { category: "Consideration", safetySensitive: false }),
  option("CON-02", "Injury, ongoing pain or returning after surgery", { category: "Consideration", safetySensitive: true }),
  option("CON-03", "Bone health, balance or stability", { category: "Consideration", safetySensitive: true }),
  option("CON-04", "A health condition that affects exercise", { category: "Consideration", safetySensitive: true }),
  option("CON-05", "Pelvic health considerations", { category: "Consideration", safetySensitive: true }),
  option("CON-06", "Weight change or weight-loss medication", { category: "Consideration", safetySensitive: true }),
];

export const EXERCISE_STAGES = [
  option("STG-01", "I exercise regularly and would like more focused support."),
  option("STG-02", "I exercise sometimes and would like greater consistency."),
  option("STG-03", "Most of my activity comes from walking, golf, gardening or everyday life."),
  option("STG-04", "I am returning after some time away."),
  option("STG-05", "Regular exercise would be new for me."),
  option("STG-06", "I’m not sure how to describe where I am at the moment."),
];

export const SUPPORT_STYLES = [
  option("STY-01", "Gentle, patient and reassuring"),
  option("STY-02", "Structured, with clear plans and expectations"),
  option("STY-03", "Encouraging, with regular motivation"),
  option("STY-04", "Direct, challenging and progress-focused"),
  option("STY-05", "Educational, explaining what we are doing and why"),
  option("STY-06", "Flexible, adapting sessions to how the client is feeling"),
];

export const SETTINGS = [
  option("SET-01", "At the client’s home"),
  option("SET-02", "At my private studio"),
  option("SET-03", "At a shared studio"),
  option("SET-04", "At a commercial gym"),
  option("SET-05", "Outdoors"),
  option("SET-06", "Online"),
];

export const SERVICE_AREAS = [option("AREA-ONLINE", "Online")];

export const PROFESSIONAL_ROLES = [
  "Personal trainer",
  "Strength and conditioning coach",
  "Pilates instructor",
  "Yoga instructor",
  "Exercise physiologist",
  "Physiotherapist",
  "Other",
];

export const INSURANCE_CONFIRMATIONS = ["Yes", "No"];
export const QUALIFICATION_COMPLETION_STATUSES = ["Completed", "Currently studying", "Prefer to discuss"];
export const CLIENT_WORK_MODES = ["Clients can come to me", "I can travel to clients", "I work with clients online"];
export const ALL_CLIENT_WORK_MODES = "All of the above";
export const AVAILABILITY_OPTIONS = [
  "Yes",
  "Yes, with limited availability",
  "Not currently, but I am accepting waitlist enquiries",
  "Not currently and not accepting waitlist enquiries",
];
export const PROFESSIONAL_GENDERS = ["Woman", "Man", "Prefer not to say"];
export const CLIENT_GENDER_PREFERENCES = ["Woman", "Man", "No preference"];
export const EXPERIENCE_LEVELS = ["None", "Some", "Regular", "Substantial or specialist"];
export const EXPERIENCE_FACTORS = Object.freeze({
  None: 0,
  Some: 0.35,
  Regular: 0.75,
  "Substantial or specialist": 1,
});

export function qualificationYears(currentYear = new Date().getFullYear()) {
  return Array.from({ length: currentYear - 1949 }, (_, index) => String(currentYear - index));
}

export function normaliseClientWorkModes(values) {
  if (!Array.isArray(values) || !unique(values)) return null;
  if (values.includes(ALL_CLIENT_WORK_MODES)) return values.length === 1 ? [...CLIENT_WORK_MODES] : null;
  return hasOnly(values, CLIENT_WORK_MODES) && values.length > 0 ? [...values] : null;
}

export function isServiceAreaId(value) {
  return value === "AREA-ONLINE" || /^AREA-LINZ-\d+$/.test(value || "");
}

export const PROFESSIONAL_QUESTIONS = [
  { number: 1, id: "roles", title: "Professional roles", options: PROFESSIONAL_ROLES },
  { number: 2, id: "qualifications", title: "Qualifications, registration and insurance" },
  { number: 3, id: "availability", title: "Availability", options: AVAILABILITY_OPTIONS },
  { number: 4, id: "experiencedClientStages", title: "Which types of clients do you have the most experience supporting?", options: EXERCISE_STAGES, max: 3 },
  { number: 5, id: "expertise", title: "Tell us where your experience is strongest", options: EXPERTISE_OPTIONS },
  { number: 6, id: "workingSettings", title: "Working settings", options: SETTINGS },
  { number: 7, id: "locationAndTravel", title: "Where are you based?" },
  { number: 8, id: "supportStyles", title: "Support style", options: SUPPORT_STYLES, max: 2 },
  { number: 9, id: "gender", title: "Gender", options: PROFESSIONAL_GENDERS },
];

export const CLIENT_QUESTIONS = [
  { id: "selectedOutcomes", title: "What would you most like support with?", options: EXPERTISE_OPTIONS.filter((item) => item.category === "Outcome"), max: 2 },
  { id: "selectedConsiderations", title: "Is there anything you would like your professional to have particular experience with?", options: EXPERTISE_OPTIONS.filter((item) => item.category === "Consideration") },
  { id: "exerciseStage", title: "Which best describes exercise in your life at the moment?", options: EXERCISE_STAGES, max: 1 },
  { id: "preferredSettings", title: "Where would you feel most comfortable exercising?", options: SETTINGS, max: 2 },
  { id: "preferredSupportStyles", title: "What kind of support helps you respond well?", options: SUPPORT_STYLES, max: 2 },
  { id: "genderPreference", title: "Do you have a preference for who you work with?", options: CLIENT_GENDER_PREFERENCES, max: 1 },
];

const hasOnly = (values, allowed) => Array.isArray(values) && values.every((value) => allowed.includes(value));
const unique = (values) => new Set(values).size === values.length;

function validateMulti(errors, name, values, allowed, { min = 1, max } = {}) {
  if (!Array.isArray(values) || values.length < min) errors[name] = "Please choose an answer.";
  else if (!unique(values) || !hasOnly(values, allowed)) errors[name] = "One or more answers are not valid.";
  else if (max && values.length > max) errors[name] = `Choose no more than ${max}.`;
}

export function isValidInvitationToken(token) {
  return typeof token === "string" && /^[A-Za-z0-9_-]{43,128}$/.test(token);
}

export function validateProfessionalSubmission(data) {
  const errors = {};
  validateMulti(errors, "roles", data?.roles, PROFESSIONAL_ROLES);
  if (data?.roles?.includes("Other") && !data?.otherRole?.trim()) errors.otherRole = "Please describe your role.";
  if (!data?.matchingQualifications?.trim()) errors.matchingQualifications = "Add your qualification.";
  if (!data?.matchingTrainingProvider?.trim()) errors.matchingTrainingProvider = "Add the training provider.";
  if (!QUALIFICATION_COMPLETION_STATUSES.includes(data?.qualificationCompletionStatus)) errors.qualificationCompletionStatus = "Choose a qualification completion status.";
  if (data?.qualificationCompletionStatus === "Completed" && !qualificationYears().includes(String(data?.matchingQualificationYear || ""))) errors.matchingQualificationYear = "Choose the year your qualification was completed.";
  if (!INSURANCE_CONFIRMATIONS.includes(data?.matchingInsuranceConfirmation)) errors.matchingInsuranceConfirmation = "Choose Yes or No.";
  if (!AVAILABILITY_OPTIONS.includes(data?.structuredAvailability)) errors.structuredAvailability = "Choose an approved availability option.";
  validateMulti(errors, "experiencedClientStages", data?.experiencedClientStages, EXERCISE_STAGES.map(({ id }) => id), { max: 3 });

  const expertise = data?.expertise;
  if (!expertise || typeof expertise !== "object" || Array.isArray(expertise)) errors.expertise = "Complete all 12 expertise rows.";
  else {
    const submittedIds = Object.keys(expertise);
    const requiredIds = EXPERTISE_OPTIONS.map(({ id }) => id);
    if (submittedIds.length !== requiredIds.length || submittedIds.some((id) => !requiredIds.includes(id))) errors.expertise = "Complete all 12 expertise rows.";
    for (const id of requiredIds) {
      const row = expertise[id];
      if (!row || !EXPERIENCE_LEVELS.includes(row.submittedLevel)) errors[`expertise.${id}`] = "Choose an approved experience level.";
      if (row?.approximateClientsSupported !== "" && row?.approximateClientsSupported !== undefined) {
        const count = Number(row.approximateClientsSupported);
        if (!Number.isInteger(count) || count < 0) errors[`expertise.${id}.approximateClientsSupported`] = "Use a whole number of zero or more.";
      }
    }
  }

  validateMulti(errors, "workingSettings", data?.workingSettings, SETTINGS.map(({ id }) => id));
  const baseSuburb = data?.baseSuburb || "";
  if (data?.locationNotListed === true) {
    if (baseSuburb) errors.baseSuburb = "Clear the listed location when using a location that is not listed.";
    if (!data?.otherArea?.trim()) errors.otherArea = "Add your town, suburb or area.";
  } else if (!isServiceAreaId(baseSuburb)) errors.baseSuburb = "Choose a listed town or suburb, or select that your location is not listed.";
  const clientWorkModes = normaliseClientWorkModes(data?.clientWorkModes);
  if (!clientWorkModes) errors.clientWorkModes = "Choose how clients can work with you.";
  const travelAreas = data?.travelAreas || [];
  if (!Array.isArray(travelAreas) || !unique(travelAreas) || travelAreas.some((id) => !isServiceAreaId(id))) errors.travelAreas = "Choose only listed travel areas.";
  if (clientWorkModes && !clientWorkModes.includes("I can travel to clients") && travelAreas.length) errors.travelAreas = "Travel areas apply only when you travel to clients.";
  validateMulti(errors, "supportStyles", data?.supportStyles, SUPPORT_STYLES.map(({ id }) => id), { max: 2 });
  if (!PROFESSIONAL_GENDERS.includes(data?.gender)) errors.gender = "Choose an approved gender option.";
  return errors;
}

export function validateClientSubmission(data) {
  const errors = {};
  if (!data?.clientName?.trim()) errors.clientName = "Add the client name.";
  if (!/^\S+@\S+\.\S+$/.test(data?.email || "")) errors.email = "Add a valid email address.";
  validateMulti(errors, "selectedOutcomes", data?.selectedOutcomes, EXPERTISE_OPTIONS.filter((item) => item.category === "Outcome").map(({ id }) => id), { max: 2 });
  validateMulti(errors, "selectedConsiderations", data?.selectedConsiderations || [], EXPERTISE_OPTIONS.filter((item) => item.category === "Consideration").map(({ id }) => id), { min: 0 });
  if (!EXERCISE_STAGES.some(({ id }) => id === data?.exerciseStage)) errors.exerciseStage = "Choose one exercise stage.";
  validateMulti(errors, "preferredSettings", data?.preferredSettings, SETTINGS.map(({ id }) => id), { max: 2 });
  if (!SERVICE_AREAS.some(({ id }) => id === data?.suburb)) errors.suburb = "Choose a listed service area.";
  if (!data?.postcode?.trim()) errors.postcode = "Add the postcode.";
  validateMulti(errors, "preferredSupportStyles", data?.preferredSupportStyles, SUPPORT_STYLES.map(({ id }) => id), { max: 2 });
  if (!CLIENT_GENDER_PREFERENCES.includes(data?.genderPreference)) errors.genderPreference = "Choose an approved gender preference.";
  return errors;
}

export function factorsForSubmittedLevel(level) {
  const matchFactor = EXPERIENCE_FACTORS[level];
  if (matchFactor === undefined) throw new Error("Unsupported expertise level.");
  return {
    matchFactor,
    effectiveFactor: level === "Substantial or specialist" ? 0.75 : matchFactor,
  };
}
