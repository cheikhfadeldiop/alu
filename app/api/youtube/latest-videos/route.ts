import { NextRequest, NextResponse } from "next/server";

import { getAluBootstrap, getYouTubeLatestVideosPage } from "@/services/api";
import { SITE_CONFIG } from "@/constants/site-config";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const maxResults = Number(searchParams.get("maxResults") || "8");
  const pageToken = searchParams.get("pageToken") || undefined;

  try {
    // In ALU single-channel mode, prefer the api_key returned by bootstrap.
    // This avoids falling back to RSS (which can be capped and have bad titles).
    const envName = SITE_CONFIG.singleChannel?.youtube?.apiKeyEnv || "YOUTUBE_API_KEY";
    if (!process.env[envName]) {
      const boot = await getAluBootstrap().catch(() => ({ allitems: [] as any[] }));
      const tv = boot.allitems?.find((i: any) => String(i?.type || "").toLowerCase() === "tv") || boot.allitems?.[0];
      const bootKey = tv?.api_key || boot.allitems?.[0]?.api_key;
      if (bootKey) {
        process.env[envName] = String(bootKey);
      }
    }

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
