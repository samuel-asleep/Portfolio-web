import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio").notNull(),
  profileImage: text("profile_image"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  location: text("location").notNull(),
  github: text("github"),
  linkedin: text("linkedin"),
  twitter: text("twitter"),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
}).extend({
  github: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
