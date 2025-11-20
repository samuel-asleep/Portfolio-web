import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
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
