import { RepoConfig } from "@oh-my-ghaad/core";

import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";

const repoState: Record<
  string,
  {
    repoConfig: RepoConfig | undefined;
    collectionFiles: [];
    pullRequests: any[];
  }
> = {
  basic: {
    repoConfig: {},
    collectionFiles: [],
    pullRequests: [],
  },
  empty: {
    repoConfig: undefined,
    collectionFiles: [],
    pullRequests: [],
  },
};

export const handlers = [
  // getFile
  http.get(
    "https://api.github.com/repos/:owner/:repo/contents/:path",
    ({ params }) => {
      const { owner, repo, path } = params;

      console.log('Captured a "GET /posts" request');

      return HttpResponse.json({
        id: "c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d",
        firstName: "John",
        lastName: "Maverick",
      });
    }
  ),
  // getFileHistory
  http.get("/repos/:owner/:repo/commits", ({ params }) => {
    console.log('Captured a "POST /posts" request');
  }),
  // http.delete("/posts/:id", ({ params }) => {
  //   console.log(`Captured a "DELETE /posts/${params.id}" request`);
  // }),
];

const worker = setupWorker();
worker.start();
worker.use(...(handlers as any));
