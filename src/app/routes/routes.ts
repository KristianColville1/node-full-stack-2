import { dashboardController } from "@/app/controllers/dashboard-controller.js";
import { accountsController } from "@/app/controllers/accounts-controller.js";
import { cafeController } from "@/app/controllers/cafe-controller.js";
import { aboutController } from "@/app/controllers/about-controller.js";

/**
 * Routes for the frontend of the application.
 * Public routes use auth: false so session default does not redirect in a loop.
 */
export const routes = [
  { method: "GET", path: "/", config: dashboardController.index },
  { method: "GET", path: "/dashboard", config: dashboardController.index },
  { method: "GET", path: "/cafes", config: cafeController.index },
  { method: "POST", path: "/cafes", config: cafeController.addCafe },
  { method: "POST", path: "/cafes/{id}/delete", config: cafeController.deleteCafe },
  { method: "GET", path: "/about", config: aboutController.index },
  { method: "GET", path: "/signup", config: accountsController.showSignup },
  { method: "POST", path: "/signup", config: accountsController.signup },
  { method: "GET", path: "/login", config: accountsController.showLogin },
  { method: "POST", path: "/login", config: accountsController.login },
  { method: "GET", path: "/logout", config: accountsController.logout },
  { method: "GET", path: "/account", config: accountsController.showAccount },
  { method: "POST", path: "/account", config: accountsController.updateAccount },
  { method: "POST", path: "/account/delete", config: accountsController.deleteAccount },

  { method: "GET", path: "/{param*}", handler: { directory: { path: "./public" } }, options: { auth: false } },
];
