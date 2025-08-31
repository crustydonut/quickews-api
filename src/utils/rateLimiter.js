export default async function rateLimiter(c, key, requestLimit, ttl) {
  const limit = await c.env.KV.get(key, "json");
  console.log(limit);

  if (limit === null || limit.expiresAt <= Date.now()) {
    await c.env.KV.put(
      key,
      JSON.stringify({ count: 1, expiresAt: Date.now() + ttl }),
      { expirationTtl: 60 * 60 * 24 }
    );
  } else {
    if (limit.count >= requestLimit) {
      return true;
    } else {
      await c.env.KV.put(
        key,
        JSON.stringify({ ...limit, count: limit.count + 1 }),
        { expirationTtl: 60 * 60 * 24 }
      );
    }
  }
  return false;
}
