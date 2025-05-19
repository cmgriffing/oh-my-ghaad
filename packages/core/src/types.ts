export interface AppConfig {
  appName: string;
  appId: string;
}

export interface RepoConfig {
  prBasedMutations: boolean;
}

export interface Adapter {
  name: string;
  icon: string;
  primaryColor: string;
  secondaryColor: string;
  clientId: string;
  redirectUri: string;

  getFile(filePath: string): Promise<string>;
  getFileHistory(filePath: string): Promise<string>;

  createCommit(): Promise<string>;

  getPullRequests(): Promise<string>;
  createPullRequest(): Promise<string>;
  getPullRequest(): Promise<string>;
  updatePullRequest(): Promise<string>;
  deletePullRequest(): Promise<string>;
}

export interface BaseCollectionItem {
  id: string;
  fileName: string;
}
