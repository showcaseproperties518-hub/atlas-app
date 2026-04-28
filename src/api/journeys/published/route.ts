import { NextResponse } from "next/server";
import { getPublishedJourneysFromDb } from "@/app/lib/atlas-journeys-db";

export async function GET() {
  try {
    const journeys = await getPublishedJourneysFromDb();

    return NextResponse.json({ journeys });
  } catch (error) {
    console.error("[GET_PUBLISHED_JOURNEYS_ERROR]", error);

    return NextResponse.json(
      { error: "Failed to load journeys" },
      { status: 500 }
    );
  }
}