import Boom from "@hapi/boom";

/**
 * Hapi pre-handler that rejects non-admin requests with 403.
 * Use as `pre: [requireAdmin]` on routes that should only be reachable by
 * users whose record has `role: "admin"`.
 *
 * The cookie `validate` callback already exposes the full user record on
 * `request.auth.credentials`, including `role` (defaulted to "user" for
 * pre-existing records — see memory/json user store withRoleDefault).
 */
export const requireAdmin = {
  method: function (request, h) {
    const role = request.auth?.credentials?.role;
    if (role !== "admin") {
      throw Boom.forbidden("Admins only.");
    }
    return h.continue;
  },
  assign: "adminCheck",
};
