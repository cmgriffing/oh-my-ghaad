export interface AdapterProps {
  clientId: string;
  redirectUri: string;
  token: string;
  owner: string;
  repo: string;
}

export interface PrResponse {
  id: string;
  title: string;
  description: string;
  commitSha?: string;
  createdAt: string;
}

export type PrRequest = Omit<PrResponse, "id" | "createdAt">;

export interface CommitResponse {
  commitSha: string;
  message: string;
  commitDate: string;
  authorName: string;
  authorImageUrl: string;
}

export type CommitRequest = Pick<CommitResponse, "message">;

export interface IAdapter extends AdapterProps {
  readonly name: string;
  readonly icon: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;

  getFile(filePath: string): Promise<string>;
  getFileHistory(filePath: string): Promise<CommitResponse[]>;
  getDirectory(directoryPath: string): Promise<string[]>;

  createCommit(commitRequest: CommitRequest): Promise<void>;

  getPullRequests(): Promise<PrResponse[]>;
  createPullRequest(prRequest: PrRequest): Promise<void>;
  getPullRequest(): Promise<PrResponse>;
  updatePullRequest(prRequest: PrRequest): Promise<void>;
  deletePullRequest(id: string): Promise<void>;
}

export interface BaseCollectionItem {
  id: string;
  fileName: string;
}
