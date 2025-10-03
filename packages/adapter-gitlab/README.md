# @oh-my-ghaad/adapter-github

GitHub adapter for Oh My GHAAD, providing GitHub-specific implementation for using GitHub repositories as JSON databases.

## Overview

The GitHub adapter implements the core adapter interface to provide:
- GitHub repository access
- File operations (create, read, update, delete)
- OAuth integration
- Repository installation handling

## Installation

```bash
npm install @oh-my-ghaad/adapter-github @oh-my-ghaad/core
# or
yarn add @oh-my-ghaad/adapter-github @oh-my-ghaad/core
# or
pnpm add @oh-my-ghaad/adapter-github @oh-my-ghaad/core
```

## Basic Usage

```typescript
import { Engine } from '@oh-my-ghaad/core';
import { GithubAdapter } from '@oh-my-ghaad/adapter-github';

// Create the engine instance with the GitHub adapter
const engine = new Engine({
  adapters: [
    new GithubAdapter({
      clientId: "YOUR_GITHUB_CLIENT_ID",
      redirectUri: process.env.YOUR_GITHUB_REDIRECT_URI!,
      accessManagementUrl:
        "https://github.com/apps/[YOUR_GITHUB_APP_NAME]/installations/new",
    }),
  ],
  collections: [/* your collections */],
  appConfig: {
    persisted: true
  }
});
```

## Configuration

The GitHub adapter requires the following configuration:

- `clientId`: The client ID of your GitHub app
- `redirectUri`: The redirect URI of your GitHub app
- `accessManagementUrl`: The URL to the access management page of your GitHub app

## OAUTH

You will need to set up an OAuth app on GitHub. You will also need to set up a backend server to handle the OAuth flow since GitHub does not allow the implicit flow for OAuth apps.

See GitHub's [OAuth App documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) for more details.

### Example Server Setup

```typescript
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

```


## Related Packages

- [@oh-my-ghaad/core](../core/README.md) - Core functionality
- [@oh-my-ghaad/react](../react/README.md) - React integration

For more examples and detailed usage, see the [main README](../../README.md) and the [demo app](../../apps/demo-app/README.md).
