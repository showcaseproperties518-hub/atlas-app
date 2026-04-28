import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AtlasTripFormData = {
  destination?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  travelers?: string;
  budget?: string;
  travelPace?: string;
  interests?: string[];
  gemsPreference?: string;
  tripStyle?: string;
  energyLevel?: string;
  stayType?: string;
  transportType?: string;
  flightOrigin?: string;
  excursionType?: string;
};

type AtlasAITripDay = {
  day: number;
  title: string;
  summary: string;
  morning: string;
  afternoon: string;
  evening: string;
};

type AtlasAITripOutput = {
  title: string;
  subtitle: string;
  vibeSummary: string;
  flightSuggestion: string;
  transportSuggestion: string;
  days: AtlasAITripDay[];
};

function getTripDayCount(duration?: string) {
  const match = duration?.match(/\d+/);
  const parsed = match ? Number(match[0]) : 4;
  if (!Number.isFinite(parsed)) return 4;
  return Math.min(Math.max(parsed, 1), 10);
}

function cleanString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function getExcursionFallback(form: AtlasTripFormData, destination: string) {
  const excursionType = cleanString(form.excursionType, "Light exploring");

  if (excursionType === "None") {
    return `Keep activities light and flexible, focusing on simple local moments around ${destination} without forcing tours or big excursions.`;
  }

  if (excursionType === "Guided tours") {
    return `Include one realistic guided-style activity only if it is widely likely for ${destination}; otherwise suggest checking local tour options near the main area.`;
  }

  if (excursionType === "Adventure") {
    return `Add an outdoor or active experience that fits ${destination}, using flexible language if a specific operator or tour is uncertain.`;
  }

  if (excursionType === "All-in activities") {
    return `Build in more activity-forward blocks, balancing bookable-feeling experiences with realistic pacing and downtime.`;
  }

  return `Add light exploring through realistic local activities, scenic areas, food stops, or flexible things-to-do options around ${destination}.`;
}

function normalizeTrip(value: unknown, form: AtlasTripFormData): AtlasAITripOutput {
  const destination = cleanString(form.destination, "Your destination");
  const dayCount = getTripDayCount(form.duration);
  const raw = value && typeof value === "object" ? (value as Partial<AtlasAITripOutput>) : {};
  const rawDays = Array.isArray(raw.days) ? raw.days : [];
  const excursionFallback = getExcursionFallback(form, destination);

  const days: AtlasAITripDay[] = Array.from({ length: dayCount }).map((_, index) => {
    const rawDay = rawDays[index] && typeof rawDays[index] === "object"
      ? (rawDays[index] as Partial<AtlasAITripDay>)
      : {};
    const dayNumber = index + 1;

    return {
      day: dayNumber,
      title: cleanString(rawDay.title, `Day ${dayNumber} in ${destination}`),
      summary: cleanString(
        rawDay.summary,
        `A balanced day built around ${destination}, your pace, your travel style, and your activity preference.`
      ),
      morning: cleanString(
        rawDay.morning,
        `Start with a smooth morning and a strong local anchor in ${destination}.`
      ),
      afternoon: cleanString(
        rawDay.afternoon,
        excursionFallback
      ),
      evening: cleanString(
        rawDay.evening,
        `Keep the evening simple, memorable, and easy to enjoy.`
      ),
    };
  });

  return {
    title: cleanString(raw.title, `${destination} Built Your Way`),
    subtitle: cleanString(
      raw.subtitle,
      `A custom Atlas itinerary shaped around your dates, pace, style, budget, activity preferences, and travel identity.`
    ),
    vibeSummary: cleanString(
      raw.vibeSummary,
      `This trip balances must-do moments with local-feeling experiences so ${destination} feels personal instead of generic.`
    ),
    flightSuggestion: cleanString(
      raw.flightSuggestion,
      `Compare flights from ${cleanString(
        form.flightOrigin,
        "your preferred airport"
      )} into the best airport for ${destination}.`
    ),
    transportSuggestion: cleanString(
      raw.transportSuggestion,
      `Use ${cleanString(
        form.transportType,
        "a mixed transportation plan"
      )} so each day stays smooth and realistic.`
    ),
    days,
  };
}

