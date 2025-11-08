import { type Profile, type InsertProfile, profiles } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getProfile(): Promise<Profile | undefined>;
  updateProfile(profile: InsertProfile): Promise<Profile>;
}

export class DbStorage implements IStorage {
  async getProfile(): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).limit(1);
    return result[0];
  }

  async updateProfile(insertProfile: InsertProfile): Promise<Profile> {
    // Check if profile exists
    const existing = await this.getProfile();
    
    if (existing) {
      // Update existing profile
      const [updated] = await db
        .update(profiles)
        .set(insertProfile)
        .where(eq(profiles.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new profile
      const [created] = await db.insert(profiles).values(insertProfile).returning();
      return created;
    }
  }
}

export const storage = new DbStorage();
