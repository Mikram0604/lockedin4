import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  college: text("college").notNull().default(""),
  branch: text("branch").notNull().default(""),
  year: integer("year").notNull().default(1),
  district: text("district"),
  incomeRange: text("income_range"),
  casteCategory: text("caste_category"),
  feeStatus: text("fee_status").notNull().default("unknown"),
  languagePreference: text("language_preference").notNull().default("english"),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  onboardingStep: integer("onboarding_step").notNull().default(0),
  riskScore: integer("risk_score").notNull().default(0),
  riskLevel: text("risk_level").notNull().default("low"),
  daysSilent: integer("days_silent").notNull().default(0),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  flagged: boolean("flagged").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof studentsTable.$inferSelect;
