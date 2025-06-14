"use client";

import { Cog, LoaderCircle, OctagonAlert, Speech } from "lucide-react";
import Link from "next/link";

import { GAAD } from "@/utils/gaad";
import { useGHaaD } from "@oh-my-ghaad/react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Header() {
  const router = useRouter();

  const [showingInitializeDialog, setShowingInitializeDialog] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const { engine } = useGHaaD(GAAD);

  const adapter = engine.getAdapter();
  const { repo, owner, baseUrl } = adapter || {
    repo: null,
    owner: null,
    baseUrl: null,
  };

  const repoName = `${owner}/${repo}`;
  const repoUrl = `${baseUrl}/${owner}/${repo}`;

  const isLoggedIn = Boolean(adapter?.token);

  useEffect(() => {
    engine.setUnauthorizedHandler(() => {
      engine.setRepoName(null);
      engine.setRepoOwner(null);
      engine.setToken(null);
      router.push("/login");
    });
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      engine.sync();
    }
  }, [isLoggedIn, engine.getAdapter()?.repo]);

  useEffect(() => {
    if (engine.getRepoStatus() === "empty") {
      setShowingInitializeDialog(true);
    }
  }, [engine.getRepoStatus()]);

  return (
    <header>
      <Card
        className={"py-2 px-4 flex flex-row items-center gap-2 justify-between"}
      >
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link href={"/"} className="flex items-center gap-2">
            <Speech className={"h-8 w-8"} />
            <h1 className="text-2xl font-bold">CFPlease</h1>
          </Link>
          <Link href={"/conferences"}>Conferences</Link>
          <Link href={"/talks"}>Talks</Link>
        </div>
        <div>
          {isLoggedIn && (
            <div className="flex flex-row gap-2 items-center">
              {!Boolean(repo) && <span>No Repository Selected</span>}
              {Boolean(repo) && (
                <span className="flex flex-row items-center gap-2">
                  <img src={adapter.icon} className="h-6 w-6" />
                  {repoName}
                </span>
              )}
              <Button asChild>
                <Link href={"/settings"}>
                  <Cog className={"h-6 w-6"} />
                </Link>
              </Button>
            </div>
          )}
          {!isLoggedIn && (
            <Button>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </Card>

      {isLoggedIn && engine.getRepoStatus() === "empty" && (
        <Alert variant={"destructive"} className="w-full mt-4 bg-red-50">
          <OctagonAlert className="h-6 w-6" />
          <AlertTitle>Empty Repository Detected</AlertTitle>
          <AlertDescription>
            <div className="flex items-center justify-between w-full">
              <p>
                Initialize the repo to get started. This will create a config
                file and folders for your collections.
              </p>
              <Button
                className=""
                onClick={() => {
                  setIsInitializing(true);
                  engine
                    .initialize()
                    .then(() => {
                      toast("Repo initialized", {
                        description:
                          "Start creating Conferences and Talks to get started.",
                      });
                    })
                    .catch(() => {
                      toast.error("Could not initialize repo", {
                        description:
                          "Try manually emptying the repo and trying again.",
                      });
                    })
                    .finally(() => {
                      setIsInitializing(false);
                    });
                }}
                disabled={isInitializing}
              >
                {isInitializing && (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                )}
                {!isInitializing && "Initialize"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </header>
  );
}
