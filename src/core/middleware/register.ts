import type { Server } from "@hapi/hapi";
import Inert from "@hapi/inert";
import Vision from "@hapi/vision";
import Cookie from "@hapi/cookie";
import * as hapiAuthJwt2NS from "hapi-auth-jwt2";
import * as HapiSwaggerNS from "hapi-swagger";

const hapiAuthJwt2 = (hapiAuthJwt2NS as any).default ?? hapiAuthJwt2NS;
const HapiSwagger = (HapiSwaggerNS as any).default ?? HapiSwaggerNS;

const PLUGINS: { plugin: any; name: string; options?: any }[] = [
  { plugin: Inert, name: "@hapi/inert" },
  { plugin: Vision, name: "@hapi/vision" },
  { plugin: Cookie, name: "@hapi/cookie" },
  { plugin: hapiAuthJwt2, name: "hapi-auth-jwt2" },
  {
    plugin: HapiSwagger,
    name: "hapi-swagger",
    options: {
      info: {
        title: "BeanMap API",
        version: "0.1.0",
        description: "REST API for BeanMap — cafes (POIs) and user accounts.",
      },
      grouping: "tags",
    },
  },
];

/**
 * Register basic Hapi plugins (middleware) with the server.
 * Safe to call multiple times: skips plugins already registered (e.g. in tests).
 * hapi-swagger depends on @hapi/inert and @hapi/vision; ordering above matters.
 */
export async function registerMiddleware(server: Server): Promise<void> {
  const toRegister = PLUGINS.filter((p) => !server.registrations[p.name]);
  if (toRegister.length === 0) {
    return;
  }
  await server.register(
    toRegister.map((p) => (p.options ? { plugin: p.plugin, options: p.options } : p.plugin)),
  );
}
