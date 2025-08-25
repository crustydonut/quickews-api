import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { getUnixDate } from "../../utils/time";
import { nanoid } from "nanoid";

export const Searches = sqliteTable("searches", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => nanoid(16)),
  exam_board: text("exam_board").notNull(),
  level: text("level").notNull(),
  feature: text("feature").notNull(),
  website: text("website").notNull(),
  created_at: integer("created_at")
    .notNull()
    .$defaultFn(() => getUnixDate()),
});
