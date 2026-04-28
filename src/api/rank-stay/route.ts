import { NextRequest, NextResponse } from "next/server";

type BookingProvider =
  | "google_flights"
  | "booking"
  | "airbnb"
  | "rentalcars"
  | "expedia"
  | "hotels"
  | "priceline";

type AtlasTripFormData = {
  destination?: string;
  travelers?: string;
  budget?: string;
  tripStyle?: string;
  energyLevel?: string;
  stayType?: string;
  transportType?: string;
};

type RankedProvidersResponse = {
  primaryProvider?: BookingProvider;
  backupProvider?: BookingProvider;
  primaryReason?: string;
  backupReason?: string;
  rankedProviders?: Array<{
    provider: BookingProvider;
    score: number;
    reason: string;
  }>;
};

function scoreProviders(form: AtlasTripFormData): RankedProvidersResponse {
  const stayType = form.stayType || "Best value mix";
  const budget = form.budget || "Balanced";
  const travelers = form.travelers || "Travelers";

  const scores: Record<Exclude<BookingProvider, "google_flights" | "rentalcars">, number> = {
    booking: 78,
    airbnb: 72,
    hotels: 70,
    expedia: 68,
    priceline: 64,
  };

  if (stayType === "Airbnb") {
    scores.airbnb += 22;
    scores.booking -= 4;
  }

  if (stayType === "Hotel" || stayType === "Boutique" || stayType === "Luxury") {
    scores.booking += 14;
    scores.hotels += 10;
    scores.expedia += 6;
  }

  if (budget.toLowerCase().includes("value") || budget.toLowerCase().includes("budget")) {
    scores.priceline += 10;
    scores.booking += 5;
  }

  if (travelers.toLowerCase().includes("family") || travelers.toLowerCase().includes("group")) {
    scores.airbnb += 8;
    scores.expedia += 4;
  }

  const rankedProviders = Object.entries(scores)
    .map(([provider, score]) => ({
      provider: provider as BookingProvider,
      score,
      reason: `${provider} fits this trip based on stay style, budget, travelers, and booking flexibility.`,
    }))
    .sort((a, b) => b.score - a.score);

  const primaryProvider = rankedProviders[0]?.provider || "booking";
  const backupProvider = rankedProviders[1]?.provider || "airbnb";

  return {
    primaryProvider,
    backupProvider,
    primaryReason:
      primaryProvider === "airbnb"
        ? "Atlas is leading with Airbnb because this trip benefits from more space, privacy, and a local home-base feel."
        : "Atlas is leading with a hotel-style provider because this trip benefits from easy logistics, central location, and smoother booking flow.",
    backupReason:
      backupProvider === "airbnb"
        ? "Atlas is keeping Airbnb as the backup because extra space or a more local stay could still fit this trip well."
        : "Atlas is keeping this hotel-style provider as the backup because it gives another strong booking path if the first option does not fit.",
    rankedProviders,
  };
}

export async function POST(req: NextRequest) {
  try {
    const form = (await req.json()) as AtlasTripFormData;
    return NextResponse.json(scoreProviders(form));
  } catch (error) {
    return NextResponse.json(
      {
        error: "Rank stay route failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
