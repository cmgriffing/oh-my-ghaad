import { z } from "zod";
import { typeidUnboxed } from "typeid-js";

import { Engine, Collection } from "@oh-my-ghaad/core";
import { GithubAdapter } from "@oh-my-ghaad/github";

export const GAAD = new Engine({
  adapters: [
    new GithubAdapter({
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
      redirectUri: process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI!,
    }),
  ],
  collections: [
    new Collection({
      id: typeidUnboxed("collection"),
      idFunction: () => typeidUnboxed("conference"),
      names: {
        singular: "Conference",
        plural: "Conferences",
        path: "conferences",
      },
      validator: z.object({
        id: z.string(),
        name: z.string(),
        url: z.string().url(),
        startDate: z.string().date(),
        endDate: z.string().date(),
        location: z.string(),
        description: z.string().optional(),
        cfpStartDate: z.string().date().optional(),
        cfpEndDate: z.string().date(),
        cfpUrl: z.string().url(),
        proposedTalkIds: z.array(z.string()),
      }),
    }),
    new Collection({
      id: typeidUnboxed("collection"),
      idFunction: () => typeidUnboxed("talk"),
      names: {
        singular: "talk",
        plural: "talks",
        path: "talks",
      },
      validator: z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        outline: z.string(),
        durationMinutes: z.number(),
      }),
    }),
  ],
});
