import { NextRequest, NextResponse } from "next/server";
import { createJourneyInDb } from "@/app/lib/atlas-journeys-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Missing journey payload" },
        { status: 400 }
      );
    }

    if (!body.title || !body.destination) {
      return NextResponse.json(
        { error: "Journey requires title and destination" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.days)) {
      return NextResponse.json(
        { error: "Journey requires days array" },
        { status: 400 }
      );
    }

    const journey = await createJourneyInDb({
      ...body,
      is_published: Boolean(body.is_published),
    });

    return NextResponse.json({ journey });
  } catch (error) {
    console.error("[JOURNEY_CREATE_ERROR]", error);

    return NextResponse.json(
      {
        error: "Failed to create journey",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
