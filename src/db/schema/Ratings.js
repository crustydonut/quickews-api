import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { getUnixDate } from "../../utils/time";

export const Ratings = sqliteTable(
  "ratings",
  {
    id: integer("id").notNull().primaryKey({ autoIncrement: true }),
    nickname: text("nickname").notNull().default("Anonymous"),
    stars: integer("stars").notNull(), // 0-10
    description: text("description"), // 400 chars long
    approved: integer("approved").notNull().default(0),
    created_at: integer("created_at")
      .notNull()
      .$defaultFn(() => getUnixDate()),
  },
  (table) => [index("idx_ratings_approved").on(table.approved)]
);
