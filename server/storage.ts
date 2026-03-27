import type { IStorage } from "./fileStorage";
export type { IStorage };

// Use database storage when DATABASE_URL is set, otherwise fall back to file storage
const storageModule = process.env.DATABASE_URL
  ? await import("./dbStorage")
  : await import("./fileStorage");

export const storage: IStorage = storageModule.storage;
