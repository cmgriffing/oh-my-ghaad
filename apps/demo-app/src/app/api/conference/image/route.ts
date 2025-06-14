import { NextApiRequest } from "next";

import * as cheerio from "cheerio";

export async function POST(request: NextApiRequest) {
  const { conferenceUrl } = await request.json();

  if (!conferenceUrl || typeof conferenceUrl !== "string") {
    return new Response("Missing code", { status: 400 });
  }

  const pageContents = await fetch(conferenceUrl).then((response) =>
    response.text()
  );
  const $ = cheerio.load(pageContents);
  const ogImage = $('meta[property="og:image"]').attr("content");

  return new Response(
    JSON.stringify({
      image: ogImage,
    })
  );
}
