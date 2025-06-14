import { z } from "zod";

import { Collection } from "./collection";
import type { IAdapter, PrResponse, RepoStatus, Subscription } from "./types";
import { Adapter } from "./adapter";
import type { AppConfig, RepoConfig } from "./validators";
import { repoConfigSchema } from "./validators";

const storage = typeof window !== "undefined" ? window.localStorage : null;

export class Engine {
  private status: RepoStatus = "unknown";

  private subscriptions: Set<Subscription> = new Set();

  private adapters: (Adapter & IAdapter)[] = [];
  private currentAdapter: (Adapter & IAdapter) | null = null;
  private collections: Collection[] = [];

  private appConfig: AppConfig;
  private repoConfig: RepoConfig;

  private collectionItems: Record<string, z.infer<Collection["validator"]>[]> =
    {};

  constructor({
    appConfig,
    adapters,
    collections,
  }: {
    adapters: (Adapter & IAdapter)[];
    collections: Collection[];
    appConfig: AppConfig;
  }) {
    this.appConfig = appConfig;
    this.adapters = adapters;
    this.collections = collections;

    if (this.adapters.length === 1) {
      this.setAdapter(this.adapters[0]);
    }

    if (this.appConfig.persisted) {
      const persistedAdapter = storage?.getItem(
        this.appConfig.persistedAdapterKey || "adapter"
      );
      if (persistedAdapter) {
        const adapter = this.adapters.find(
          (adapter) => adapter.name === persistedAdapter
        );
        if (adapter) {
          this.setAdapter(adapter);
        }
      }

      const persistedToken = storage?.getItem(
        this.appConfig.persistedTokenKey || "token"
      );
      if (persistedToken) {
        this.setToken(persistedToken);
      }

      const persistedRepo = storage?.getItem(
        this.appConfig.persistedRepoKey || "repo"
      );
      if (persistedRepo) {
        this.getAdapter()?.setRepo(persistedRepo);
      }

      const persistedOwner = storage?.getItem(
        this.appConfig.persistedOwnerKey || "owner"
      );
      if (persistedOwner) {
        this.getAdapter()?.setOwner(persistedOwner);
      }
    }
  }

  setUnauthorizedHandler(handler: () => void | Promise<void>) {
    this.adapters.forEach((adapter) => {
      adapter.setUnauthorizedHandler(handler);
    });
  }

  subscribe(subscription: Subscription) {
    this.subscriptions.add(subscription);
  }

  unsubscribe(subscription: Subscription) {
    this.subscriptions.delete(subscription);
  }

  private notifySubscribers() {
    this.subscriptions.forEach((subscription) =>
      subscription(this.collections)
    );
  }

  setRepoOwner(owner: string | null) {
    if (this.appConfig.persisted) {
      storage?.setItem(
        this.appConfig.persistedOwnerKey || "owner",
        owner || ""
      );
    }

    this.adapters.forEach((adapter) => {
      adapter.setOwner(owner);
    });
    this.notifySubscribers();
  }

  setRepoName(name: string | null) {
    if (this.appConfig.persisted) {
      storage?.setItem(this.appConfig.persistedRepoKey || "repo", name || "");
    }

    this.adapters.forEach((adapter) => {
      adapter.setRepo(name);
    });
    this.notifySubscribers();
  }

  getRepoStatus() {
    return this.status;
  }

  getAppConfig() {
    return this.appConfig;
  }

  getRepoConfig() {
    return this.repoConfig;
  }

  async fetchRepoConfig(): Promise<RepoConfig> {
    const rawConfigString = await this.currentAdapter
      ?.fetchFile("config.json")
      .catch(() => {
        console.log("Could not fetch the config file");
      });

    if (!rawConfigString) {
      console.log("Setting status to empty");
      this.status = "empty";
      throw new Error("No config file found");
    }

    const rawConfig = JSON.parse(rawConfigString);
    const parsedConfig = repoConfigSchema.safeParse(rawConfig);

    let partialConfig = parsedConfig.data as unknown as RepoConfig;
    if (parsedConfig.success) {
      this.status = "valid";
    } else {
      this.status = "invalid";
    }

    this.repoConfig = partialConfig;

    return partialConfig;
  }

  async sync() {
    const [repoConfig, ...fetchedCollectionItems] = await Promise.all([
      this.fetchRepoConfig().catch((error) => {
        return {
          prBasedMutations: false,
        };
      }),
      ...this.collections.map(async (collection) => ({
        collectionId: collection.id,
        items: await this.fetchCollectionItems(collection.id).catch((error) => {
          return [];
        }),
      })),
    ]);

    console.log("Made it past the fetch in sync");

    // TODO: fetch PRs if configured
    // if (repoConfig.prBasedMutations) {
    // }

    this.notifySubscribers();
  }

