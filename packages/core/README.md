# @oh-my-ghaad/core

The core package provides the fundamental functionality for treating Git repositories as JSON databases. It handles the abstraction layer between your application and the Git platform adapters.

## Overview

The core package provides:

- Collection management with Zod validation
- Repository configuration and initialization
- CRUD operations for JSON data
- Subscription system for real-time updates
- Adapter management for different Git platforms

## Installation

```bash
npm install @oh-my-ghaad/core
# or
yarn add @oh-my-ghaad/core
# or
pnpm add @oh-my-ghaad/core
```

## Basic Usage

```typescript
import { Engine } from '@oh-my-ghaad/core';
import { z } from 'zod';

// Define your collection schema
const widgetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['gauge', 'chart', 'counter']),
  config: z.object({
    color: z.string(),
    size: z.enum(['small', 'medium', 'large']),
    enabled: z.boolean()
  })
});

// Create a collection
const widgetsCollection = {
  id: 'widgets',
  names: {
    singular: 'widget',
    plural: 'widgets',
    path: 'widgets'
  },
  validator: widgetSchema,
  idFunction: () => crypto.randomUUID()
};

// Create the engine instance
const engine = new Engine({
  adapters: [/* your adapter */],
  collections: [widgetsCollection],
  appConfig: {
    persisted: true
  }
});
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

## API Reference

### Engine

```typescript
class Engine {
  constructor(config: {
    adapters: (Adapter & IAdapter)[];
    collections: Collection[];
    appConfig: AppConfig;
  });

  // Collection Operations
  addToCollection<T>(collectionId: string, data: T): Promise<T[]>;
  updateInCollection<T>(collectionId: string, itemId: string, data: T): Promise<T[]>;
  removeFromCollection<T>(collectionId: string, itemId: string): Promise<T[]>;
  fetchCollectionItems<T>(collectionId: string): Promise<T[]>;
  fetchCollectionItem<T>(collectionId: string, itemId: string): Promise<T | null>;

  // Repository Management
  initialize(): Promise<void>;
  sync(): Promise<void>;
  setRepoOwner(owner: string): void;
  setRepoName(name: string): void;
  setToken(token: string): void;

  // Subscription
  subscribe(callback: (collections: Collection[]) => void): void;
  unsubscribe(callback: (collections: Collection[]) => void): void;
}
```

## Related Packages

- [@oh-my-ghaad/adapter-github](../adapter-github/README.md) - GitHub adapter implementation
- [@oh-my-ghaad/react](../react/README.md) - React integration

For more examples and detailed usage, see the [main README](../../README.md).
