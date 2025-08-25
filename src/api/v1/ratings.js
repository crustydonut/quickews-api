import { Hono } from "hono";
import { Ratings } from "../../db/schema/Ratings";
import { and, asc, avg, count, eq, gt } from "drizzle-orm";
import z, { object } from "zod";
import { Metrics } from "../../db/schema/Metrics";
import { getUnixDate } from "../../utils/time";
import { zThrowValidator } from "../../utils/validator";

const ratings = new Hono();

ratings.get("/ratings/avg", async (c) => {
  const [ratingAvg] = await c
    .get("db")
    .select()
    .from(Metrics)
    .where(
      and(eq(Metrics.table_name, "ratings"), eq(Metrics.metric_name, "avg"))
    );

  return c.json({ avg: ratingAvg ? ratingAvg.value : "No ratings yet" }, 200);
});

ratings.get("/ratings/count", async (c) => {
  const [ratingCount] = await c
    .get("db")
    .select()
    .from(Metrics)
    .where(
      and(eq(Metrics.table_name, "ratings"), eq(Metrics.metric_name, "count"))
    );

  return c.json({ count: ratingCount ? parseInt(ratingCount.value) : 0 }, 200);
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

// cf-tunstile
ratings.post(
  "/ratings",
  zThrowValidator(
    "json",
    object({
      stars: z.coerce.number().max(10).min(0).multipleOf(0.5),
      description: z.string().max(400).optional(),
      nickname: z.string().max(20).optional().default("Anonymous"),
    })
  ),
  async (c) => {
    const { nickname, stars, description } = c.req.valid("json");

    await c
      .get("db")
      .insert(Ratings)
      .values({
        stars: parseInt(stars * 2).toFixed(0),
        description,
        nickname,
      });

    let [{ average }] = await c
      .get("db")
      .select({ average: avg(Ratings.stars) })
      .from(Ratings);

    average = parseFloat(average / 2).toFixed(1);

    await c
      .get("db")
      .insert(Metrics)
      .values({
        table_name: "ratings",
        metric_name: "avg",
        value: average,
        created_at: getUnixDate(),
      })
      .onConflictDoUpdate({
        target: [Metrics.table_name, Metrics.metric_name],
        set: {
          value: average,
          created_at: getUnixDate(),
        },
      });

    let [{ ratingCount }] = await c
      .get("db")
      .select({ ratingCount: count(Ratings.stars) })
      .from(Ratings);

    ratingCount = parseInt(ratingCount).toFixed(0);

    await c
      .get("db")
      .insert(Metrics)
      .values({
        table_name: "ratings",
        metric_name: "count",
        value: ratingCount,
        created_at: getUnixDate(),
      })
      .onConflictDoUpdate({
        target: [Metrics.table_name, Metrics.metric_name],
        set: {
          value: ratingCount,
          created_at: getUnixDate(),
        },
      });

    return c.body(null, 204);
  }
);

export default ratings;
