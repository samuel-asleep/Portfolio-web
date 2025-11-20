import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default(""),
  title: text("title").notNull().default(""),
  bio: text("bio").notNull().default(""),
  profileImage: text("profile_image"),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  location: text("location").notNull().default(""),
  github: text("github"),
  linkedin: text("linkedin"),
  twitter: text("twitter"),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
}).extend({
  name: z.string().default(""),
  title: z.string().default(""),
  bio: z.string().default(""),
  email: z.union([z.string().email(), z.literal("")]).default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  github: z.union([z.string().url(), z.literal("")]).optional(),
  linkedin: z.union([z.string().url(), z.literal("")]).optional(),
  twitter: z.union([z.string().url(), z.literal("")]).optional(),
  profileImage: z.string().optional(),
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  image: text("image"),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  liveUrl: text("live_url"),
  githubUrl: text("github_url"),
  order: integer("order").notNull().default(0),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
}).extend({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  longDescription: z.string().optional(),
  image: z.union([
    z.string().url(), 
    z.string().startsWith('/uploads/'), 
    z.literal("")
  ]).optional(),
  tags: z.array(z.string()).default([]),
  liveUrl: z.union([z.string().url(), z.literal("")]).optional(),
  githubUrl: z.union([z.string().url(), z.literal("")]).optional(),
  order: z.number().int().min(0).default(0).refine((val) => !isNaN(val), {
    message: "Order must be a valid number",
  }),
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
