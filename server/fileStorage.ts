import fs from "fs";
import path from "path";
import type { Profile, InsertProfile, Project, InsertProject } from "@shared/schema";

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(DATA_DIR, "config.json");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

interface Config {
  profile: Profile | null;
  projects: Project[];
}

// Ensure data directories exist
function ensureDataDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

// Load config from disk
function loadConfig(): Config {
  ensureDataDirectories();
  
  if (!fs.existsSync(CONFIG_FILE)) {
    const defaultConfig: Config = {
      profile: null,
      projects: [],
    };
    saveConfig(defaultConfig);
    return defaultConfig;
  }
  
  try {
    const data = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading config:", error);
    return {
      profile: null,
      projects: [],
    };
  }
}

// Save config to disk
function saveConfig(config: Config) {
  ensureDataDirectories();
  
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving config:", error);
    throw new Error("Failed to save configuration");
  }
}

// Validate config before saving
function validateConfig(config: Config): boolean {
  try {
    // Basic validation
    if (!config || typeof config !== "object") return false;
    if (!Array.isArray(config.projects)) return false;
    return true;
  } catch {
    return false;
  }
}

export interface IStorage {
  getProfile(): Promise<Profile | undefined>;
  updateProfile(profile: InsertProfile): Promise<Profile>;
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
}

export class FileStorage implements IStorage {
  async getProfile(): Promise<Profile | undefined> {
    const config = loadConfig();
    return config.profile || undefined;
  }

  async updateProfile(insertProfile: InsertProfile): Promise<Profile> {
    const config = loadConfig();
    
    const profile: Profile = {
      id: config.profile?.id || crypto.randomUUID(),
      name: insertProfile.name || "",
      title: insertProfile.title || "",
      bio: insertProfile.bio || "",
      profileImage: insertProfile.profileImage || null,
      email: insertProfile.email || "",
      phone: insertProfile.phone || "",
      location: insertProfile.location || "",
      github: insertProfile.github || null,
      linkedin: insertProfile.linkedin || null,
      twitter: insertProfile.twitter || null,
    };
    
    config.profile = profile;
    
    if (!validateConfig(config)) {
      throw new Error("Invalid configuration data");
    }
    
    saveConfig(config);
    return profile;
  }

  async getProjects(): Promise<Project[]> {
    const config = loadConfig();
    return config.projects.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const config = loadConfig();
    return config.projects.find(p => p.id === id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const config = loadConfig();
    
    const project: Project = {
      id: crypto.randomUUID(),
      title: insertProject.title,
      description: insertProject.description,
      longDescription: insertProject.longDescription || null,
      image: insertProject.image || null,
      imageData: insertProject.imageData || null,
      tags: insertProject.tags || [],
      liveUrl: insertProject.liveUrl || null,
      githubUrl: insertProject.githubUrl || null,
      order: insertProject.order || 0,
    };
    
    config.projects.push(project);
    
    if (!validateConfig(config)) {
      throw new Error("Invalid configuration data");
    }
    
    saveConfig(config);
    return project;
  }

  async updateProject(id: string, partialProject: Partial<InsertProject>): Promise<Project> {
    const config = loadConfig();
    const index = config.projects.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error("Project not found");
    }
    
    const existing = config.projects[index];
    const updated: Project = {
      ...existing,
      title: partialProject.title !== undefined ? partialProject.title : existing.title,
      description: partialProject.description !== undefined ? partialProject.description : existing.description,
      longDescription: partialProject.longDescription !== undefined ? partialProject.longDescription || null : existing.longDescription,
      image: partialProject.image !== undefined ? partialProject.image || null : existing.image,
      imageData: partialProject.imageData !== undefined ? partialProject.imageData || null : existing.imageData,
      tags: partialProject.tags !== undefined ? partialProject.tags : existing.tags,
      liveUrl: partialProject.liveUrl !== undefined ? partialProject.liveUrl || null : existing.liveUrl,
      githubUrl: partialProject.githubUrl !== undefined ? partialProject.githubUrl || null : existing.githubUrl,
      order: partialProject.order !== undefined ? partialProject.order : existing.order,
    };
    
    config.projects[index] = updated;
    
    if (!validateConfig(config)) {
      throw new Error("Invalid configuration data");
    }
    
    saveConfig(config);
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    const config = loadConfig();
    const index = config.projects.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error("Project not found");
    }
    
    config.projects.splice(index, 1);
    
    if (!validateConfig(config)) {
      throw new Error("Invalid configuration data");
    }
    
    saveConfig(config);
  }
}

export const storage = new FileStorage();