  getToken() {
    const currentAdapter = this.getAdapter();
    if (currentAdapter) {
      return currentAdapter.token;
    }
  }

  setToken(token: string | null) {
    if (this.appConfig.persisted) {
      storage?.setItem(
        this.appConfig.persistedTokenKey || "token",
        token || ""
      );
    }

    this.adapters.forEach((adapter) => {
      console.log("Setting token on adapter", adapter?.name, token?.slice(-5));
      adapter.setToken(token);
    });

    this.notifySubscribers();
  }

  getAdapters() {
    return this.adapters;
  }

  setAdapter(adapter: (Adapter & IAdapter) | null) {
    if (this.appConfig.persisted) {
      storage?.setItem(
        this.appConfig.persistedAdapterKey || "adapter",
        adapter?.name || ""
      );
    }

    this.currentAdapter = adapter;
    this.notifySubscribers();
    return this;
  }

  getAdapter() {
    return this.currentAdapter;
  }

  getCollections(): Collection[] {
    return this.collections;
  }

  getCollection<T extends Collection>(
    collectionLookupValue:
      | T["id"]
      | T["names"]["singular"]
      | T["names"]["plural"]
  ): Collection | undefined {
    return this.collections.find(
      (c) =>
        c.id === collectionLookupValue ||
        Object.values(c.names).includes(collectionLookupValue)
    );
  }

  getCollectionItems<T extends Collection>(
    collectionLookupValue:
      | T["id"]
      | T["names"]["singular"]
      | T["names"]["plural"]
  ): z.infer<T["validator"]>[] {
    const collection = this.getCollection(collectionLookupValue);

    if (!collection) {
      throw new Error("Collection not found");
    }

    if (!this.collectionItems[collection.id]) {
      return [];
    }

    return this.collectionItems[collection.id];
  }

  async fetchCollectionItems<T extends Collection>(
    collectionLookupValue:
      | T["id"]
      | T["names"]["singular"]
      | T["names"]["plural"],
    force = false
  ): Promise<z.infer<T["validator"]>[]> {
    if (!this.currentAdapter) {
      throw new Error("No adapter selected");
    }

    const collection = this.getCollection(collectionLookupValue);

    if (!collection) {
      throw new Error("Collection not found");
    }

    const rawCollectionItems = await this.currentAdapter.fetchDirectory(
      `collections/${collection.names.path}`
    );

    const collectionItems =
      rawCollectionItems?.map((item) => {
        return collection.validator.parse(JSON.parse(item)) as z.infer<
          T["validator"]
        >;
      }) || [];

    // if (this.repoConfig.prBasedMutations) {
    //   const pullRequests = await this.fetchPullRequests(force);
    //   pullRequests.forEach((pr) => {
    //     // TODO: filter PRs for items in this collection and add them to collection with proper state
    //     pr.
    //   });
    // }

    this.collectionItems[collection.id] = collectionItems;

    this.notifySubscribers();

    return collectionItems;
  }

  async fetchCollectionItem<T extends Collection>(
    collectionLookupValue:
      | T["id"]
      | T["names"]["singular"]
      | T["names"]["plural"],
    itemId: z.infer<T["validator"]>["id"]
  ): Promise<z.infer<T["validator"]> | null> {
    const collection = this.getCollection(collectionLookupValue);

    if (!collection) {
      throw new Error("Collection not found");
    }

    const rawCollectionItem = await this.currentAdapter.fetchFile(
      `collections/${collection.names.path}/${itemId}.json`
    );

    if (!rawCollectionItem) {
      return null;
    }

    const collectionItem = collection.validator.parse(
      JSON.parse(rawCollectionItem)
    );

    return collectionItem;
  }

  async addToCollection<T extends Collection>(
    collectionLookupValue:
      | T["id"]
      | T["names"]["singular"]
      | T["names"]["plural"],
    data: z.infer<T["validator"]>
  ): Promise<z.infer<T["validator"]>[]> {
    if (!this.currentAdapter) {
      throw new Error("No adapter selected");
    }

    const collection = this.getCollection(collectionLookupValue);

    if (!collection) {
      throw new Error("Collection not found");
    }

    const rawNewItem: z.infer<(typeof collection)["validator"]> = {
      ...data,
      id: collection.idFunction(),
    };

    const item = collection.validator.parse(rawNewItem);

    let request: ReturnType<
      IAdapter["createCommit"] | IAdapter["createPullRequest"]
    >;

    // if (this.repoConfig.prBasedMutations) {
    //   request = this.currentAdapter.createPullRequest({
    //     title: `Add ${collection.names.singular} ${item.id}`,
    //     description: `Add ${collection.names.singular} ${item.id}`,
    //   });
    // } else {
    request = this.currentAdapter.createFile(
      `collections/${collection.names.path}/${item.id}.json`,
      JSON.stringify(item, null, 2),
      `Add ${collection.names.singular} ${item.id}`
    );
    // }

    return request.then(() => {
      this.collectionItems[collection.id] = [
        ...(this.collectionItems[collection.id] || []),
        item,
      ];

      return this.collectionItems[collection.id];
    });
  }

