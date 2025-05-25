import { z } from "zod";

export const appConfigSchema = z.object({
  appName: z.string(),
  appId: z.string(),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

export const repoConfigSchema = z.object({
  prBasedMutations: z.boolean().default(true),
});

export type RepoConfig = z.infer<typeof repoConfigSchema>;
