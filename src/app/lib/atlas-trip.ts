export type AtlasEnergy = "Easygoing" | "Balanced" | "High-energy";

export type AtlasTripStyle =
  | "Relaxed"
  | "Adventure"
  | "Luxury"
  | "Romantic"
  | "Family"
  | "Food-focused"
  | "Culture-first"
  | "Spontaneous";

export type AtlasGemPreference = "Hidden gems" | "Mix of both" | "Top spots";
export type AtlasTravelPace = "Planner" | "Flexible" | "Spontaneous";

export type AtlasInterest =
  | "Food"
  | "Nature"
  | "Nightlife"
  | "Family"
  | "Romance"
  | "Culture"
  | "Wellness"
  | "Scenic drives";

export type AtlasTripFormData = {
  destination: string;
  duration: string;
  budget: string;
  travelers: string;
  energyLevel: AtlasEnergy;
  tripStyle: AtlasTripStyle;
  gemsPreference: AtlasGemPreference;
  travelPace: AtlasTravelPace;
  interests: AtlasInterest[];
};

export const ATLAS_BUILD_STORAGE_KEY = "atlas-build-form";
export const ATLAS_BUILD_PREFILL_STORAGE_KEY = "atlas-build-prefill";

export const defaultAtlasTripForm: AtlasTripFormData = {
  destination: "",
  duration: "4 days",
  budget: "$2,000 - $4,000",
  travelers: "Couple",
  energyLevel: "Balanced",
  tripStyle: "Adventure",
  gemsPreference: "Mix of both",
  travelPace: "Flexible",
  interests: ["Food", "Nature", "Culture"],
};

export const durationOptions = [
  "Weekend",
  "3 days",
  "4 days",
  "5 days",
  "7 days",
  "10 days",
  "2 weeks",
];

export const budgetOptions = [
  "Under $1,500",
  "$1,500 - $2,500",
  "$2,000 - $4,000",
  "$4,000 - $7,000",
  "$7,000+",
];

export const travelerOptions = [
  "Solo",
  "Couple",
  "Family",
  "Friends",
  "Parents + kids",
  "Group",
];

export const energyOptions: AtlasEnergy[] = [
  "Easygoing",
  "Balanced",
  "High-energy",
];

export const tripStyleOptions: AtlasTripStyle[] = [
  "Relaxed",
  "Adventure",
  "Luxury",
  "Romantic",
  "Family",
  "Food-focused",
  "Culture-first",
  "Spontaneous",
];

export const gemOptions: AtlasGemPreference[] = [
  "Hidden gems",
  "Mix of both",
  "Top spots",
];

export const paceOptions: AtlasTravelPace[] = [
  "Planner",
  "Flexible",
  "Spontaneous",
];

export const interestOptions: AtlasInterest[] = [
  "Food",
  "Nature",
  "Nightlife",
  "Family",
  "Romance",
  "Culture",
  "Wellness",
  "Scenic drives",
];

export type AtlasDayPlan = {
  day: number;
  title: string;
  summary: string;
  morning: string;
  afternoon: string;
  evening: string;
};

export type AtlasTripOutput = {
  title: string;
  subtitle: string;
  staySuggestion: string;
  transportSuggestion: string;
  vibeSummary: string;
  highlights: string[];
  days: AtlasDayPlan[];
};

function getDestinationLabel(destination: string) {
  return destination?.trim() || "Your destination";
}

function getDayCount(duration: string) {
  switch (duration) {
    case "Weekend":
      return 2;
    case "3 days":
      return 3;
    case "4 days":
      return 4;
    case "5 days":
      return 5;
    case "7 days":
      return 7;
    case "10 days":
      return 10;
    case "2 weeks":
      return 14;
    default:
      return 4;
  }
}

function getAreaToStay(form: AtlasTripFormData) {
  if (form.tripStyle === "Luxury") {
    return "Stay in a polished central neighborhood with walkable dining and upscale hotels.";
  }

  if (form.tripStyle === "Romantic") {
    return "Stay in a scenic, charming area with beautiful evenings and slower pacing.";
  }

  if (form.tripStyle === "Family") {
    return "Stay in a practical, central area with easy parking, larger rooms, and relaxed dining nearby.";
  }

  if (form.tripStyle === "Adventure") {
    return "Stay near the main route out of town so day trips, hikes, and early starts feel effortless.";
  }

  if (form.interests.includes("Nightlife")) {
    return "Stay in a lively district close to bars, late dinners, and walkable nightlife.";
  }

  return "Stay in a central neighborhood that balances local character, convenience, and easy access to key sights.";
}

function getTransportSuggestion(form: AtlasTripFormData) {
  if (form.interests.includes("Scenic drives") || form.tripStyle === "Adventure") {
    return "A rental car is likely worth it so Atlas can build scenic stops, hidden detours, and flexible pacing into your route.";
  }

  if (form.tripStyle === "Luxury" || form.energyLevel === "Easygoing") {
    return "Prioritize easy transfers, airport convenience, and a stay in a walkable area so the trip feels smooth from start to finish.";
  }

  return "Use a mix of walking, local transit, and short rideshares unless the destination is spread out.";
}

