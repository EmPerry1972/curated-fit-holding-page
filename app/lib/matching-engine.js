export const MATCHING_WEIGHTS = Object.freeze({
  outcome: 40,
  consideration: 30,
  stage: 15,
  style: 15,
});

const AVAILABILITY_PRIORITY = Object.freeze({ Available: 0, Limited: 1, Waitlist: 2, Closed: 3 });

const round = (number) => Math.round(number * 100) / 100;
const fieldsOf = (record) => record?.fields || {};
const linkedIds = (record, field) => {
  const value = fieldsOf(record)[field];
  return Array.isArray(value) ? value.map((item) => typeof item === "string" ? item : item?.id).filter(Boolean) : [];
};
const selected = (record, field) => {
  const value = fieldsOf(record)[field];
  return typeof value === "string" ? value : value?.name || "";
};
const checked = (record, field) => fieldsOf(record)[field] === true;
const intersects = (left, right) => left.some((item) => right.has(item));

// Maps each service-area linked-record id to its Region ID, so the location
// gate can compare by region rather than by exact area identity. Built from the
// existing service-areas table records — no professional/coach data is changed.
const buildRegionByAreaRecordId = (serviceAreas) =>
  new Map(
    (serviceAreas || [])
      .map((record) => [record.id, fieldsOf(record)["Region ID"]])
      .filter(([, regionId]) => Boolean(regionId))
  );
const regionsOf = (record, field, regionByAreaRecordId) =>
  new Set(
    linkedIds(record, field)
      .map((areaId) => regionByAreaRecordId.get(areaId))
      .filter(Boolean)
  );

export function availabilityOffer(value) {
  if (value === "Yes") return "Available";
  if (value === "Yes, with limited availability") return "Limited";
  if (value === "Not currently, but I am accepting waitlist enquiries") return "Waitlist";
  return "Closed";
}

export function assertDryRunConfiguration(configRecord) {
  if (!configRecord) throw new Error("Expected exactly one matching configuration record.");
  const fields = fieldsOf(configRecord);
  if (fields["Dry Run"] !== true) throw new Error("Dry Run must be checked.");
  if (fields["Internal Selection Enabled"] === true) throw new Error("Internal Selection Enabled must be unchecked.");
  const minimumScore = Number(fields["Minimum Match Score"]);
  const waitlistAdvantage = Number(fields["Waitlist Advantage Threshold"]);
  if (!Number.isFinite(minimumScore) || !Number.isFinite(waitlistAdvantage)) {
    throw new Error("Matching configuration scores are invalid.");
  }
  return { minimumScore, waitlistAdvantage };
}

function expertiseFactor(level) {
  if (level === "Some") return 0.35;
  if (level === "Regular") return 0.75;
  if (level === "Substantial or specialist") return 1;
  return 0;
}

export function buildProfessionalExpertise(expertiseRecords) {
  const byProfessional = new Map();
  for (const record of expertiseRecords || []) {
    const professionalId = linkedIds(record, "Professional")[0];
    const optionId = linkedIds(record, "Expertise Option")[0];
    if (!professionalId || !optionId) continue;
    const level = selected(record, "Submitted Level");
    const submitted = expertiseFactor(level);
    const evidenceStatus = selected(record, "Evidence Status");
    const effective = level === "Substantial or specialist" && !["Verified", "Adjusted"].includes(evidenceStatus)
      ? 0.75
      : submitted;
    if (!byProfessional.has(professionalId)) byProfessional.set(professionalId, new Map());
    byProfessional.get(professionalId).set(optionId, {
      submitted,
      effective,
      scopeApproved: checked(record, "Scope Approved"),
      level,
    });
  }
  return byProfessional;
}

