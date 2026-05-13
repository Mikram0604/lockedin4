import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";

export const riskFlagsTable = pgTable("risk_flags", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  severity: text("severity").notNull(),
  reason: text("reason").notNull(),
  riskScore: integer("risk_score").notNull().default(0),
  resolved: boolean("resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRiskFlagSchema = createInsertSchema(riskFlagsTable).omit({ id: true, createdAt: true });
export type InsertRiskFlag = z.infer<typeof insertRiskFlagSchema>;
export type RiskFlag = typeof riskFlagsTable.$inferSelect;
