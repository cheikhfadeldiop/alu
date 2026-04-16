import { NextRequest, NextResponse } from "next/server";

import { getYouTubeLatestVideosPage } from "@/services/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const maxResults = Number(searchParams.get("maxResults") || "8");
  const pageToken = searchParams.get("pageToken") || undefined;

  try {
    const page = await getYouTubeLatestVideosPage({ maxResults, pageToken, ttlKey: "realtime" });
    return NextResponse.json(page);
  } catch (error) {
    console.error("Failed to fetch latest YouTube videos page", error);
    return NextResponse.json(
      { items: [], nextPageToken: null, error: "fetch_failed" },
      { status: 500 }
    );
  }
}