  async removeFromCollection<T extends Collection>(
    collectionLookupValue:
      | T["id"]
      | T["names"]["singular"]
      | T["names"]["plural"],
    itemId: z.infer<T["validator"]>["id"]
  ): Promise<z.infer<T["validator"]>[]> {
    if (!this.currentAdapter) {
      throw new Error("No adapter selected");
    }

    const collection = this.getCollection(collectionLookupValue);

    if (!collection) {
      throw new Error("Collection not found");
    }

    let request: ReturnType<
      IAdapter["createCommit"] | IAdapter["createPullRequest"]
    >;

    // if (this.repoConfig.prBasedMutations) {
    //   request = this.currentAdapter.createPullRequest({
    //     title: `Remove ${collection.names.singular} ${itemId}`,
    //     description: `Remove ${collection.names.singular} ${itemId}`,
    //   });
    // } else {
    request = this.currentAdapter.deleteFile(
      `collections/${collection.names.path}/${itemId}.json`,
      `Remove ${collection.names.singular} ${itemId}`
    );
    // }

    await request.then(() => {
      this.collectionItems[collection.id] =
        this.collectionItems[collection.id]?.filter(
          (item) => item.id !== itemId
        ) || [];
      return this.collectionItems[collection.id];
    });

    this.notifySubscribers();

    return this.collectionItems[collection.id];
  }

  async updateInCollection<T extends Collection>(
    collectionLookupValue:
      | T["id"]
      | T["names"]["singular"]
      | T["names"]["plural"],
    itemId: string,
    data: z.infer<T["validator"]>
  ): Promise<z.infer<T["validator"]>[]> {
    if (!this.currentAdapter) {
      throw new Error("No adapter selected");
    }

    const collection = this.getCollection(collectionLookupValue);

    if (!collection) {
      throw new Error("Collection not found");
    }

    const existingItem = this.collectionItems[collection.id].find(
      (item) => item.id === itemId
    );

    if (!existingItem) {
      throw new Error("Item not found");
    }

    const item = collection.validator.parse(data);

    await this.currentAdapter.updateFile(
      `collections/${collection.names.path}/${itemId}.json`,
      JSON.stringify(
        {
          ...item,
          id: itemId,
        },
        null,
        2
      ),
      `Update ${collection.names.singular} ${itemId}`
    );

    console.log("Updated item", item);

    this.collectionItems[collection.id] = this.collectionItems[
      collection.id
    ].map((_item) => {
      if (_item.id === itemId) {
        return item;
      }
      return _item;
    });

    this.notifySubscribers();

    return this.collectionItems[collection.id];
  }

  async initializeCollection(collection: Collection) {
    const adapter = this.getAdapter();

    if (!adapter) {
      throw new Error("No adapter selected");
    }

    return adapter.createFile(
      `collections/${collection.names.path}/.gitkeep`,
      "",
      `Create collection: ${collection.names.singular}`
    );
  }

  async initializeRepoConfig(repoConfig: RepoConfig) {
    const adapter = this.getAdapter();

    if (!adapter) {
      throw new Error("No adapter selected");
    }

    return adapter.createFile(
      "config.json",
      JSON.stringify(
        repoConfig ?? {
          prBasedMutations: false,
        }
      )
    );
  }

  async initialize() {
    const repoConfig = this.getRepoConfig();

    await this.initializeRepoConfig(repoConfig);

    for (const collection of this.collections) {
      await this.initializeCollection(collection);
    }

    this.status = "valid";
    this.notifySubscribers();
  }

  // Grouping together props and methods for caching PRs
  private lastFetchPullRequestTimestamp = 0;
  private cachedPullRequests: PrResponse[] = [];
  async fetchPullRequests(force = false) {
    const adapter = this.getAdapter();

    if (!adapter) {
      throw new Error("No adapter selected");
    }

    if (force) {
      this.lastFetchPullRequestTimestamp = 0;
    }

    if (this.lastFetchPullRequestTimestamp > Date.now() - 1000 * 60 * 5) {
      return this.cachedPullRequests;
    } else {
      return adapter.fetchPullRequests();
    }
  }
}
