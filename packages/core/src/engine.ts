import { z } from "zod";

import { Collection } from "./collection";
import type { Adapter, AppConfig, RepoConfig } from "./types";

export class Engine {
  private adapters: Adapter[] = [];
  private currentAdapter: Adapter | null = null;
  private collections: Collection[] = [];

  private repository: string;
  private token: string;

  private appConfig: AppConfig;
  private repoConfig: RepoConfig;

  constructor({
    appConfig,
    adapters,
    collections,
  }: {
    adapters: Adapter[];
    collections: Collection[];
    appConfig: AppConfig;
  }) {
    this.appConfig = appConfig;
    this.adapters = adapters;
    this.collections = collections;
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

  fetchRepoConfig() {
    // TODO: Fetch repo config
  }

  getToken() {
    return this.token;
  }

  setToken(token: string) {
    this.token = token;
  }

  getRepository() {
    return this.repository;
  }

  setRepository(repository: string) {
    this.repository = repository;
  }

  getAdapters() {
    return this.adapters;
  }

  setAdapter(adapter: Adapter | null) {
    this.currentAdapter = adapter;
  }

  getAdapter() {
    return this.currentAdapter;
  }

  // TODO: Should this be getCollectionItems
  async getCollections(): Promise<Collection[]> {
    if (!this.currentAdapter) {
      throw new Error("No adapter selected");
    }
    throw new Error("Not implemented");
  }

  async fetchCollections() {
    // TODO: Fetch collections
  }

  async getCollection<T extends Collection>(
    collection: T
  ): Promise<z.infer<T["validator"]>> {
    if (!this.currentAdapter) {
      throw new Error("No adapter selected");
    }

    if (!this.collections.find((c) => c.id === collection.id)) {
      throw new Error("Collection not found");
    }

    // TODO: Get collection

    throw new Error("Not implemented");
  }

  async getCollectionItems<T extends Collection>(
    collection: T
  ): Promise<z.infer<T["validator"]>[]> {
    if (!this.currentAdapter) {
      throw new Error("No adapter selected");
    }

    if (!this.collections.find((c) => c.id === collection.id)) {
      throw new Error("Collection not found");
    }

    // TODO: Get collection items

    throw new Error("Not implemented");
  }

  async fetchCollectionItems<T extends Collection>(
    collection: T
  ): Promise<z.infer<T["validator"]>[]> {
    if (!this.currentAdapter) {
      throw new Error("No adapter selected");
    }

    if (!this.collections.find((c) => c.id === collection.id)) {
      throw new Error("Collection not found");
    }

    // TODO: Fetch collection items

    throw new Error("Not implemented");
  }

  async addToCollection<T extends Collection>(
    collection: T,
    data: z.infer<T["validator"]>
  ): Promise<T> {
    if (!this.currentAdapter) {
      throw new Error("No adapter selected");
    }

    if (!this.collections.find((c) => c.id === collection.id)) {
      throw new Error("Collection not found");
    }

    const item = collection.validator.parse(data);

    // TODO: Add item

    throw new Error("Not implemented");
  }
  async removeFromCollection<T extends Collection>(
    collection: T,
    itemId: z.infer<T["validator"]>["id"]
  ): Promise<T> {
    if (!this.currentAdapter) {
      throw new Error("No adapter selected");
    }

    if (!this.collections.find((c) => c.id === collection.id)) {
      throw new Error("Collection not found");
    }

    // TODO: Remove item

    throw new Error("Not implemented");
  }

  async updateInCollection<T extends Collection>(
    collection: T,
    data: z.infer<T["validator"]>
  ): Promise<T> {
    if (!this.currentAdapter) {
      throw new Error("No adapter selected");
    }

    if (!this.collections.find((c) => c.id === collection.id)) {
      throw new Error("Collection not found");
    }

    const item = collection.validator.parse(data);

    // TODO: Update item

    throw new Error("Not implemented");
  }
}