export async function POST(req: NextRequest) {
  try {
    const form = (await req.json()) as AtlasTripFormData;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const destination = cleanString(form.destination, "the destination");
    const dayCount = getTripDayCount(form.duration);
    const excursionType = cleanString(form.excursionType, "Light exploring");

    const systemPrompt = `
You are Atlas, a premium AI travel agent.

You create:
- Realistic
- Grounded
- Smooth
- Bookable-feeling itineraries

Your output should feel like a real trip someone would actually follow.
Return JSON only.
`;

    const userPrompt = `
Create a real custom itinerary.

Traveler build data:
- Destination: ${destination}
- Dates: ${form.startDate || "Flexible"} to ${form.endDate || "Flexible"}
- Duration: ${form.duration || `${dayCount} days`}
- Travelers: ${form.travelers || "Travelers"}
- Budget: ${form.budget || "Balanced"}
- Pace: ${form.travelPace || "Balanced"}
- Interests: ${(form.interests || []).join(", ") || "food, nature, local discovery"}
- Gems preference: ${form.gemsPreference || "Mix of both"}
- Trip style: ${form.tripStyle || "Balanced"}
- Energy level: ${form.energyLevel || "Moderate"}
- Stay type: ${form.stayType || "Best value mix"}
- Transport type: ${form.transportType || "Mixed"}
- Excursions / activities preference: ${excursionType}

Return EXACTLY this JSON:
{
  "title": "string",
  "subtitle": "string",
  "vibeSummary": "string",
  "flightSuggestion": "string",
  "transportSuggestion": "string",
  "days": [
    {
      "day": 1,
      "title": "string",
      "summary": "string",
      "morning": "string",
      "afternoon": "string",
      "evening": "string"
    }
  ]
}

RULES:

EXCURSION LOGIC:
- Use the excursions / activities preference to shape the itinerary days.
- If preference is "None", keep activity blocks light and do not push tours.
- If preference is "Light exploring", include simple things to do like scenic walks, local areas, casual viewpoints, food stops, or flexible activity windows.
- If preference is "Guided tours", include guided-style activity ideas only when they are very likely for the destination. If unsure, say "check local guided options" instead of naming a fake tour.
- If preference is "Adventure", include realistic active/outdoor activity categories that fit the place, terrain, season, and transportation style.
- If preference is "All-in activities", include more activity-forward days, but still keep travel time and energy realistic.

REALISM:
- DO NOT invent tours, companies, restaurants, or businesses.
- DO NOT say “boat tour”, “guided tour”, “rental company”, “restaurant name”, or “ticketed attraction” unless it is widely known and highly likely to exist.
- If unsure, use flexible phrasing:
  - "lakefront time"
  - "local marina options"
  - "downtown food spots"
  - "family-friendly activity nearby"
  - "check local activity providers"
  - "scenic walk"
  - "nearby state park or nature area"

- For smaller towns, rural destinations, lakes, and mountain areas, lean into nature, walking, scenic areas, simple local plans, and flexible activity searches.
- Never fake exact availability, exact pricing, specific operators, or reservations.

QUALITY:
- Keep days logical and geographically realistic.
- Keep pacing smooth.
- No overstuffing.
- Build each day as morning / afternoon / evening with a clear flow.
- Make excursions feel like optional bookable moments, not forced filler.

TONE:
- Clean
- Premium
- Confident
- Not cheesy
- Not generic blog style

- Return exactly ${dayCount} days.
`;

    const openAIResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.65,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      return NextResponse.json(
        { error: "OpenAI itinerary request failed", details: errorText },
        { status: 500 }
      );
    }

    const openAIJson = await openAIResponse.json();
    const content = openAIJson?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "OpenAI returned empty itinerary" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content);
    const trip = normalizeTrip(parsed, form);

    return NextResponse.json(trip);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Itinerary route failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
