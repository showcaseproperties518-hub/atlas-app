import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const targetUrl = searchParams.get("targetUrl");

  if (!targetUrl) {
    return NextResponse.json(
      { error: "Missing targetUrl" },
      { status: 400 }
    );
  }

  try {
    const decodedTargetUrl = decodeURIComponent(targetUrl);

    return NextResponse.redirect(decodedTargetUrl);
  } catch {
    return NextResponse.json(
      { error: "Invalid targetUrl" },
      { status: 400 }
    );
  }
}