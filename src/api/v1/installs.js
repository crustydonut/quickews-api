import { Hono } from "hono";

/**
 * @typedef {object} Bindings
 * @property {KVNamespace} KV - The user's unique identifier.
 * @property {D1Database} DB - The user's unique identifier.
 */

/** @type {Hono<{Bindings: Bindings}>} */
const installs = new Hono();

installs.post("/installs", async (c) => {
  try {
    const ip = c.req.header("CF-Connecting-IP");

    const key = `limit:installs:${ip}`;
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

    const installs = await c.env.KV.get("cache:installs");

    if (installs !== null) {
      const intInstalls = parseInt(installs);
      console.log(intInstalls);

      await c.env.KV.put("cache:installs", (intInstalls + 1).toString());
    } else {
      await c.env.KV.put("cache:installs", "1");
    }

    return c.json({}, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

export default installs;
