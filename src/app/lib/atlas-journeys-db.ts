import { supabaseAdmin } from "@/app/lib/supabase-admin";

type JourneyDayInput = {
  day: number;
  title: string;
  summary?: string;
  morning?: string;
  afternoon?: string;
  evening?: string;
};

type JourneyInput = {
  title: string;
  subtitle?: string;
  destination: string;
  vibe_summary?: string;
  cover_image?: string;
  coverImage?: string;
  start_date?: string;
  end_date?: string;
  duration?: string;
  budget?: string;
  travelers?: string;
  trip_style?: string;
  energy_level?: string;
  stay_type?: string;
  transport_type?: string;
  excursion_type?: string;
  flight_origin?: string;
  is_published?: boolean;
  source_journey_id?: string | null;
  days: JourneyDayInput[];
};

export async function createJourneyInDb(input: JourneyInput) {
  const coverImage = input.cover_image || input.coverImage || null;

  const { data: journey, error: journeyError } = await supabaseAdmin
    .from("journeys")
    .insert({
      title: input.title,
      subtitle: input.subtitle ?? null,
      destination: input.destination,
      vibe_summary: input.vibe_summary ?? null,
      cover_image: coverImage,
      start_date: input.start_date ?? null,
      end_date: input.end_date ?? null,
      duration: input.duration ?? null,
      budget: input.budget ?? null,
      travelers: input.travelers ?? null,
      trip_style: input.trip_style ?? null,
      energy_level: input.energy_level ?? null,
      stay_type: input.stay_type ?? null,
      transport_type: input.transport_type ?? null,
      excursion_type: input.excursion_type ?? null,
      flight_origin: input.flight_origin ?? null,
      is_published: input.is_published ?? false,
      source_journey_id: input.source_journey_id ?? null,
    })
    .select()
    .single();

  if (journeyError) {
    throw new Error(journeyError.message);
  }

  if (input.days.length > 0) {
    const { error: daysError } = await supabaseAdmin.from("journey_days").insert(
      input.days.map((day) => ({
        journey_id: journey.id,
        day_number: day.day,
        title: day.title,
        summary: day.summary ?? null,
        morning: day.morning ?? null,
        afternoon: day.afternoon ?? null,
        evening: day.evening ?? null,
      }))
    );

    if (daysError) {
      throw new Error(daysError.message);
    }
  }

  return journey;
}

export async function getPublishedJourneysFromDb() {
  const { data, error } = await supabaseAdmin
    .from("journeys")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getJourneyDaysFromDb(journeyId: string) {
  const { data, error } = await supabaseAdmin
    .from("journey_days")
    .select("*")
    .eq("journey_id", journeyId)
    .order("day_number", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
