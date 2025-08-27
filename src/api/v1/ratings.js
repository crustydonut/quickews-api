import { Hono } from "hono";
import { Ratings } from "../../db/schema/Ratings";
import { and, asc, avg, count, eq, gt } from "drizzle-orm";
import z, { object } from "zod";
import { zThrowValidator } from "../../utils/validator";

/**
 * @typedef {object} Bindings
 * @property {KVNamespace} KV - The user's unique identifier.
 * @property {D1Database} DB - The user's unique identifier.
 */

/** @type {Hono<{Bindings: Bindings}>} */
const ratings = new Hono();

ratings.get("/ratings/avg", async (c) => {
  const ratingsAvg = await c.env.KV.get("cache:ratings:avg");
  return c.json({ avg: ratingsAvg || "No ratings yet" });
});

ratings.get("/ratings/count", async (c) => {
  const ratingsCount = await c.env.KV.get("cache:ratings:count");
  return c.json({ count: parseInt(ratingsCount) || 0 });
});

ratings.get(
  "/ratings",
  zThrowValidator(
    "query",
    object({
      after: z.coerce.number().min(0).optional(),
    })
  ),
  async (c) => {
    const { after = 0 } = c.req.valid("query");

    const ratings = await c
      .get("db")
      .select()
      .from(Ratings)
      .where(and(eq(Ratings.approved, 0), gt(Ratings.id, after)))
      .orderBy(asc(Ratings.id))
      .limit(9);

    return c.json(ratings);
  }
);

ratings.post(
  "/ratings",
  zThrowValidator(
    "json",
    object({
      stars: z.coerce.number().min(0.5).max(5).multipleOf(0.5),
      description: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().max(400).optional()
      ),
      nickname: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().min(3).max(20).optional().default("Anonymous")
      ),
    })
  ),
  async (c) => {
    const { nickname, stars, description } = c.req.valid("json");

    const ip = c.req.header("CF-Connecting-IP") || "8.8.8.8";
    const key = `limit:ratings:${ip}`;

    const limit = await c.env.KV.get(key);

    if (limit) {
      const intLimit = parseInt(limit);

      if (intLimit >= 5) {
        return c.body(null, 429);
      }

      await c.env.KV.put(key, (intLimit + 1).toString());
    } else {
      await c.env.KV.put(key, "1", { expirationTtl: 86400 });
    }

    await c
      .get("db")
      .insert(Ratings)
      .values({
        stars: parseInt(stars * 2).toFixed(0),
        description,
        nickname,
      });

    const [{ ratingsAvg, ratingsCount }] = await c
      .get("db")
      .select({
        ratingsAvg: avg(Ratings.stars),
        ratingsCount: count(Ratings.stars),
      })
      .from(Ratings);

    await c.env.KV.put(
      "cache:ratings:count",
      parseInt(ratingsCount).toFixed(0)
    );
    await c.env.KV.put(
      "cache:ratings:avg",
      parseFloat(ratingsAvg / 2).toFixed(1)
    );

    return c.body(null, 204);
  }
);

export default ratings;
