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

feedback.post(
  "/feedback",
  zThrowValidator(
    "json",
    object({
      type: z.enum(["bug", "feature"]),
      title: z.string().min(3).max(50),
      description: z.string().min(3).max(400),
      token: z.string().min(1).max(2048),
    })
  ),
  async (c) => {
    const { type, title, description, token } = c.req.valid("json");
    const ip = c.req.header("CF-Connecting-IP");

    const formData = new FormData();
    formData.append("secret", c.env.TURNSTILE_SECRET_KEY);
    formData.append("response", token);
    formData.append("remoteip", ip);

    const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!data.success) {
      return c.json({}, 401);
    }

    const key = `limit:feedback:${ip}`;
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

    await c.get("db").insert(Feedback).values({ type, title, description });

    return c.body(null, 204);
  }
);

export default feedback;
