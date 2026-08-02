"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Returns false on the server and during hydration, true once mounted on the
 * client. Preferred over the useState + useEffect pattern, which sets state
 * synchronously inside an effect and triggers a cascading render.
 */
export function useIsMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
