import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { sql } from "drizzle-orm";

export const Mau = sqliteTable("mau", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => nanoid(16)),
  created_at: integer("created_at")
    .notNull()
    .default(sql`(strftime('%s', 'now', 'start of day'))`),
  country: text("country"),
  continent: text("continent"),
});