function professionalBaseReasons(professional, expertise) {
  const reasons = [];
  if (selected(professional, "Questionnaire Status") !== "Completed") reasons.push("Questionnaire not completed");
  if (selected(professional, "Qualification Status") !== "Verified") reasons.push("Qualifications not verified");
  if (selected(professional, "Insurance Status") !== "Verified") reasons.push("Insurance not verified");
  if (!checked(professional, "Approved for Matching")) reasons.push("Not approved for matching");
  if (!selected(professional, "Structured Availability")) reasons.push("Availability missing");
  if (!linkedIds(professional, "Experienced Client Stages").length) reasons.push("Experienced client stages missing");
  if (!linkedIds(professional, "Working Settings").length) reasons.push("Working settings missing");
  if (!linkedIds(professional, "Support Styles").length) reasons.push("Support styles missing");
  if (!selected(professional, "Gender")) reasons.push("Gender response missing");
  if (!expertise?.size) reasons.push("Expertise responses missing");
  if (availabilityOffer(selected(professional, "Structured Availability")) === "Closed") {
    reasons.push("Not accepting clients or waitlist enquiries");
  }
  return reasons;
}

function validateClient(client, optionsByRecordId, onlineSettingId) {
  const reasons = [];
  const outcomes = linkedIds(client, "Selected Outcomes");
  const considerations = linkedIds(client, "Selected Considerations");
  const stages = linkedIds(client, "Exercise Stage");
  const settings = linkedIds(client, "Preferred Settings");
  const styles = linkedIds(client, "Preferred Support Styles");
  if (outcomes.length < 1 || outcomes.length > 2) reasons.push("Selected Outcomes must contain 1 or 2 choices");
  if (outcomes.some((id) => optionsByRecordId.get(id)?.category !== "Outcome")) {
    reasons.push("Selected Outcomes contains a non-outcome option");
  }
  if (considerations.some((id) => optionsByRecordId.get(id)?.category !== "Consideration")) {
    reasons.push("Selected Considerations contains a non-consideration option");
  }
  if (stages.length !== 1) reasons.push("Exercise Stage must contain exactly 1 choice");
  if (settings.length < 1 || settings.length > 2) reasons.push("Preferred Settings must contain 1 or 2 choices");
  if (styles.length < 1 || styles.length > 2) reasons.push("Preferred Support Styles must contain 1 or 2 choices");
  if (!selected(client, "Gender Preference")) reasons.push("Gender Preference missing");
  if (!settings.includes(onlineSettingId) && linkedIds(client, "Suburb").length !== 1) {
    reasons.push("Suburb required for non-online matching");
  }
  return reasons;
}

function categoryScore(optionIds, expertise) {
  if (!optionIds.length) return null;
  const total = optionIds.reduce((sum, id) => sum + (expertise?.get(id)?.effective || 0), 0);
  return round((total / optionIds.length) * 100);
}

function reasonForMatch(candidate) {
  const reasons = [];
  if (candidate.outcomeScore >= 75) reasons.push("strong relevant outcome experience");
  else if (candidate.outcomeScore > 0) reasons.push("some relevant outcome experience");
  if (candidate.considerationScore >= 75) reasons.push("strong experience with the selected considerations");
  else if (candidate.considerationScore > 0) reasons.push("some experience with the selected considerations");
  if (candidate.exerciseStageScore === 100) reasons.push("experience with this exercise stage");
  if (candidate.supportStyleScore === 100) reasons.push("full support-style alignment");
  else if (candidate.supportStyleScore > 0) reasons.push("partial support-style alignment");
  return reasons.length ? reasons.join("; ") : "limited scored alignment";
}

