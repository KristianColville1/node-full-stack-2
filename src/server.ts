import path from "path";
import { fileURLToPath } from "url";
import Hapi from "@hapi/hapi";
import Joi from "joi";
import Handlebars from "handlebars";
import { env } from "@/core/config/env.js";
import { registerMiddleware } from "@/core/middleware/register.js";
import { initStores, db } from "@/core/data/db.js";
import { PRESET_CATEGORIES } from "@/app/data/categories.js";
import { routes as frontendRoutes } from "@/app/routes/routes.js";
import { apiRoutes } from "@/app/api/api-routes.js";
import { accountsController } from "@/app/controllers/accounts-controller.js";
import { validateJWT } from "./app/api/jwt-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Create the server
 */
export const server = Hapi.server({
  host: env.HOST,
  port: env.PORT,
});

/**
 * Register the middleware
 */
await registerMiddleware(server);

/**
 * Auth strategies (must be registered before routes that use auth)
 */
server.auth.strategy("session", "cookie", {
  cookie: {
    name: env.COOKIE_NAME,
    password: env.COOKIE_PASSWORD,
    isSecure: false,
  },
  redirectTo: "/login",
  validate: accountsController.validate,
});
server.auth.strategy("jwt", "jwt", {
  key: env.JWT_SECRET,
  validate: validateJWT,
  verifyOptions: { algorithms: ["HS256"] },
});
server.auth.default("session");

/**
 * Register the validator
 */
server.validator(Joi);

/**
 * Handlebars helpers.
 * safeJson: stringify a value for embedding inside a <script> tag without
 * escaping its content as HTML, while still neutralising any "</script>"
 * sequences in user data so they can't break out of the embedding script.
 * Used by the cafe-map partial to ship cafe coordinates to the client.
 */
Handlebars.registerHelper("safeJson", (value) => {
  const json = JSON.stringify(value ?? null);
  return new Handlebars.SafeString(json.replace(/</g, "\\u003c"));
});

/**
 * Register the routes
 */
server.route(frontendRoutes as any);
server.route(apiRoutes as any);

/**
 * Static assets public folder
 */
server.route({
  method: "GET",
  path: "/assets/{param*}",
  options: { auth: false },
  handler: {
    directory: {
      path: path.join(__dirname, "..", "public"),
      redirectToSlash: true,
      index: false,
    },
  },
});

/**
 * Register the views
 */
server.views({
  engines: {
    hbs: Handlebars,
  },
  relativeTo: __dirname,
  path: "./app/views",
  layoutPath: "./app/views/layouts",
  partialsPath: "./app/views/partials",
  layout: true,
  isCached: false,
  context: {
    currentYear: new Date().getFullYear(),
  },
});

/**
 * Start the server (registers auth plugins then strategies, then starts).
 * Seeds the category store with PRESET_CATEGORIES on first boot — idempotent.
 */
export async function start(): Promise<void> {
  initStores();
  if (db.categoryStore?.seedIfEmpty) {
    await db.categoryStore.seedIfEmpty(PRESET_CATEGORIES);
  }
  console.log("Server running on %s", server.info.uri);
  await server.start();
}

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});

if (env.NODE_ENV !== "test") {
  start();
}