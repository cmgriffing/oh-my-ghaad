import { Adapter } from "@oh-my-ghaad/core";
import type { CommitRequest, IAdapter } from "@oh-my-ghaad/core";
import { GitbeakerRequestError, Gitlab } from "@gitbeaker/rest";
import { base64ToUtf8, utf8ToBase64 } from "./utils";
// import { base64ToUtf8, utf8ToBase64 } from "./utils";

// type EndpointPath = keyof Endpoints;

export class GitlabAdapter extends Adapter implements IAdapter {
  readonly name = "GitLab";
  readonly icon = "https://about.gitlab.com/images/ico/favicon-192x192.png";
  readonly primaryColor = "#FC6D26";
  readonly secondaryColor = "#000000";
  readonly oauthUrl = "https://gitlab.com/oauth/authorize";
  readonly baseUrl = "https://gitlab.com";

  private api: InstanceType<typeof Gitlab>;

  constructor(props) {
    super(props);

    this.api = new Gitlab({
      host: this.baseUrl,
      oauthToken: this.token,
    });
  }

  setToken(token: string | null) {
    super.setToken(token);

    this.api = new Gitlab({
      host: this.baseUrl,
      oauthToken: this.token,
    });
  }

  async fetchRepositories() {
    const repositoriesOrError = await this.api.Projects.all({
      membership: true,
      perPage: 100,
    }).catch((error: GitbeakerRequestError) => {
      console.error(error);
      return error;
    });

    if (repositoriesOrError instanceof Error) {
      if (
        repositoriesOrError.cause.response.status === 401 &&
        this.unauthorizedHandler
      ) {
        this.unauthorizedHandler();
      }
      throw new Error("Failed to fetch projects");
    }

    const repositories = repositoriesOrError.map((repository) => ({
      id: repository.id,
      org: repository.namespace.path,
      name: repository.path,
      url: repository.web_url as string,
    }));

    return repositories.flat();
  }

  async fetchFile(path: string) {
    const fileOrError = await this.api.RepositoryFiles.show(
      this.repo,
      path,
      "HEAD"
    ).catch((error: GitbeakerRequestError) => {
      console.error(error);
      return error;
    });

    if (fileOrError instanceof Error) {
      if (
        fileOrError.cause.response.status === 401 &&
        this.unauthorizedHandler
      ) {
        this.unauthorizedHandler();
      }
      throw new Error("Failed to fetch file");
    }

    if (!fileOrError.content) {
      throw new Error("Failed to fetch file");
    }
    const content = base64ToUtf8(fileOrError.content);
    if (!content) {
      console.error("Failed to decode file");
    }

    return content || "";
  }

  async fetchDirectory(directoryPath: string) {
    const filesOrError = await this.api.Repositories.allRepositoryTrees(
      this.repo,
      {
        path: directoryPath,
      }
    ).catch((error: GitbeakerRequestError) => {
      console.error(error);
      return error;
    });

    if (filesOrError instanceof Error) {
      if (
        filesOrError.cause.response.status === 401 &&
        this.unauthorizedHandler
      ) {
        this.unauthorizedHandler();
      }
      throw new Error("Failed to fetch directory");
    }

    if (!Array.isArray(filesOrError)) {
      throw new Error("Path is not a directory");
    }

    return Promise.all(
      filesOrError
        .filter((file) => file.path.endsWith(".json"))
        .map((file) => {
          return this.fetchFile(file.path);
        })
    );
  }

