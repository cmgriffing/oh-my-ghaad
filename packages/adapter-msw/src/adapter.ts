import { Adapter } from "@oh-my-ghaad/core";
import type { CommitRequest, IAdapter } from "@oh-my-ghaad/core";
import type { Endpoints } from "@octokit/types";
// import {} from "@octiokit/rest"
import { endpoint } from "@octokit/endpoint";
import { base64ToUtf8 } from "./utils";

import "./msw-setup";

type EndpointPath = keyof Endpoints;

export class MSWAdapter extends Adapter implements IAdapter {
  readonly name = "MSW";
  readonly icon = "https://mswjs.com/icon.svg";
  readonly primaryColor = "#FF6A33";
  readonly secondaryColor = "#000000";

  constructor(props) {
    super(props);
  }

  async getFile(path: string) {
    const url: EndpointPath = "GET /repos/{owner}/{repo}/contents/{path}";

    type Endpoint = Endpoints[typeof url];
    type Parameters = Endpoint["parameters"];
    // TODO:  figure out why we can't use this at the point of response parsing
    // log out values to find out what we actually get or cast if its accurate
    type EndpointResponse = Endpoint["response"];

    const pathParams: Parameters = {
      owner: this.owner,
      repo: this.repo,
      path: path,
    };

    const endpointData = endpoint(url, pathParams);

    const response = await fetch(endpointData.url, {
      method: endpointData.method,
      headers: {
        ...endpointData.headers,
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch file");
    }

    const responseJson = await response.json();

    if (!responseJson.content) {
      throw new Error("Failed to fetch file");
    }
    const content = base64ToUtf8(responseJson.content);
    if (!content) {
      console.error("Failed to decode file");
    }

    return content || "";
  }

  async getFileHistory(path: string) {
    const url: EndpointPath = "GET /repos/{owner}/{repo}/commits";

    type Endpoint = Endpoints[typeof url];
    type Parameters = Endpoint["parameters"];

    const pathParams: Parameters = {
      owner: this.owner,
      repo: this.repo,
      path: path,
    };

    const endpointData = endpoint(url, pathParams);

    const response = await fetch(endpointData.url, {
      method: endpointData.method,
      headers: {
        ...endpointData.headers,
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch file history");
    }

    const responseJson = await response.json();

    if (!responseJson.commits) {
      throw new Error("Failed to fetch file history");
    }

    // TODO: figure out the actual response types because this commit is any at the moment
    return responseJson.commits.map((commit) => ({
      commitId: commit.sha,
      commitMessage: commit.commit.message,
      commitDate: commit.commit.committer.date,
      authorName: commit.commit.author.name,
      authorImageUrl: commit.author.avatar_url,
    }));
  }

  async getDirectory(directoryPath: string) {
    return [];
  }

  async createCommit({}: CommitRequest) {
    const url: EndpointPath = "PUT /repos/{owner}/{repo}/contents/{path}";

    type Endpoint = Endpoints[typeof url];
    type Parameters = Endpoint["parameters"];

    const pathParams: Parameters = {
      owner: this.owner,
      repo: this.repo,
      path: "foo.bar",
      message: "",
      // branch,
      content: "",
    };

    const endpointData = endpoint(url, pathParams);

    const response = await fetch(endpointData.url, {
      method: endpointData.method,
      headers: {
        ...endpointData.headers,
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to create commit");
    }
  }

  async getPullRequests() {
    return [];
  }

  async createPullRequest() {
    return;
  }

  async getPullRequest() {
    return {
      id: "",
      title: "",
      description: "",
      commitSha: "",
      createdAt: "",
    };
  }

  async updatePullRequest() {
    return;
  }

  async deletePullRequest() {
    return;
  }
}
