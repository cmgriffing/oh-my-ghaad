"use client";

import { LinkButton } from "@/components/LinkButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GAAD } from "@/utils/gaad";
import { RepositoryResponse } from "@oh-my-ghaad/core";
import { useGHaaD } from "@oh-my-ghaad/react";
import { Cog, LogOut, OctagonAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import router from "next/router";
import { useEffect, useState } from "react";

export default function Settings() {
  const [repositories, setRepositories] = useState<RepositoryResponse[]>([]);
  const router = useRouter();

  const { engine } = useGHaaD(GAAD, (collections) => {
    console.log("Collections", collections);
  });

  const currentAdapter = engine.getAdapter();
  const { repo, owner, baseUrl } = currentAdapter || {
    repo: null,
    owner: null,
    baseUrl: null,
  };

  const repoName = `${owner}/${repo}`;

  console.log({ repoName });

  useEffect(() => {
    if (!currentAdapter?.token) {
      return;
    }
    currentAdapter?.fetchRepositories().then((repositories) => {
      console.log("Repositories", repositories);
      setRepositories(repositories);

      if (repositories.length === 1) {
        engine.setRepoName(repositories[0].name);
        engine.setRepoOwner(repositories[0].org);
      }
    });
  }, [currentAdapter?.token]);

  return (
    <Card className={"min-w-[320px] mx-auto mt-40"}>
      <CardHeader>Settings</CardHeader>
      <CardContent>
        <div className="flex flex-row items-center justify-end">
          <a
            href={currentAdapter?.accessManagementUrl || ""}
            className="text-blue-500 underline text-xs mb-1"
          >
            Manage Repositories
          </a>
        </div>

        {!Boolean(repositories.length) && (
          <Alert variant={"destructive"} className="w-full">
            <OctagonAlert className="h-6 w-6" />
            <AlertTitle>No Repositories Found</AlertTitle>
            <AlertDescription>
              Connect them using the link above.
            </AlertDescription>
          </Alert>
        )}

        {Boolean(repositories.length) && (
          // <List>
          <Select
            value={`${currentAdapter?.owner}/${currentAdapter?.repo}`}
            onValueChange={(value) => {
              console.log("value", value);
              engine.setRepoName(value);
              engine.setRepoOwner(value.split("/")[0]);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a repository" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {repositories.map((installation) => {
                  const fullName = `${installation.org}/${installation.name}`;
                  return (
                    <SelectItem key={installation.id} value={fullName}>
                      {fullName}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
          // <Card
          //   className={"flex flex-row gap-2 items-center"}
          // >
          //   <input
          //     key={installation.id}
          //     value={fullName}
          //     id={fullName}
          //     type="radio"
          //     name="repo"
          //     checked={repoName === fullName}
          //     className="ml-2"
          //     onChange={() => {
          //       console.log("change");
          //       engine.setRepoName(installation.name);
          //       engine.setRepoOwner(installation.org);
          //     }}
          //   />
          //   <label
          //     htmlFor={fullName}
          //     className="flex flex-row p-2 w-full pl-0"
          //   >
          //     {fullName}
          //   </label>
          // </Card>
        )}

        <Button
          variant={"destructive"}
          className={"w-full flex flex-row gap-2 items-center mt-8"}
          onClick={() => {
            engine.setAdapter(null);
            engine.setToken(null);
            engine.setRepoOwner(null);
            engine.setRepoName(null);
            router.push("/");
          }}
        >
          <LogOut />
          Logout
        </Button>
      </CardContent>
    </Card>
  );
}
