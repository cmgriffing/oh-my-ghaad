import { z } from "zod";
import { RepoStatus } from "./types";

export const appConfigSchema = z.object({
  appName: z.string(),
  appId: z.string(),
  persisted: z.boolean().default(true),
  persistedTokenKey: z.string().default("token"),
  persistedRepoKey: z.string().default("repo"),
  persistedOwnerKey: z.string().default("owner"),
  persistedAdapterKey: z.string().default("adapter"),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

export const repoConfigSchema = z.object({
  prBasedMutations: z.boolean().default(true),
});

export type RepoConfig = z.infer<typeof repoConfigSchema> & {
  status: RepoStatus;
};