  async createFile(path: string, content: string, message?: string) {
    const branchesOrError = await this.api.Branches.all(this.repo).catch(
      (error: GitbeakerRequestError) => {
        console.error(error);
        return error;
      }
    );

    if (branchesOrError instanceof Error) {
      if (
        branchesOrError.cause.response.status === 401 &&
        this.unauthorizedHandler
      ) {
        this.unauthorizedHandler();
      }
      throw new Error("Failed to fetch default branch");
    }

    const branch = branchesOrError.find((branch) => branch.default);

    if (!branch) {
      throw new Error("Failed to find default branch");
    }

    const existingFileOrError = await this.api.RepositoryFiles.show(
      this.repo,
      path,
      branch.name
    ).catch((error: GitbeakerRequestError) => {
      console.error(error);
      return error;
    });

    if (existingFileOrError instanceof Error) {
      if (
        existingFileOrError.cause.response.status === 401 &&
        this.unauthorizedHandler
      ) {
        this.unauthorizedHandler();
      }
      throw new Error("Failed to fetch existing file");
    }

    if (existingFileOrError) {
      throw new Error("File already exists");
    }

    const createdFileOrError = await this.api.Commits.create(
      this.repo,
      branch.name,
      message || `Create file: ${path}`,
      [
        {
          action: "create",
          filePath: path,
          content: utf8ToBase64(content),
          encoding: "base64",
        },
      ]
    ).catch((error: GitbeakerRequestError) => {
      console.error(error);
      return error;
    });

    if (createdFileOrError instanceof Error) {
      if (
        createdFileOrError.cause.response.status === 401 &&
        this.unauthorizedHandler
      ) {
        this.unauthorizedHandler();
      }
      throw new Error("Failed to create file");
    }

    return;
  }

  async updateFile(path: string, content: string, message?: string) {
    const branchesOrError = await this.api.Branches.all(this.repo).catch(
      (error: GitbeakerRequestError) => {
        console.error(error);
        return error;
      }
    );

    if (branchesOrError instanceof Error) {
      if (
        branchesOrError.cause.response.status === 401 &&
        this.unauthorizedHandler
      ) {
        this.unauthorizedHandler();
      }
      throw new Error("Failed to fetch default branch");
    }

    const branch = branchesOrError.find((branch) => branch.default);

    if (!branch) {
      throw new Error("Failed to find default branch");
    }

    const existingFileOrError = await this.api.RepositoryFiles.show(
      this.repo,
      path,
      branch.name
    ).catch((error: GitbeakerRequestError) => {
      console.error(error);
      return error;
    });

    if (existingFileOrError instanceof Error) {
      if (
        existingFileOrError.cause.response.status === 401 &&
        this.unauthorizedHandler
      ) {
        this.unauthorizedHandler();
      }
      throw new Error("Failed to fetch existing file");
    }

    if (!existingFileOrError) {
      throw new Error("File does not exist");
    }

    const createdFileOrError = await this.api.Commits.create(
      this.repo,
      branch.name,
      message || `Create file: ${path}`,
      [
        {
          action: "update",
          filePath: path,
          content: utf8ToBase64(content),
          encoding: "base64",
        },
      ]
    ).catch((error: GitbeakerRequestError) => {
      console.error(error);
      return error;
    });

    if (createdFileOrError instanceof Error) {
      if (
        createdFileOrError.cause.response.status === 401 &&
        this.unauthorizedHandler
      ) {
        this.unauthorizedHandler();
      }
      throw new Error("Failed to create file");
    }

    return;
  }

  async deleteFile(path: string, message?: string) {
    const responseOrError = await this.api.RepositoryFiles.remove(
      this.repo,
      path,
      "HEAD",
      message || `Delete file: ${path}`
    ).catch((error: GitbeakerRequestError) => {
      console.error(error);
      return error;
    });

    if (responseOrError instanceof Error) {
      if (
        responseOrError.cause.response.status === 401 &&
        this.unauthorizedHandler
      ) {
        this.unauthorizedHandler();
      }
      throw new Error("Failed to delete file");
    }

    return;
  }

  // TODO: Why did I add this method?
  async createCommit({}: CommitRequest) {
    return;
  }

  // -----------------------------------------------------------------------------
  // TODO: Pull Requests and File History are not yet implemented or used in the demo app yet
  // -----------------------------------------------------------------------------
  async fetchFileHistory(path: string) {
    return [];
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
