import { dashboardController } from "@/app/controllers/dashboard-controller.js";
import { aboutController } from "@/app/controllers/about-controller.js";
import { accountsController } from "@/app/controllers/accounts-controller.js";
import { cafeController } from "@/app/controllers/cafe-controller.js";
import { adminController } from "@/app/controllers/admin-controller.js";

// Frontend (web) routes. Anonymous-accessible routes set `auth: false` in the
// controller config so the default session strategy doesn't redirect-loop on
// unauthenticated requests. Admin routes are gated by `requireAdmin` declared
// as a `pre` handler on each admin controller config.
export const routes = [
  // Home — landing page and dashboard share the same controller.
  { method: "GET", path: "/", config: dashboardController.index },
  { method: "GET", path: "/dashboard", config: dashboardController.index },
  { method: "GET", path: "/about", config: aboutController.index },

  // Auth — signup, login, logout.
  { method: "GET", path: "/signup", config: accountsController.showSignup },
  { method: "POST", path: "/signup", config: accountsController.signup },
  { method: "GET", path: "/login", config: accountsController.showLogin },
  { method: "POST", path: "/login", config: accountsController.login },
  { method: "GET", path: "/logout", config: accountsController.logout },

  // Account — view, update, self-delete the current user.
  { method: "GET", path: "/account", config: accountsController.showAccount },
  { method: "POST", path: "/account", config: accountsController.updateAccount },
  { method: "POST", path: "/account/delete", config: accountsController.deleteAccount },

  // Cafes — list, add, browse by category, detail, delete (owner only).
  { method: "GET", path: "/cafes", config: cafeController.index },
  { method: "POST", path: "/cafes", config: cafeController.addCafe },
  { method: "GET", path: "/cafes/category/{category}", config: cafeController.byCategory },
  { method: "GET", path: "/cafes/{id}", config: cafeController.showCafe },
  { method: "POST", path: "/cafes/{id}/delete", config: cafeController.deleteCafe },

  // Admin — analytics dashboard + user management.
  { method: "GET", path: "/admin", config: adminController.index },
  { method: "GET", path: "/admin/users", config: adminController.listUsers },
  { method: "GET", path: "/admin/users/{id}", config: adminController.showUser },
  { method: "POST", path: "/admin/users/{id}/delete", config: adminController.deleteUser },

  // Static assets — must stay last; catch-all serves anything unmatched from /public.
  { method: "GET", path: "/{param*}", handler: { directory: { path: "./public" } }, options: { auth: false } },
];
