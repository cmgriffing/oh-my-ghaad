import { Collection } from "./collection";

export type ValidRepoStatus = "valid" | "pending" | "empty";
export type InvalidRepoStatus = "invalid" | "unknown";
export type RepoStatus = ValidRepoStatus | InvalidRepoStatus;

export type CollectionStatus = "uninitialized" | "valid";
export type CollectionItemStatus = "pending" | "valid" | "invalid";
export type PendingCollectionItemType = "create" | "update" | "delete";

export interface AdapterProps {
  clientId: string;
  redirectUri: string;
  accessManagementUrl: string;
  scopes: string[];
}

export type Subscription = (collections: Collection[]) => void | Promise<void>;

export interface RepositoryResponse {
  id: string | number;
  org: string;
  name: string;
  url: string;
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
  readonly oauthUrl: string;
  readonly baseUrl: string;

  fetchRepositories(): Promise<RepositoryResponse[]>;

  fetchFile(filePath: string): Promise<string>;
  fetchDirectory(directoryPath: string): Promise<string[]>;

  createFile(
    filePath: string,
    content: string,
    message?: string
  ): Promise<void>;
  updateFile(
    filePath: string,
    content: string,
    message?: string
  ): Promise<void>;
  deleteFile(filePath: string, message?: string): Promise<void>;
}

export interface BaseCollectionItem {
  id: string;
  fileName: string;
}