function scorePair({ client, professional, expertise, optionsByRecordId, onlineSettingId, homeSettingId, minimumScore, regionByAreaRecordId }) {
  const reasons = professionalBaseReasons(professional, expertise);
  const outcomes = linkedIds(client, "Selected Outcomes");
  const considerations = linkedIds(client, "Selected Considerations");
  const stages = linkedIds(client, "Exercise Stage");
  const clientSettings = linkedIds(client, "Preferred Settings");
  const clientStyles = linkedIds(client, "Preferred Support Styles");
  const professionalStages = new Set(linkedIds(professional, "Experienced Client Stages"));
  const professionalSettings = new Set(linkedIds(professional, "Working Settings"));
  const professionalStyles = new Set(linkedIds(professional, "Support Styles"));
  const offer = availabilityOffer(selected(professional, "Structured Availability"));

  if (!intersects(clientSettings, professionalSettings)) reasons.push("No compatible training setting");
  const onlineCompatible = clientSettings.includes(onlineSettingId) && professionalSettings.has(onlineSettingId);
  if (!onlineCompatible) {
    // Region-level match: eligible when the client's suburb region matches the
    // region of the professional's base suburb or any travel area. This replaces
    // exact area-identity matching, which both accepted distant same-name suburbs
    // and rejected genuinely nearby same-region suburbs.
    const clientRegions = regionsOf(client, "Suburb", regionByAreaRecordId);
    const professionalRegions = new Set([
      ...regionsOf(professional, "Base Suburb", regionByAreaRecordId),
      ...regionsOf(professional, "Travel Areas", regionByAreaRecordId),
    ]);
    const locationMatches =
      clientRegions.size > 0 &&
      [...clientRegions].some((regionId) => professionalRegions.has(regionId));
    if (!locationMatches) reasons.push("No compatible service area");
    if (clientSettings.includes(homeSettingId) && professionalSettings.has(homeSettingId) && !checked(professional, "Travels To Clients")) {
      reasons.push("Home training selected but professional does not travel to clients");
    }
  }
  const genderPreference = selected(client, "Gender Preference");
  if (genderPreference !== "No preference" && genderPreference !== selected(professional, "Gender")) {
    reasons.push("Gender preference not met");
  }
  for (const optionId of considerations) {
    const option = optionsByRecordId.get(optionId);
    const professionalOption = expertise?.get(optionId);
    if (option?.safetySensitive && (!professionalOption || professionalOption.effective <= 0 || !professionalOption.scopeApproved)) {
      reasons.push(`Safety scope not approved for ${option.name}`);
    }
  }

  const outcomeScore = categoryScore(outcomes, expertise) || 0;
  const considerationScore = categoryScore(considerations, expertise) || 0;
  const exerciseStageScore = stages.length && professionalStages.has(stages[0]) ? 100 : 0;
  const supportStyleHits = clientStyles.filter((id) => professionalStyles.has(id)).length;
  const supportStyleScore = clientStyles.length ? round((supportStyleHits / clientStyles.length) * 100) : 0;
  const applicableWeight = MATCHING_WEIGHTS.outcome + MATCHING_WEIGHTS.stage + MATCHING_WEIGHTS.style
    + (considerations.length ? MATCHING_WEIGHTS.consideration : 0);
  const weighted = outcomeScore * MATCHING_WEIGHTS.outcome
    + considerationScore * MATCHING_WEIGHTS.consideration
    + exerciseStageScore * MATCHING_WEIGHTS.stage
    + supportStyleScore * MATCHING_WEIGHTS.style;
  const normalisedScore = round(weighted / applicableWeight);
  const scoreBand = normalisedScore >= 80 ? "Strong" : normalisedScore >= minimumScore ? "Possible" : "Weak";
  const candidate = {
    clientId: client.id,
    professionalId: professional.id,
    eligibilityReasons: reasons,
    eligible: reasons.length === 0,
    outcomeScore,
    considerationScore,
    exerciseStageScore,
    supportStyleScore,
    applicableWeight,
    normalisedScore,
    scoreBand,
    availabilityOffer: offer,
    suggestedRank: 0,
    dryRunResult: false,
    selectionReason: "",
    internalFollowUpAction: "None",
  };
  candidate.reasonForMatch = reasonForMatch(candidate);
  return candidate;
}

function comparator(waitlistAdvantage) {
  return (left, right) => {
    const difference = right.normalisedScore - left.normalisedScore;
    if (Math.abs(difference) >= waitlistAdvantage) return difference;
    const availabilityDifference = AVAILABILITY_PRIORITY[left.availabilityOffer] - AVAILABILITY_PRIORITY[right.availabilityOffer];
    if (availabilityDifference) return availabilityDifference;
    if (difference) return difference;
    return left.professionalId.localeCompare(right.professionalId);
  };
}