function buildHighlights(form: AtlasTripFormData) {
  const highlights = [
    `${getDestinationLabel(form.destination)} matched to a ${form.tripStyle.toLowerCase()} travel style`,
    `${form.energyLevel} pacing with ${form.travelPace.toLowerCase()} structure`,
    `${form.gemsPreference.toLowerCase()} balance built into each day`,
  ];

  if (form.interests.length > 0) {
    highlights.push(`Focus areas: ${form.interests.join(", ")}`);
  }

  if (form.travelers) {
    highlights.push(`Designed for ${form.travelers.toLowerCase()} travel`);
  }

  return highlights;
}

function getMorningLine(form: AtlasTripFormData, day: number) {
  if (day === 1) {
    return `Easy arrival flow, coffee, neighborhood orientation, and Atlas’ first local stop in ${getDestinationLabel(form.destination)}.`;
  }

  if (form.interests.includes("Nature")) {
    return "Start with fresh air, scenic views, and a slower morning anchor before the day builds.";
  }

  if (form.interests.includes("Food")) {
    return "Start with a strong local breakfast, café stop, or market experience in a neighborhood with character.";
  }

  if (form.tripStyle === "Luxury") {
    return "Start slow with a polished breakfast, beautiful setting, and a more curated first half of the day.";
  }

  return "Start with a high-value local anchor that sets the mood without overloading the morning.";
}

function getAfternoonLine(form: AtlasTripFormData, day: number) {
  if (form.tripStyle === "Adventure") {
    return "Build the middle of the day around movement, route-based exploration, and one memorable signature stop.";
  }

  if (form.tripStyle === "Culture-first") {
    return "Use the afternoon for museums, architecture, walkable streets, and the deeper story of the place.";
  }

  if (form.tripStyle === "Family") {
    return "Keep the afternoon practical and fun with one anchor activity, a relaxed meal window, and room to pivot.";
  }

  if (form.gemsPreference === "Hidden gems") {
    return "Lean into a tucked-away local favorite, a viewpoint, or a smaller stop most visitors miss.";
  }

  return "Layer in a must-see with one local detour so the day feels classic without feeling generic.";
}

function getEveningLine(form: AtlasTripFormData, day: number) {
  if (form.interests.includes("Nightlife")) {
    return "Close with dinner, a lively bar area, and an evening flow that can stretch later if the energy is right.";
  }

  if (form.interests.includes("Romance") || form.tripStyle === "Romantic") {
    return "Close with golden-hour views, a memorable dinner, and a slower evening with atmosphere.";
  }

  if (form.energyLevel === "Easygoing") {
    return "Close with a relaxed dinner and a low-pressure evening so tomorrow still feels exciting.";
  }

  return "Close with a dinner anchor, one evening walk or viewpoint, and a flexible option if you want more.";
}

function getDayTitle(form: AtlasTripFormData, day: number, totalDays: number) {
  if (day === 1) return "Arrival + settle into the trip";
  if (day === totalDays) return "Final highlights + easy closeout";
  if (form.tripStyle === "Adventure") return `Route day ${day - 1}: movement + standout stops`;
  if (form.tripStyle === "Romantic") return `Slow day ${day - 1}: views, moments, and atmosphere`;
  if (form.tripStyle === "Food-focused") return `Taste day ${day - 1}: neighborhoods + local flavor`;
  if (form.tripStyle === "Culture-first") return `Culture day ${day - 1}: depth + discovery`;
  return `Atlas day ${day - 1}: your best-fit mix`;
}

export function createAtlasTripOutput(form: AtlasTripFormData): AtlasTripOutput {
  const totalDays = getDayCount(form.duration);
  const destination = getDestinationLabel(form.destination);

  const days: AtlasDayPlan[] = Array.from({ length: totalDays }).map((_, index) => {
    const day = index + 1;

    return {
      day,
      title: getDayTitle(form, day, totalDays),
      summary:
        day === 1
          ? `Atlas starts your ${destination} journey with an easy, confidence-building first day.`
          : day === totalDays
          ? `A smoother final day with room for one more great stop before heading out.`
          : `A balanced day shaped around ${form.tripStyle.toLowerCase()} travel, ${form.energyLevel.toLowerCase()} energy, and ${form.gemsPreference.toLowerCase()}.`,
      morning: getMorningLine(form, day),
      afternoon: getAfternoonLine(form, day),
      evening: getEveningLine(form, day),
    };
  });

  return {
    title: `${destination}, built for you`,
    subtitle: `A ${form.duration.toLowerCase()} Atlas trip shaped for ${form.travelers.toLowerCase()} travel, ${form.tripStyle.toLowerCase()} style, and ${form.energyLevel.toLowerCase()} energy.`,
    staySuggestion: getAreaToStay(form),
    transportSuggestion: getTransportSuggestion(form),
    vibeSummary:
      "Atlas is shaping this trip like a real travel agent would: matching pace, priorities, and personality instead of giving you a generic list.",
    highlights: buildHighlights(form),
    days,
  };
}