"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GAAD } from "@/utils/gaad";
import { Adapter, IAdapter } from "@oh-my-ghaad/core";
import { useGHaaD } from "@oh-my-ghaad/react";
import clsx from "clsx";
import React, { useState, useEffect } from "react";

export default function Login() {
  const { engine } = useGHaaD(GAAD);

  const adapters = engine.getAdapters();

  return (
    <div>
      <Card
        className={
          "p-4 w-auto! max-w-[280px] mx-auto mt-40 flex flex-col gap-4"
        }
      >
        <h1 className="font-bold text-4xl">Login</h1>
        <p>Login with your GitHub account to get started.</p>

        {adapters.map((adapter) => {
          return (
            <Button
              key={adapter.name}
              asChild
              style={{
                backgroundColor: `${adapter.primaryColor}`,
                color: `${adapter.secondaryColor}`,
              }}
              className={clsx("flex flex-row gap-2 w-full")}
            >
              <a
                href={`${adapter.oauthUrl}?client_id=${adapter.clientId}&redirect_uri=${adapter.redirectUri}&scope=repo`}
              >
                <img src={adapter.icon} className="h-6 w-6" />
                <span>Login with {adapter.name}</span>
              </a>
            </Button>
          );
        })}
      </Card>
    </div>
  );
}
