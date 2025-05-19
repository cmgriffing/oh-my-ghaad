import type { Adapter } from "@oh-my-ghaad/core";

export class GithubAdapter implements Adapter {
  clientId: string;
  redirectUri: string;

  name = "Github";
  icon = "https://github.com/favicon.ico";
  primaryColor = "#000000";
  secondaryColor = "#ffffff";

  constructor({
    clientId,
    redirectUri,
  }: {
    clientId: string;
    redirectUri: string;
  }) {
    this.clientId = clientId;
    this.redirectUri = redirectUri;
  }

  async getFile() {
    return "";
  }

  async getFileHistory() {
    return "";
  }
  async createCommit() {
    return "";
  }

  async getPullRequests() {
    return "";
  }

  async createPullRequest() {
    return "";
  }

  async getPullRequest() {
    return "";
  }

  async updatePullRequest() {
    return "";
  }

  async deletePullRequest() {
    return "";
  }
}
