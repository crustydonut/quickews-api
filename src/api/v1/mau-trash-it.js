import { Hono } from "hono";
import { Mau } from "../../db/schema/Mau";
import { Metrics } from "../../db/schema/Metrics";
import { and, count, eq } from "drizzle-orm";
import { getUnixDate } from "../../utils/time";

const mau = new Hono();

mau.get("/mau/list", async (c) => {
  const maus = await c.get("db").select().from(Mau);
  return c.json(maus);
});

mau.get("/mau", async (c) => {
  const [{value}] = await c
    .get("db")
    .select()
    .from(Metrics)
    .where(
      and(eq(Metrics.table_name, "mau"), eq(Metrics.metric_name, "mau_count"))
    );
    
    if (getUnixDate() - mauCount.created_at >= 28800) {
      const [{ mauCount }] = await db
      .select({ mauCount: count() })
      .from(Mau)
      .where(gte(Mau.created_at, getUnixDate() - 2592000));
  }
  
  return c.json({ count: mauCount ? mauCount.value : "0" });
});

mau.get("/mau/countries", async (c) => {
  const [mauCountryCount] = await c
    .get("db")
    .select()
    .from(Metrics)
    .where(
      and(
        eq(Metrics.table_name, "mau"),
        eq(Metrics.metric_name, "country_count")
      )
    );

  return c.json({ count: mauCountryCount ? mauCountryCount.value : "0" });
});

mau.get("/mau/continents", async (c) => {
  const [mauContinentCount] = await c
    .get("db")
    .select()
    .from(Metrics)
    .where(
      and(
        eq(Metrics.table_name, "mau"),
        eq(Metrics.metric_name, "continent_count")
      )
    );

  return c.json({ count: mauContinentCount ? mauContinentCount.value : "0" });
});

mau.post("/mau", async (c) => {
  const ip = c.req.header("CF-Connecting-IP") || "8.8.8.8";
  const url = `https://api.ipinfo.io/lite/${ip}?token=${c.env.IPINFO_API_TOKEN}`;
  const response = await fetch(url);
  const { country, continent_code: continent } = await response.json();
  const db = c.get("db");

  await db.insert(Mau).values({ continent, country });

  const [{ mauCount }] = await db
    .select({ mauCount: count() })
    .from(Mau)
    .where(gte(Mau.created_at, getUnixDate() - 2592000));

  await db.insert(Metrics).values({
    table_name: "mau",
    metric_name: "mau_count",
    value: mauCount,
    created_at: getUnixDate(),
  });

  return c.body(null, 204);
});

export default mau;
