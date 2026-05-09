import type { Server } from "@hapi/hapi";
import Inert from "@hapi/inert";
import Vision from "@hapi/vision";
import Cookie from "@hapi/cookie";
import * as hapiAuthJwt2NS from "hapi-auth-jwt2";

const hapiAuthJwt2 = (hapiAuthJwt2NS as any).default ?? hapiAuthJwt2NS;

const PLUGINS = [
  { plugin: Inert, name: "@hapi/inert" },
  { plugin: Vision, name: "@hapi/vision" },
  { plugin: Cookie, name: "@hapi/cookie" },
  { plugin: hapiAuthJwt2, name: "hapi-auth-jwt2" },
];

/**
 * Register basic Hapi plugins (middleware) with the server.
 * Safe to call multiple times: skips plugins already registered (e.g. in tests).
 */
export async function registerMiddleware(server: Server): Promise<void> {
  const toRegister = PLUGINS.filter((p) => !server.registrations[p.name]);
  if (toRegister.length === 0) {
    return;
  }
  await server.register(toRegister.map((p) => p.plugin));
}
