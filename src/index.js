import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { ZodError } from "zod";
import mau from "./api/v1/mau";
import searches from "./api/v1/searches";
import feedback from "./api/v1/feedback";
import ratings from "./api/v1/ratings";

const app = new Hono();

app.use("*", async (c, next) => {
  c.set("db", drizzle(c.env.DB));
  await next();
});

app.route("/api/v1", mau);
app.route("/api/v1", searches);
app.route("/api/v1", feedback);
app.route("/api/v1", ratings);

app.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json(
      {
        error: "ValidationError",
        message: err.message,
      },
      422
    );
  }
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
