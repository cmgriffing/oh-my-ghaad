import { AdapterProps } from "./types";

export class Adapter implements AdapterProps {
  clientId: string;
  redirectUri: string;
  token: string;
  owner: string;
  repo: string;

  constructor(props: AdapterProps) {
    this.clientId = props.clientId;
    this.redirectUri = props.redirectUri;
    this.token = props.token;
    this.owner = props.owner;
    this.repo = props.repo;
  }

  setOwner(owner: string) {
    this.owner = owner;
  }

  setRepo(repo: string) {
    this.repo = repo;
  }
}
