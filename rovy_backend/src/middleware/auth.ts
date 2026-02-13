import type { Context, Next } from "hono";
import { verifyToken } from "../lib/supabase";

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json({ message: "Unauthorized - No header" }, 401);
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return c.json({ message: "Unauthorized - No token" }, 401);
  }

  try {
    const user = await verifyToken(token);
    c.set("user", user);
    await next();
  } catch (error) {
    return c.json({ message: "Unauthorized - Invalid token" }, 401);
  }
};
