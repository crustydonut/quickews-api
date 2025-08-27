import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const Ratings = sqliteTable(
  "ratings",
  {
    id: integer("id").notNull().primaryKey({ autoIncrement: true }),
    nickname: text("nickname").notNull().default("Anonymous"),
    stars: integer("stars").notNull(),
    description: text("description"),
    approved: integer("approved").notNull().default(0),
    created_at: integer("created_at")
      .notNull()
      .default(sql`(strftime('%s', 'now', 'start of day'))`),
  },
  (table) => [index("idx_ratings_approved").on(table.approved)]
);
