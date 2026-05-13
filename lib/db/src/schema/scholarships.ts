import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scholarshipsTable = pgTable("scholarships", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: integer("amount").notNull(),
  deadline: text("deadline").notNull(),
  eligibilitySummary: text("eligibility_summary").notNull(),
  category: text("category").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertScholarshipSchema = createInsertSchema(scholarshipsTable).omit({ id: true });
export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;
export type Scholarship = typeof scholarshipsTable.$inferSelect;
