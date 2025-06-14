import { useEffect, useState } from "react";
import {
  Collection,
  Engine,
  Subscription,
  RepoStatus,
} from "@oh-my-ghaad/core";

interface GHaaDReturnValue {
  engine: Engine;
  repoStatus: RepoStatus;
}

export function useGHaaD(
  engine: Engine,
  subscription?: Subscription
): GHaaDReturnValue {
  const [state, setState] = useState<GHaaDReturnValue>({
    engine,
    repoStatus: "unknown",
    lastUpdated: Date.now(),
  });

  useEffect(() => {
    const subscriptionWrapper = (collections) => {
      setState({ engine, lastUpdated: Date.now() });
    };

    engine.subscribe(subscriptionWrapper);

    return () => {
      engine.unsubscribe(subscriptionWrapper);
    };
  }, []);

  return state;
}
