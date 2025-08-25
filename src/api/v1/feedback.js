import { Hono } from "hono";
import { Feedback } from "../../db/schema/Feedback";
import { zThrowValidator } from "../../utils/validator";
import z, { object } from "zod";

/**
 * @typedef {object} Bindings
 * @property {KVNamespace} KV - The user's unique identifier.
 * @property {D1Database} DB - The user's unique identifier.
 */

/** @type {Hono<{Bindings: Bindings}>} */
const feedback = new Hono();

// cf-tunstile
feedback.post(
  "/feedback",
  zThrowValidator(
    "json",
    object({
      type: z.enum(["bug", "feature"]),
      title: z.string().max(50),
      description: z.string().max(400),
    })
  ),
  async (c) => {
    const { type, title, description } = c.req.valid("json");

    const ip = c.req.header("CF-Connecting-IP") || "8.8.8.9";
    const key = `limit:feedback:${ip}`;

    const count = await c.env.KV.get(key);

    if (count) {
      const intCount = parseInt(count);

      if (intCount >= 10) {
        return c.body(null, 429);
      }

      c.env.KV.put(key, (intCount + 1).toString());
    } else {
      await c.env.KV.put(key, "1", { expirationTtl: 86400 });
    }

    await c.get("db").insert(Feedback).values({ type, title, description });

    return c.body(null, 201);
  }
);

export default feedback;
