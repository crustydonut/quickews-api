import { zValidator } from "@hono/zod-validator";

export function zThrowValidator(target, schema) {
  return zValidator(target, schema, (result, _c) => {
    if (!result.success) {
      throw result.error;
    }
  });
}
