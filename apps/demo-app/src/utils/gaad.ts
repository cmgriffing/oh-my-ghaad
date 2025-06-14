import { z } from "zod";
import { typeidUnboxed } from "typeid-js";

import { Engine, Collection } from "@oh-my-ghaad/core";
import { GithubAdapter } from "@oh-my-ghaad/github";

const usDateFormat = z.string().regex(
  /^(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1])\/\d{4}$/, // Regex for MM/DD/YYYY format
  "Invalid date format. Please use MM/DD/YYYY."
);

export const conferenceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  url: z.string().url(),
  startDate: usDateFormat,
  endDate: usDateFormat,
  location: z.string().min(1),
  description: z.string().optional(),
  cfpStartDate: usDateFormat.or(z.string().max(0)),
  cfpEndDate: usDateFormat,
  cfpUrl: z.string().url(),
  proposedTalks: z.array(
    z.object({
      id: z.string(),
      status: z.enum(["pending", "proposed", "declined", "accepted"]),
    })
  ),
});

export const conferenceCollection = new Collection({
  id: typeidUnboxed("collection"),
  idFunction: () => typeidUnboxed("conference"),
  names: {
    singular: "Conference",
    plural: "Conferences",
    path: "conferences",
  },
  validator: conferenceSchema,
});

export const talkSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  outline: z.string(),
  idealDurationMinutes: z.number(),
});

export const talkCollection = new Collection({
  id: typeidUnboxed("collection"),
  idFunction: () => typeidUnboxed("talk"),
  names: {
    singular: "Talk",
    plural: "Talks",
    path: "talks",
  },
  validator: talkSchema,
});

export const GAAD = new Engine({
  appConfig: {
    appName: "CFP Tracker",
    persisted: true,
  },
  adapters: [
    new GithubAdapter({
      clientId: "Iv23liQdVI6HDhw9peVU",
      redirectUri: process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI!,
      accessManagementUrl:
        "https://github.com/apps/cfp-tracker/installations/new",
    }),
  ],
  collections: [conferenceCollection, talkCollection],
});
