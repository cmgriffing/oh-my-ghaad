export async function POST(request: Request) {
  const { code } = await request.json();

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      code: code,
      redirect_uri: process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI!,
    }),
  });

  if (!response.ok) {
    return new Response("Failed to fetch token", { status: 500 });
  }

  const responseJson = await response.json();

  if (!responseJson.access_token) {
    return new Response("Failed to fetch token", { status: 500 });
  }

  return new Response(JSON.stringify(responseJson));
}
