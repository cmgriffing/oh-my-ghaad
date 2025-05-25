import { z } from "zod";

import { Collection } from "./collection";
import type { IAdapter } from "./types";
import { Adapter } from "./adapter";
import type { AppConfig, RepoConfig } from "./validators";
import { repoConfigSchema } from "./validators";

// type Subscriber = (collections: Collection[]) => void;

export class Engine {
  private adapters: (Adapter & IAdapter)[] = [];
  private currentAdapter: (Adapter & IAdapter) | null = null;
  private collections: Collection[] = [];

  private token: string;

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
  }

  // TODO: Add subscription functionality

  // private subscribers: Set<Subscriber> = new Set();

  // subscribe(subscriber: Subscriber) {
  //   this.subscribers.add(subscriber);
  // }

  // unsubscribe(subscriber: Subscriber) {
  //   this.subscribers.delete(subscriber);
  // }

  // private notifySubscribers() {
  //   this.subscribers.forEach((subscriber) => subscriber(this.collections));
  // }

  setRepoOwner(owner: string) {
    this.adapters.forEach((adapter) => {
      adapter.setOwner(owner);
    });
  }

  setRepoName(name: string) {
    this.adapters.forEach((adapter) => {
      adapter.setRepo(name);
    });
  }

  getAppConfig() {
    return this.appConfig;
  }

  getRepoConfig() {
    return this.repoConfig;
  }

  setRepoConfig(repoConfig: RepoConfig) {
    this.repoConfig = repoConfig;
  }

  async fetchRepoConfig(): Promise<RepoConfig> {
    const rawConfigString = await this.currentAdapter?.getFile("config.json");

    if (!rawConfigString) {
      throw new Error("Failed to fetch repo config");
    }

    const rawConfig = JSON.parse(rawConfigString);
    const parsedConfig = repoConfigSchema.parse(rawConfig);

    this.setRepoConfig(parsedConfig);

    return parsedConfig;
  }

  getToken() {
    return this.token;
  }

  setToken(token: string) {
    this.token = token;
  }

  getAdapters() {
    return this.adapters;
  }

  setAdapter(adapter: (Adapter & IAdapter) | null) {
    this.currentAdapter = adapter;
  }

  getAdapter() {
    return this.currentAdapter;
  }

  async getCollections(): Promise<Collection[]> {
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

  async getCollectionItems<T extends Collection>(
    collectionLookupValue:
      | T["id"]
      | T["names"]["singular"]
      | T["names"]["plural"]
  ): Promise<z.infer<T["validator"]>[]> {
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
      | T["names"]["plural"]
  ): Promise<z.infer<T["validator"]>[]> {
    if (!this.currentAdapter) {
      throw new Error("No adapter selected");
    }

    const collection = this.getCollection(collectionLookupValue);

    if (!collection) {
      throw new Error("Collection not found");
    }

    const rawCollectionItems = await this.currentAdapter.getDirectory(
      `collections/${collection.names.plural}`
    );

    const collectionItems =
      rawCollectionItems?.map((item) => {
        return collection.validator.parse(JSON.parse(item)) as z.infer<
          T["validator"]
        >;
      }) || [];

    this.collectionItems[collection.id] = collectionItems;

    return collectionItems;
  }

  async addToCollection<T extends Collection>(
    collectionLookupValue:
      | T["id"]
      | T["names"]["singular"]
      | T["names"]["plural"],
    data: z.infer<T["validator"]>
  ): Promise<T[]> {
    if (!this.currentAdapter) {
      throw new Error("No adapter selected");
    }

    const collection = this.getCollection(collectionLookupValue);

    if (!collection) {
      throw new Error("Collection not found");
    }

    const item = collection.validator.parse(data);

    if (this.collectionItems[collection.id]) {
      this.collectionItems[collection.id].push(item);
    } else {
      this.collectionItems[collection.id] = [item];
    }

    let request: ReturnType<
      IAdapter["createCommit"] | IAdapter["createPullRequest"]
    >;

    if (this.repoConfig.prBasedMutations) {
      request = this.currentAdapter.createPullRequest({
        title: `Add ${collection.names.singular} ${item.id}`,
        description: `Add ${collection.names.singular} ${item.id}`,
      });
    } else {
      request = this.currentAdapter.createCommit({
        message: `Add ${collection.names.singular} ${item.id}`,
      });
    }

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
  ): Promise<T[]> {
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

    if (this.repoConfig.prBasedMutations) {
      request = this.currentAdapter.createPullRequest({
        title: `Remove ${collection.names.singular} ${itemId}`,
        description: `Remove ${collection.names.singular} ${itemId}`,
      });
    } else {
      request = this.currentAdapter.createCommit({
        message: `Remove ${collection.names.singular} ${itemId}`,
      });
    }

    return request.then(() => {
      this.collectionItems[collection.id] =
        this.collectionItems[collection.id]?.filter(
          (item) => item.id !== itemId
        ) || [];
      return this.collectionItems[collection.id];
    });
  }

  // async updateInCollection<T extends Collection>(
  //   collectionLookupValue:
  //     | T["id"]
  //     | T["names"]["singular"]
  //     | T["names"]["plural"],
  //   itemId: string,
  //   data: z.infer<T["validator"]>
  // ): Promise<T> {
  //   if (!this.currentAdapter) {
  //     throw new Error("No adapter selected");
  //   }

  //   const collection = this.getCollection(collectionLookupValue);

  //   if (!collection) {
  //     throw new Error("Collection not found");
  //   }

  //   const existingItem = this.collectionItems[collection.id].find(
  //     (item) => item.id === itemId
  //   );

  //   if (!existingItem) {
  //     throw new Error("Item not found");
  //   }

  //   const item = collection.validator.parse(data);

  //   this.collectionItems[collection.id] = this.collectionItems[
  //     collection.id
  //   ].map((item) => {
  //     if (item.id === itemId) {
  //       return item;
  //     }
  //     return item;
  //   });

  //   throw new Error("Not implemented");
  // }
}
