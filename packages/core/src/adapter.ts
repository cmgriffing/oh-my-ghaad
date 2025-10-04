import { AdapterProps } from "./types";

export class Adapter implements AdapterProps {
  clientId: string;
  redirectUri: string;
  token: string | null;
  owner: string | null;
  repo: string | null;
  accessManagementUrl: string;
  scopes: string[];
  protected unauthorizedHandler: (() => void | Promise<void>) | null = null;

  constructor(props: AdapterProps) {
    this.clientId = props.clientId;
    this.redirectUri = props.redirectUri;
    this.accessManagementUrl = props.accessManagementUrl;
    this.scopes = props.scopes;
  }

  setOwner(owner: string | null) {
    this.owner = owner;
  }

  setRepo(repo: string | null) {
    this.repo = repo;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  setUnauthorizedHandler(handler: () => void | Promise<void>) {
    this.unauthorizedHandler = handler;
  }
}
