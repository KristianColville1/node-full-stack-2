import Joi from "joi";
import { db } from "@/core/data/db.js";
import { UserCredentialsSpec, UserSpec, UserUpdateSpec } from "@/app/data/schema/joi-schemas.js";

/** Accounts controller: main, signup, login, logout. */
export const accountsController = {
  /** GET / — Welcome (main) view. */
  index: {
    auth: false,
    handler: function (request, h) {
      return h.view("main", { title: "Welcome to Beanmap" });
    },
  },
  /** GET /signup — Show signup form. */
  showSignup: {
    auth: false,
    handler: function (_request, h) {
      return h.view("signup-view", { title: "Sign up for Beanmap", active: "signup", user: null });
    },
  },
  /** POST /signup — Create user, redirect /. */
  signup: {
    auth: false,
    handler: async function (request, h) {
      const user = Joi.attempt(request.payload, UserSpec);
      await db.userStore.addUser(user);
      return h.redirect("/");
    },
  },
  /** GET /login — Show login form. */
  showLogin: {
    auth: false,
    handler: function (request, h) {
      const error = request.query.error === "invalid" ? "Invalid email or password. No account found with those details." : null;
      return h.view("login-view", { title: "Login to Beanmap", active: "login", user: null, error });
    },
  },
  /** POST /login — Authenticate; on success set session and redirect /dashboard. */
  login: {
    auth: { mode: "try" },
    handler: async function (request, h) {
      const { email, password } = Joi.attempt(request.payload, UserCredentialsSpec);
      const user = await db.userStore.getUserByEmail(email);
      if (!user || user.password !== password) {
        return h.redirect("/login?error=invalid");
      }
      request.cookieAuth.set({ id: user._id });
      return h.redirect("/dashboard");
    },
  },
  /** GET /logout — Clear session, redirect /. */
  logout: {
    auth: { mode: "try" },
    handler: function (request, h) {
      if (request.cookieAuth) {
        request.cookieAuth.clear();
      }
      return h.redirect("/");
    },
  },

  showAccount: {
    handler: function (request, h) {
      const user = request.auth.credentials;
      return h.view("account-view", { title: "Account", active: "account", user });
    },
  },

  updateAccount: {
    handler: async function (request, h) {
      const user = request.auth.credentials;
      const updates = Joi.attempt(request.payload, UserUpdateSpec);
      const existing = await db.userStore.getUserByEmail(updates.email);
      if (existing && existing._id !== user._id) {
        return h.redirect("/account");
      }
      await db.userStore.updateUser(user._id, updates);
      return h.redirect("/account");
    },
    validate: { payload: UserUpdateSpec },
  },

  deleteAccount: {
    handler: async function (request, h) {
      const user = request.auth.credentials;
      if (request.cookieAuth) request.cookieAuth.clear();
      await db.userStore.deleteUser(user._id);
      return h.redirect("/");
    },
  },

  async validate(request, session) {
    const user = await db.userStore.getUserById(session.id);
    if (!user) {
      return { isValid: false };
    }
    return { isValid: true, credentials: user };
  },
};
