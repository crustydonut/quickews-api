import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { sql } from "drizzle-orm";

export const Feedback = sqliteTable("feedback", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => nanoid(16)),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  created_at: integer("created_at")
    .notNull()
    .default(sql`(strftime('%s', 'now', 'start of day'))`),
  is_completed: integer("is_completed").notNull().default(0),
});
