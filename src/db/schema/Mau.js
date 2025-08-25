import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { getUnixDate } from "../../utils/time";
import { nanoid } from "nanoid";

export const Mau = sqliteTable("mau", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => nanoid(16)),
  created_at: integer("created_at")
    .notNull()
    .$defaultFn(() => getUnixDate()),
  country: text("country"),
  continent: text("continent"),
});
