import type { IStorage } from "./fileStorage.js";
export type { IStorage };

// Use database storage when DATABASE_URL is set, otherwise fall back to file storage
const storageModule = process.env.DATABASE_URL
  ? await import("./dbStorage.js")
  : await import("./fileStorage.js");

export const storage: IStorage = storageModule.storage;
