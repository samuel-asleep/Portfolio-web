import { type Profile, type InsertProfile, type Project, type InsertProject, profiles, projects } from "@shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  getProfile(): Promise<Profile | undefined>;
  updateProfile(profile: InsertProfile): Promise<Profile>;
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
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

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(asc(projects.order));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0];
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project> {
    const [updated] = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }
}

export const storage = new DbStorage();
