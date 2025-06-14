"use client";

import { LinkButton } from "@/components/LinkButton";
import { Card } from "@/components/ui/card";
import { GAAD } from "@/utils/gaad";
import { Frown, Loader, LoaderCircle } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OAuth() {
  const router = useRouter();
  const { provider } = useParams();
  const searchParams = useSearchParams();

  const [hasError, setHasError] = useState(false);

  const oauthCode = searchParams.get("code");
  // setupAction is part of the url when GitHub redirects back after saving installation settings
  const setupAction = searchParams.get("setup_action");

  useEffect(() => {
    if (!oauthCode || !provider) {
      return;
    }

    if (provider === "github") {
      fetch("/api/oauth/github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: oauthCode,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch token");
          }

          response.json().then((responseJson) => {
            if (!responseJson.access_token) {
              throw new Error("Failed to fetch token");
            }

            GAAD.setToken(responseJson.access_token);
            GAAD.setAdapter(
              GAAD.getAdapters().find(
                (adapter) => adapter.name.toLowerCase() === provider
              ) || null
            );

            // router.push("/");
            if (GAAD.getAdapter().repo) {
              router.push("/conferences");
            } else {
              router.push("/settings");
            }
          });
        })
        .catch(() => {
          setHasError(true);
        });
    } else {
      console.log("Unknown provider");
    }
  }, [oauthCode, provider]);

  return (
    <Card
      className={
        "max-w-[320px] mx-auto mt-40 flex flex-col gap-4 text-center p-4 items-center justify-center"
      }
    >
      {hasError && (
        <>
          <Frown className="h-20 w-20" />
          <p>
            Error logging you in. Head back to the login page and try again.
          </p>
          <LinkButton href={"/login"}>Back to Login</LinkButton>
        </>
      )}
      {!hasError && (
        <>
          <LoaderCircle className="h-20 w-20 animate-spin" />
          <p>Logging you in...</p>
        </>
      )}
    </Card>
  );
}
