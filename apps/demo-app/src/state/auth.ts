import { atomWithStorage } from "jotai/utils";

export const $token = atomWithStorage<string | null>("token", null);
export const $repository = atomWithStorage<string | null>("repository", null);
export const $provider = atomWithStorage<string | null>("provider", null);
