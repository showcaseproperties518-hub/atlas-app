import { createClient } from "@supabase/supabase-js";

type BookingProvider =
  | "google_flights"
  | "booking"
  | "airbnb"
  | "rentalcars"
  | "expedia"
  | "hotels"
  | "priceline";

type ResultsTripFormData = {
  destination: string;
  travelers?: string;
  budget?: string;
  tripStyle?: string;
  stayType?: string;
};

type OutboundClickRow = {
  id: string;
  timestamp: string;
  category: string;
  provider: BookingProvider;
  label: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  flight_origin: string | null;
  stay_type: string | null;
  transport_type: string | null;
  budget: string | null;
  travelers: string | null;
  trip_style: string | null;
  target_url: string;
};

type ProviderScore = {
  provider: BookingProvider;
  score: number;
  reasonParts: string[];
};

export type RankedStayProviderResult = {
  primaryProvider: BookingProvider;
  backupProvider: BookingProvider;
  primaryReason: string;
  backupReason: string;
  rankedProviders: Array<{
    provider: BookingProvider;
    score: number;
    reason: string;
  }>;
};

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function normalize(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function getProviderBaseScores(): ProviderScore[] {
  return [
    { provider: "booking", score: 5, reasonParts: ["strong default hotel coverage"] },
    { provider: "airbnb", score: 5, reasonParts: ["strong default local-stay coverage"] },
    { provider: "expedia", score: 4, reasonParts: ["broad hotel inventory"] },
    { provider: "hotels", score: 4, reasonParts: ["solid hotel comparison coverage"] },
    { provider: "priceline", score: 3, reasonParts: ["value-oriented backup option"] },
  ];
}

function addScore(
  scores: ProviderScore[],
  provider: BookingProvider,
  amount: number,
  reason: string
) {
  const item = scores.find((entry) => entry.provider === provider);
  if (!item) return;
  item.score += amount;
  item.reasonParts.push(reason);
}

function applyRuleBasedSignals(scores: ProviderScore[], form: ResultsTripFormData) {
  const stayType = normalize(form.stayType);
  const travelers = normalize(form.travelers);
  const budget = normalize(form.budget);
  const destination = normalize(form.destination);
  const tripStyle = normalize(form.tripStyle);

  if (stayType === "airbnb") {
    addScore(scores, "airbnb", 6, "trip explicitly leans Airbnb");
    addScore(scores, "booking", -1, "less aligned with Airbnb-first preference");
  }

  if (stayType === "hotel" || stayType === "boutique" || stayType === "luxury") {
    addScore(scores, "booking", 5, "trip leans hotel inventory");
    addScore(scores, "expedia", 2, "good hotel backup for hotel-led trips");
    addScore(scores, "hotels", 1, "secondary hotel comparison coverage");
  }

  if (stayType === "boutique") {
    addScore(scores, "booking", 2, "boutique/city-center fit");
  }

  if (stayType === "luxury") {
    addScore(scores, "booking", 2, "luxury hotel fit");
    addScore(scores, "expedia", 1, "luxury hotel backup");
  }

  if (travelers.includes("family")) {
    addScore(scores, "airbnb", 2, "families often prefer more space");
    addScore(scores, "booking", 1, "family hotel comparison still relevant");
  }

  if (budget.includes("budget") || budget.includes("value")) {
    addScore(scores, "airbnb", 2, "value-oriented space option");
    addScore(scores, "priceline", 2, "value-hunting fit");
    addScore(scores, "hotels", 1, "budget comparison support");
  }

  if (
    destination.includes("paris") ||
    destination.includes("tokyo") ||
    destination.includes("rome") ||
    destination.includes("italy")
  ) {
    addScore(scores, "booking", 1, "strong city hotel coverage");
  }

  if (tripStyle.includes("food") || tripStyle.includes("culture")) {
    addScore(scores, "booking", 1, "walkable urban stay fit");
  }
}

function matchesLoose(a?: string | null, b?: string | null) {
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

function applyHistoricalSignals(
  scores: ProviderScore[],
  rows: OutboundClickRow[],
  form: ResultsTripFormData
) {
  if (!rows.length) return;

  const exactDestinationRows = rows.filter(
    (row) => row.category === "stay" && matchesLoose(row.destination, form.destination)
  );

  const stayTypeRows = rows.filter(
    (row) => row.category === "stay" && matchesLoose(row.stay_type, form.stayType)
  );

  const travelerRows = rows.filter(
    (row) => row.category === "stay" && matchesLoose(row.travelers, form.travelers)
  );

  const budgetRows = rows.filter(
    (row) => row.category === "stay" && matchesLoose(row.budget, form.budget)
  );

  const exactDestinationCounts = countProviders(exactDestinationRows);
  const stayTypeCounts = countProviders(stayTypeRows);
  const travelerCounts = countProviders(travelerRows);
  const budgetCounts = countProviders(budgetRows);

  for (const [provider, count] of Object.entries(exactDestinationCounts)) {
    addScore(
      scores,
      provider as BookingProvider,
      count * 2,
      `historical clicks for ${form.destination}`
    );
  }

  for (const [provider, count] of Object.entries(stayTypeCounts)) {
    addScore(
      scores,
      provider as BookingProvider,
      count * 1.5,
      `historical clicks for ${form.stayType || "similar stay type"}`
    );
  }

  for (const [provider, count] of Object.entries(travelerCounts)) {
    addScore(
      scores,
      provider as BookingProvider,
      count,
      `historical clicks for ${form.travelers || "similar travelers"}`
    );
  }

  for (const [provider, count] of Object.entries(budgetCounts)) {
    addScore(
      scores,
      provider as BookingProvider,
      count,
      `historical clicks for ${form.budget || "similar budget"}`
    );
  }
}

function countProviders(rows: OutboundClickRow[]) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    if (!row.provider) return acc;
    acc[row.provider] = (acc[row.provider] || 0) + 1;
    return acc;
  }, {});
}

