import { Adapter } from "@oh-my-ghaad/core";
import type { CommitRequest, IAdapter } from "@oh-my-ghaad/core";
import type { Endpoints, OctokitResponse } from "@octokit/types";
// import {} from "@octiokit/rest"
import { endpoint } from "@octokit/endpoint";
import { base64ToUtf8, utf8ToBase64 } from "./utils";

type EndpointPath = keyof Endpoints;

export class GithubAdapter extends Adapter implements IAdapter {
  readonly name = "Github";
  readonly icon = "https://github.com/fluidicon.png";
  readonly primaryColor = "#000000";
  readonly secondaryColor = "#ffffff";
  readonly oauthUrl = "https://github.com/login/oauth/authorize";
  readonly baseUrl = "https://github.com";

  constructor(props) {
    super(props);
  }

  async fetchRepositories() {
    const url: EndpointPath = "GET /user/installations";

    type Endpoint = Endpoints[typeof url];
    type Parameters = Endpoint["parameters"];

    const pathParams: Parameters = {};

    const endpointData = endpoint(url, pathParams);

    console.log("token", this.token?.slice(-5));

    const response = await fetch(endpointData.url, {
      method: endpointData.method,
      headers: {
        ...endpointData.headers,
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 && this.unauthorizedHandler) {
        this.unauthorizedHandler();
      }
      throw new Error("Failed to fetch installations");
    }

    const responseJson = await response.json();

    if (!responseJson.installations) {
      throw new Error("Failed to fetch installations");
    }

    const nestedRepositories = await Promise.all(
      responseJson.installations.map(async (installation) => {
        const url: EndpointPath =
          "GET /user/installations/{installation_id}/repositories";

        type Endpoint = Endpoints[typeof url];
        type Parameters = Endpoint["parameters"];
        // TODO:  figure out why we can't use this at the point of response parsing
        // log out values to find out what we actually get or cast if its accurate
        type EndpointResponse = Endpoint["response"];

        const pathParams: Parameters = {
          installation_id: installation.id,
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
          if (response.status === 401 && this.unauthorizedHandler) {
            this.unauthorizedHandler();
          }
          throw new Error("Failed to fetch repositories");
        }

        const responseJson =
          (await response.json()) as EndpointResponse["data"];

        console.log("lol", {
          responseJson,
        });

        if (!responseJson.repositories) {
          throw new Error("Failed to fetch repositories");
        }

        console.log("reponseData", responseJson);

        return responseJson.repositories.map((repository) => ({
          id: repository.id,
          org: repository.owner.login,
          name: repository.name,
          url: repository.html_url,
        }));
      })
    );

    return nestedRepositories.flat();
  }

  private async fetchPathContents(path: string) {
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
      if (response.status === 401 && this.unauthorizedHandler) {
        this.unauthorizedHandler();
      }
      throw new Error("Failed to fetch file");
    }

    const responseJson = (await response.json()) as EndpointResponse["data"];

    return responseJson;
  }

  async fetchFile(path: string) {
    const responseJson = await this.fetchPathContents(path);

    if (Array.isArray(responseJson) || responseJson.type !== "file") {
      throw new Error("Path is not a file");
    }

    if (!responseJson.content) {
      throw new Error("Failed to fetch file");
    }
    const content = base64ToUtf8(responseJson.content);
    if (!content) {
      console.error("Failed to decode file");
    }

    return content || "";
  }

  async fetchFileHistory(path: string) {
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
      if (response.status === 401 && this.unauthorizedHandler) {
        this.unauthorizedHandler();
      }
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

  async fetchDirectory(directoryPath: string) {
    const responseJson = await this.fetchPathContents(directoryPath);

    if (!Array.isArray(responseJson)) {
      throw new Error("Path is not a file");
    }

    return Promise.all(
      responseJson
        .filter((file) => file.path.endsWith(".json"))
        .map((file) => {
          return this.fetchFile(file.path);
        })
    );
  }

  private async putFile(
    path: string,
    content: string,
    message?: string,
    sha?: string
  ) {
    const url: EndpointPath = "PUT /repos/{owner}/{repo}/contents/{path}";

    type Endpoint = Endpoints[typeof url];
    type Parameters = Endpoint["parameters"];

    const pathParams: Parameters = {
      owner: this.owner,
      repo: this.repo,
      path: path,
      message: message || `Create file: ${path}`,
      content: utf8ToBase64(content),
    };

    if (sha) {
      pathParams.sha = sha;
    }

    const endpointData = endpoint(url, pathParams);

    const response = await fetch(endpointData.url, {
      method: endpointData.method,
      headers: {
        ...endpointData.headers,
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(endpointData.body),
    });

    if (!response.ok) {
      if (response.status === 401 && this.unauthorizedHandler) {
        this.unauthorizedHandler();
      }
      throw new Error("Failed to create file");
    }

    return;
  }

  async createFile(path: string, content: string, message?: string) {
    return this.putFile(path, content, message);
  }

  async updateFile(path: string, content: string, message?: string) {
    const fileJson = await this.fetchPathContents(path);

    if (Array.isArray(fileJson) || fileJson.type !== "file") {
      throw new Error("Path is not a file");
    }

    return this.putFile(path, content, message, fileJson.sha);
  }

  async deleteFile(path: string, message?: string) {
    const fileJson = await this.fetchPathContents(path);

    if (Array.isArray(fileJson) || fileJson.type !== "file") {
      throw new Error("Path is not a file");
    }

    const url: EndpointPath = "DELETE /repos/{owner}/{repo}/contents/{path}";

    type Endpoint = Endpoints[typeof url];
    type Parameters = Endpoint["parameters"];

    const pathParams: Parameters = {
      owner: this.owner,
      repo: this.repo,
      path: path,
      message: message || `Delete file: ${path}`,
      sha: fileJson.sha,
    };

    const endpointData = endpoint(url, pathParams);

    const response = await fetch(endpointData.url, {
      method: endpointData.method,
      headers: {
        ...endpointData.headers,
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(endpointData.body),
    });

    if (!response.ok) {
      if (response.status === 401 && this.unauthorizedHandler) {
        this.unauthorizedHandler();
      }
      throw new Error("Failed to delete file");
    }

    return;
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
      if (response.status === 401 && this.unauthorizedHandler) {
        this.unauthorizedHandler();
      }
      throw new Error("Failed to create commit");
    }
  }

  async fetchPullRequests() {
    return [];
  }

  async createPullRequest() {
    return;
  }

  async fetchPullRequest() {
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
