import { Hono } from "hono";
import rateLimiter from "../../utils/rateLimiter";

/**
 * @typedef {object} Bindings
 * @property {KVNamespace} KV - The user's unique identifier.
 * @property {D1Database} DB - The user's unique identifier.
 */

/** @type {Hono<{Bindings: Bindings}>} */
const installs = new Hono();

installs.get("/installs", async (c) => {
  try {
    const installs = await c.env.KV.get("cache:installs");
    return c.json({ count: installs });
  } catch (error) {
    return c.json({ error: error.message });
  }
});

installs.post("/installs", async (c) => {
  try {
    const ip = c.req.header("CF-Connecting-IP");
    const key = `limit:installs:${ip}`;

    const tooManyReq = await rateLimiter(c, key, 5, 1000 * 3600 * 24);

    if (tooManyReq) {
      return c.body(null, 429);
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
