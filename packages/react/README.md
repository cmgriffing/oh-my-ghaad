# @oh-my-ghaad/react

React integration for Oh My GHAAD, providing a hook to easily use Git repositories as JSON databases in your React applications.

## Overview

The React package provides a `useGHaaD` hook that integrates the core Engine with React's state management system, allowing you to:
- Access the Engine instance in your React components
- Subscribe to Engine updates
- Track repository status changes

## Installation

```bash
npm install @oh-my-ghaad/react @oh-my-ghaad/core
# or
yarn add @oh-my-ghaad/react @oh-my-ghaad/core
# or
pnpm add @oh-my-ghaad/react @oh-my-ghaad/core
```

## Basic Usage

```typescript
import { Engine } from '@oh-my-ghaad/core';
import { GithubAdapter } from '@oh-my-ghaad/adapter-github';
import { useGHaaD } from '@oh-my-ghaad/react';
import { useEffect, useState } from 'react';
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
  adapters: [new GithubAdapter()],
  collections: [widgetsCollection],
  appConfig: {
    persisted: true
  }
});

// Use the hook in your component
function WidgetsList() {
  const { engine, repoStatus, lastUpdated } = useGHaaD(engine);
  const [widgets, setWidgets] = useState<z.infer<typeof widgetSchema>[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch widgets when the component mounts or when lastUpdated changes
  useEffect(() => {
    async function fetchWidgets() {
      try {
        setLoading(true);
        const items = await engine.fetchCollectionItems('widgets');
        setWidgets(items);
      } catch (error) {
        console.error('Failed to fetch widgets:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWidgets();
  }, [lastUpdated]); // Re-fetch when the engine updates

  if (loading) {
    return <div>Loading widgets...</div>;
  }

  return (
    <div>
      <div>Repository Status: {repoStatus}</div>
      {widgets.map(widget => (
        <div key={widget.id}>
          <h3>{widget.name}</h3>
          <p>Type: {widget.type}</p>
          <p>Size: {widget.config.size}</p>
          <button
            onClick={async () => {
              try {
                await engine.updateInCollection('widgets', widget.id, {
                  ...widget,
                  config: {
                    ...widget.config,
                    enabled: !widget.config.enabled
                  }
                });
              } catch (error) {
                console.error('Failed to update widget:', error);
              }
            }}
          >
            Toggle Enabled
          </button>
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### useGHaaD Hook

```typescript
function useGHaaD(
  engine: Engine,
  subscription?: Subscription
): {
  engine: Engine;
  repoStatus: RepoStatus;
  lastUpdated: number;
}
```

The hook returns:
- `engine`: The Engine instance
- `repoStatus`: Current status of the repository
- `lastUpdated`: Timestamp of the last update

## Related Packages

- [@oh-my-ghaad/core](../core/README.md) - Core functionality
- [@oh-my-ghaad/adapter-github](../adapter-github/README.md) - GitHub adapter implementation

For more examples and detailed usage, see the [main README](../../README.md) and the [demo app](../../apps/demo-app/README.md).
