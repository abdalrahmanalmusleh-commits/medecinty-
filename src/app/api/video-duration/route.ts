export const dynamic = 'force-static';
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter missing" }, { status: 400 });
  }

  try {
    // Clean YouTube ID extraction (handles youtu.be, watch?v=, Shorts, query params like ?si=...)
    let videoId = "";
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname.includes("youtu.be")) {
        videoId = parsedUrl.pathname.replace("/", "");
      } else if (parsedUrl.hostname.includes("youtube.com")) {
        videoId = parsedUrl.searchParams.get("v") || "";
        if (!videoId && parsedUrl.pathname.includes("/embed/")) {
          videoId = parsedUrl.pathname.split("/embed/")[1];
        } else if (!videoId && parsedUrl.pathname.includes("/shorts/")) {
          videoId = parsedUrl.pathname.split("/shorts/")[1];
        }
      }
    } catch (e) {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match) videoId = match[1];
    }

    // Clean any remaining query params from videoId
    if (videoId.includes("?")) videoId = videoId.split("?")[0];
    if (videoId.includes("&")) videoId = videoId.split("&")[0];
    if (videoId.includes("/")) videoId = videoId.split("/")[0];

    if (videoId && videoId.length === 11) {
      const ytRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9"
        }
      });
      const html = await ytRes.text();

      let seconds = 0;
      let title = "";

      // Extract duration from lengthSeconds
      const lenMatch = html.match(/"lengthSeconds":"(\d+)"/);
      if (lenMatch && lenMatch[1]) {
        seconds = parseInt(lenMatch[1], 10);
      } else {
        const approxMatch = html.match(/"approxDurationMs":"(\d+)"/);
        if (approxMatch && approxMatch[1]) {
          seconds = Math.floor(parseInt(approxMatch[1], 10) / 1000);
        }
      }

      // Extract title
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(" - YouTube", "").trim();
      }

      if (seconds > 0) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const formatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        return NextResponse.json({ duration: formatted, seconds, title });
      }
    }

    // 2. Check Vimeo
    const vimeoRegExp = /vimeo\.com\/(?:video\/)?([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegExp);
    if (vimeoMatch && vimeoMatch[1]) {
      const vimeoId = vimeoMatch[1];
      const vimeoRes = await fetch(`https://vimeo.com/api/v2/video/${vimeoId}.json`);
      if (vimeoRes.ok) {
        const data = await vimeoRes.json();
        if (Array.isArray(data) && data[0] && data[0].duration) {
          const seconds = parseInt(data[0].duration, 10);
          const mins = Math.floor(seconds / 60);
          const secs = Math.floor(seconds % 60);
          const formatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
          return NextResponse.json({ duration: formatted, seconds, title: data[0].title || "" });
        }
      }
    }

    return NextResponse.json({ duration: null });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch video metadata" }, { status: 500 });
  }
}