function buildReason(parts: string[]) {
  const unique = Array.from(new Set(parts.filter(Boolean)));
  return unique.slice(0, 3).join(", ");
}

export function getProviderLabel(provider: BookingProvider) {
  if (provider === "google_flights") return "Google Flights";
  if (provider === "booking") return "Booking.com";
  if (provider === "airbnb") return "Airbnb";
  if (provider === "rentalcars") return "Rentalcars.com";
  if (provider === "expedia") return "Expedia";
  if (provider === "hotels") return "Hotels.com";
  return "Priceline";
}

export async function getRankedStayProviders(
  form: ResultsTripFormData
): Promise<RankedStayProviderResult> {
  const { data, error } = await supabaseAdmin
    .from("outbound_clicks")
    .select("*")
    .eq("category", "stay")
    .order("timestamp", { ascending: false })
    .limit(300);

  if (error) {
    console.error("[ATLAS_PROVIDER_RANKING_ERROR]", error.message);
  }

  const rows = ((data || []) as OutboundClickRow[]) ?? [];
  const scores = getProviderBaseScores();

  applyRuleBasedSignals(scores, form);
  applyHistoricalSignals(scores, rows, form);

  const ranked = [...scores]
    .sort((a, b) => b.score - a.score)
    .map((entry) => ({
      provider: entry.provider,
      score: Number(entry.score.toFixed(2)),
      reason: buildReason(entry.reasonParts),
    }));

  const primary = ranked[0] || {
    provider: "booking" as BookingProvider,
    score: 0,
    reason: "default fallback",
  };

  const backup =
    ranked.find((entry) => entry.provider !== primary.provider) || {
      provider: primary.provider,
      score: primary.score,
      reason: primary.reason,
    };

  return {
    primaryProvider: primary.provider,
    backupProvider: backup.provider,
    primaryReason: primary.reason,
    backupReason: backup.reason,
    rankedProviders: ranked,
  };
}