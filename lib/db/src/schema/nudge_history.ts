import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";

export const nudgeHistoryTable = pgTable("nudge_history", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  message: text("message").notNull(),
  triggerReason: text("trigger_reason").notNull(),
  responded: boolean("responded").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertNudgeHistorySchema = createInsertSchema(nudgeHistoryTable).omit({ id: true, createdAt: true });
export type InsertNudgeHistory = z.infer<typeof insertNudgeHistorySchema>;
export type NudgeHistory = typeof nudgeHistoryTable.$inferSelect;
