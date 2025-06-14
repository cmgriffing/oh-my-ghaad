# Oh My GHAAD

A monorepo containing packages and applications for treating Git repositories (GitHub/GitLab/BitBucket) as JSON databases with built-in authentication and permissions.

## Overview

This project provides a way to use Git repositories as a form of "serverless" database, where:

- Data is stored as JSON files in the repository
- Authentication and permissions are handled by the Git platform (GitHub/GitLab/BitBucket)
- Changes are tracked through Git's version control system
- Multiple users can collaborate with proper access controls

The repository contains:

- `@oh-my-ghaad/core` - Core functionality for Git-based JSON storage
- `@oh-my-ghaad/adapter-github` - GitHub-specific implementation
- `@oh-my-ghaad/react` - React components and hooks for easy integration
- `demo-app` - Example application showcasing the packages

## Getting Started

Install the core, your preferred adapter (GitHub in this example), and the framework-specific library for your frontend (ReactJS in this case).

NPM:

```
npm install @oh-my-ghaad/core @oh-my-ghaad/github @oh-my-ghaad/react
```

Yarn

```
yarn add @oh-my-ghaad/core @oh-my-ghaad/github @oh-my-ghaad/react
```

PNPM

```
pnpm add @oh-my-ghaad/core @oh-my-ghaad/github @oh-my-ghaad/react
```

## Key Concepts

### Collections

Collections are the primary way to organize and validate your data. Each collection:

- Has a unique ID
- Uses Zod for schema validation
- Can be referenced by ID, singular name, or plural name
- Stores data in a dedicated directory in the repository

### Engine

The Engine is the main interface for interacting with your Git-based database. It:

- Manages adapters for different Git platforms
- Handles collection operations
- Provides real-time updates through subscriptions
- Manages repository configuration

### Adapters

Adapters are responsible for platform-specific operations. The core package defines the interface that all adapters must implement. See the [main README](../../README.md) for available adapters.

### Creating and Using the Engine

This is a very light example of using the Engine in a vanilla JS context.

For adapter specific examples, see the README for the adapter you are using.

- [GitHub Adapter](./packages/adapter-github/README.md)

For framework specific examples, see the README for the framework you are using.

- [React](./packages/react/README.md)

To see a full React/GitHub example, see the [demo-app](./apps/demo-app/README.md).

```typescript
import { Engine } from "@oh-my-ghaad/core";
import { GitHubAdapter } from "@oh-my-ghaad/github";
import { z } from "zod";

// Define your collection schema
const widgetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["gauge", "chart", "counter"]),
  config: z.object({
    color: z.string(),
    size: z.enum(["small", "medium", "large"]),
    enabled: z.boolean(),
  }),
});

// Create a collection
const widgetsCollection = {
  id: "widgets",
  names: {
    singular: "widget",
    plural: "widgets",
    path: "widgets",
  },
  validator: widgetSchema,
  idFunction: () => crypto.randomUUID(),
};

// Create a GitHub adapter
const githubAdapter = new GitHubAdapter();

// Create the engine instance
const engine = new Engine({
  adapters: [githubAdapter],
  collections: [widgetsCollection],
  appConfig: {
    persisted: true, // Persist adapter and token in localStorage
    persistedAdapterKey: "selected-adapter",
    persistedTokenKey: "github-token",
    persistedRepoKey: "github-repo",
    persistedOwnerKey: "github-owner",
  },
});

// Set up the repository
await engine.setRepoOwner("your-username");
await engine.setRepoName("your-repo");
await engine.setToken("your-github-token");

// Initialize the repository (creates config.json and collection directories)
await engine.initialize();

// Add a widget to the collection
const newWidget = {
  name: "Sales Counter",
  type: "counter",
  config: {
    color: "#4CAF50",
    size: "medium",
    enabled: true,
  },
};

await engine.addToCollection("widgets", newWidget);

// Fetch all widgets
const widgets = await engine.fetchCollectionItems("widgets");

// Update a widget
await engine.updateInCollection("widgets", newWidget.id, {
  ...newWidget,
  config: {
    ...newWidget.config,
    size: "large",
  },
});

// Remove a widget
await engine.removeFromCollection("widgets", newWidget.id);
```

## Project Structure

```
.
├── apps/
│   └── demo-app/        # Example application
├── packages/
│   ├── core/           # Core Git-based JSON storage functionality
│   ├── adapter-github/ # GitHub-specific implementation
│   └── react/          # React components and hooks
└── ...
```

## Packages

### Core

The core package provides the fundamental functionality for treating Git repositories as JSON databases. See [packages/core/README.md](./packages/core/README.md) for more details.

### Adapters

Adapters are responsible for interacting with the Git platform (GitHub/GitLab/BitBucket) and providing the necessary functionality to store and retrieve data.

See the README for the adapter you are using for more details.

- [GitHub Adapter](./packages/adapter-github/README.md)

### Framework Integrations

Framework packages provide the necessary functionality to integrate the core package with a specific framework.

See the README for the framework you are using for more details.

- [React](./packages/react/README.md)

## Use Cases

- Simple applications that need a database but don't want to manage server infrastructure
- Collaborative applications where data changes need to be tracked
- Projects that benefit from Git's built-in authentication and permissions
- Applications that need version control for their data

## Apps Using OH My GHaaD

- [CFP Tracker](https://github.com/cmgriffing/cfp-tracker)

## Contributing

We are open to contributions! Some of the things we are looking for:

- Adapters for other Git platforms
- Framework integrations for other frameworks
- Documentation
- Examples
- Tests
- Bug fixes

## Roadmap

[ ] Add support for Pull Request based mutations

[ ] Add GitLab adapter
[ ] Add BitBucket adapter
[ ] Add Azure DevOps adapter
[ ] Add Vue integration

[ ] Add Svelte integration
[ ] Add Angular integration
[ ] Add Solid integration

## License

This project is licensed under the MIT License - see the LICENSE file for details.
