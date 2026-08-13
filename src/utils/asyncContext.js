import { AsyncLocalStorage } from "node:async_hooks";

export const asyncLocalStorage = new AsyncLocalStorage();

export const getRequestId = () => {
  const store = asyncLocalStorage.getStore();
  return store?.requestId || null;
};