export function calculateDryRunMatches({
  client,
  professionals,
  expertiseRecords,
  expertiseOptions,
  onlineSettingId,
  homeSettingId,
  configRecord,
  serviceAreas,
}) {
  const { minimumScore, waitlistAdvantage } = assertDryRunConfiguration(configRecord);
  if (!onlineSettingId || !homeSettingId) throw new Error("Required setting options are missing.");
  const optionsByRecordId = new Map((expertiseOptions || []).map((record) => [record.id, {
    name: fieldsOf(record)["Option Name"] || "selected consideration",
    category: selected(record, "Category"),
    safetySensitive: checked(record, "Safety-sensitive"),
  }]));
  const clientIssues = validateClient(client, optionsByRecordId, onlineSettingId);
  if (clientIssues.length) return { candidates: [], clientIssues };
  const expertiseByProfessional = buildProfessionalExpertise(expertiseRecords);
  const regionByAreaRecordId = buildRegionByAreaRecordId(serviceAreas);
  const candidates = (professionals || []).map((professional) => scorePair({
    client,
    professional,
    expertise: expertiseByProfessional.get(professional.id),
    optionsByRecordId,
    onlineSettingId,
    homeSettingId,
    minimumScore,
    regionByAreaRecordId,
  }));
  const ranked = candidates.filter((candidate) => candidate.eligible && candidate.normalisedScore >= minimumScore)
    .sort(comparator(waitlistAdvantage));
  ranked.forEach((candidate, index) => { candidate.suggestedRank = index + 1; });
  const selectedCandidates = ranked.slice(0, 3);
  for (const candidate of candidates) {
    candidate.dryRunResult = selectedCandidates.includes(candidate);
    if (!candidate.dryRunResult) continue;
    if (candidate.availabilityOffer === "Waitlist") {
      const bestAvailable = ranked.find((item) => ["Available", "Limited"].includes(item.availabilityOffer));
      candidate.selectionReason = bestAvailable && candidate.normalisedScore >= bestAvailable.normalisedScore + waitlistAdvantage
        ? "Waitlist advantage"
        : "Waitlist fill";
      candidate.internalFollowUpAction = "Join waitlist";
    } else {
      candidate.selectionReason = "Top available";
    }
  }
  for (const candidate of candidates) {
    if (candidate.availabilityOffer !== "Waitlist" || candidate.dryRunResult) continue;
    const replacements = selectedCandidates.filter((item) => ["Available", "Limited"].includes(item.availabilityOffer))
      .sort(comparator(waitlistAdvantage));
    const replacement = replacements[0];
    if (replacement && replacement.normalisedScore + waitlistAdvantage >= candidate.normalisedScore) {
      candidate.replacedByMatchId = `${replacement.clientId}::${replacement.professionalId}`;
      candidate.internalFollowUpAction = "Show another available match";
    }
  }
  return { candidates, clientIssues: [] };
}

export function matchResultFields(candidate, calculatedAt) {
  return {
    "Match ID": `${candidate.clientId}::${candidate.professionalId}`,
    Client: [candidate.clientId],
    Professional: [candidate.professionalId],
    "Eligibility Status": candidate.eligible ? "Eligible" : "Ineligible",
    "Eligibility Reasons": candidate.eligibilityReasons.join("\n"),
    "Outcome Score": candidate.outcomeScore,
    "Consideration Score": candidate.considerationScore,
    "Exercise-stage Score": candidate.exerciseStageScore,
    "Support-style Score": candidate.supportStyleScore,
    "Applicable Weight": candidate.applicableWeight,
    "Normalised Score": candidate.normalisedScore,
    "Score Band": candidate.scoreBand,
    "Availability Offer": candidate.availabilityOffer,
    "Suggested Rank": candidate.suggestedRank,
    "Auto-selected": false,
    "Selection Reason": candidate.selectionReason || null,
    "Internal Follow-up Action": candidate.internalFollowUpAction,
    "Replaced By": [],
    "Reason for Match": candidate.reasonForMatch,
    "Selected Internally": false,
    "Dry Run Result": candidate.dryRunResult,
    "Last Calculated At": calculatedAt.toISOString(),
  };
}
