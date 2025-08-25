import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { getUnixDate } from "../../utils/time";

export const Metrics = sqliteTable(
  "metrics",
  {
    table_name: text("table_name").notNull(),
    metric_name: text("metric_name").notNull(),
    value: text("value").notNull(),
    created_at: integer("created_at")
      .notNull()
      .$defaultFn(() => getUnixDate()),
  },
  (table) => [primaryKey({ columns: [table.table_name, table.metric_name] })]
);
