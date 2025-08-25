import { Hono } from "hono";
import { Searches } from "../../db/schema/Searches";
import { count } from "drizzle-orm";
import { zThrowValidator } from "../../utils/validator";
import z, { object } from "zod";

/**
 * @typedef {object} Bindings
 * @property {KVNamespace} KV - The user's unique identifier.
 * @property {D1Database} DB - The user's unique identifier.
 */

/** @type {Hono<{Bindings: Bindings}>} */
const searches = new Hono();

searches.get("/searches/count", async (c) => {
  const key = "cache:searches_count";
  let searchesCount;

  searchesCount = await c.env.KV.get(key);

  if (!searchesCount) {
    [{ searchesCount }] = await c
      .get("db")
      .select({ searchesCount: count() })
      .from(Searches);

    await c.env.KV.put(key, searchesCount, { expirationTtl: 3600 });
  }

  return c.json({ count: parseInt(searchesCount) });
});

searches.post(
  "/searches",
  zThrowValidator(
    "json",
    object({
      exam_board: z.enum(["cie"]),
      level: z.enum(["igcse"]),
      feature: z.enum(["click"]),
      website: z.url(),
    })
  ),
  async (c) => {
    const { exam_board, feature, level, website } = await c.req.json();

    await c
      .get("db")
      .insert(Searches)
      .values({ exam_board, feature, level, website });

    return c.body(null, 204);
  }
);

export default searches;
