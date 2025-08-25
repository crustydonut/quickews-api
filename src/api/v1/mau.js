import { Hono } from "hono";
import { Mau } from "../../db/schema/Mau";
import { count, countDistinct, gte } from "drizzle-orm";

/**
 * @typedef {object} Bindings
 * @property {KVNamespace} KV - The user's unique identifier.
 * @property {D1Database} DB - The user's unique identifier.
 */

/** @type {Hono<{Bindings: Bindings}>} */
const mau = new Hono();

mau.post("/mau", async (c) => {
  const ip = c.req.header("CF-Connecting-IP");

  const key = `limit:mau:${ip}`;
  const limit = await c.env.KV.get(key);

  if (limit) {
    const intLimit = parseInt(limit);

    if (intLimit >= 5) {
      return c.body(null, 429);
    }

    await c.env.KV.put(key, (intLimit + 1).toString());
  } else {
    await c.env.KV.put(key, "1", { expirationTtl: 30 * 24 * 3600 });
  }

  const url = `https://api.ipinfo.io/lite/${ip}?token=${c.env.IPINFO_API_TOKEN}`;
  const response = await fetch(url);
  const { country, continent_code } = await response.json();

  await c
    .get("db")
    .insert(Mau)
    .values({ continent: continent_code, country, created_at: 1733488000 });

  return c.body(null, 204);
});

mau.get("/mau", async (c) => {
  const key = "cache:mau:mau_count";
  let mauCount = await c.env.KV.get(key);

  if (mauCount === null) {
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 2592000;
    [{ mauCount }] = await c
      .get("db")
      .select({ mauCount: count() })
      .from(Mau)
      .where(gte(Mau.created_at, thirtyDaysAgo));

    await c.env.KV.put(key, mauCount, { expirationTtl: 3600 * 3 });
  }

  return c.json({ count: parseInt(mauCount) });
});

mau.get("/mau/countries", async (c) => {
  const key = "cache:mau:country_count";
  let countryCount = await c.env.KV.get(key);

  if (countryCount === null) {
    [{ countryCount }] = await c
      .get("db")
      .select({ countryCount: countDistinct(Mau.country) })
      .from(Mau);

    await c.env.KV.put(key, countryCount, { expirationTtl: 3600 * 24 });
  }

  return c.json({ count: parseInt(countryCount) });
});

mau.get("/mau/continents", async (c) => {
  const key = "cache:mau:continent_count";
  let continentCount = await c.env.KV.get(key);

  if (continentCount === null) {
    [{ continentCount }] = await c
      .get("db")
      .select({ continentCount: countDistinct(Mau.continent) })
      .from(Mau);

    await c.env.KV.put(key, continentCount, { expirationTtl: 3600 * 24 });
  }

  return c.json({ count: parseInt(continentCount) });
});

export default mau;
