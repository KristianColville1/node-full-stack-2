import { db } from "@/core/data/db.js";
import {
  buildCategoryIndex,
  resolveCategoryStyle,
} from "@/app/data/categories.js";
import { requireAdmin } from "@/core/auth/require-admin.js";

function safeUser(user) {
  if (!user) return user;
  const copy = { ...user };
  delete copy.password;
  return copy;
}

function decorateCafes(cafes, allCategories) {
  const idx = buildCategoryIndex(allCategories);
  return cafes.map((c) => {
    const style = resolveCategoryStyle(c.category, idx);
    return { ...c, categoryColour: style.colour };
  });
}

function summariseCategories(cafes, allCategories) {
  const idx = buildCategoryIndex(allCategories);
  const counts = cafes
    .filter((c) => c.category)
    .reduce((acc, c) => {
      const style = resolveCategoryStyle(c.category, idx);
      const cur = acc.get(style.name) ?? { name: style.name, colour: style.colour, count: 0 };
      cur.count += 1;
      acc.set(style.name, cur);
      return acc;
    }, new Map());
  return [...counts.values()].sort((a, b) => b.count - a.count);
}

export const adminController = {
  /** GET /admin — analytics dashboard. */
  index: {
    pre: [requireAdmin],
    handler: async function (request, h) {
      const user = request.auth.credentials;
      const users = await db.userStore.getAllUsers();
      const cafes = await db.cafeStore.getAllCafes();
      const allCategories = (await db.categoryStore?.getAllCategories?.()) ?? [];

      const totalViews = cafes.reduce((acc, c) => acc + (c.analytics?.views ?? 0), 0);
      const avgCafesPerUser = users.length > 0 ? cafes.length / users.length : 0;

      const idx = buildCategoryIndex(allCategories);
      const topCafes = [...cafes]
        .sort((a, b) => (b.analytics?.views ?? 0) - (a.analytics?.views ?? 0))
        .slice(0, 5)
        .map((c) => ({
          ...c,
          categoryColour: resolveCategoryStyle(c.category, idx).colour,
          views: c.analytics?.views ?? 0,
        }));

      return h.view("admin-view", {
        title: "Admin",
        active: "admin",
        user,
        stats: {
          users: users.length,
          cafes: cafes.length,
          totalViews,
          avgCafesPerUser: Number(avgCafesPerUser.toFixed(1)),
        },
        topCafes,
        categorySummary: summariseCategories(cafes, allCategories),
      });
    },
  },

  /** GET /admin/users — list every user with their cafe count + delete action. */
  listUsers: {
    pre: [requireAdmin],
    handler: async function (request, h) {
      const user = request.auth.credentials;
      const users = await db.userStore.getAllUsers();
      const cafes = await db.cafeStore.getAllCafes();
      const cafeCount = cafes.reduce((acc, c) => {
        if (c.userId) acc.set(c.userId, (acc.get(c.userId) ?? 0) + 1);
        return acc;
      }, new Map());
      const error = request.query.error === "cannot-self-delete"
        ? "You can't delete your own admin account from here. Use Account → Delete account."
        : null;
      return h.view("admin-users-view", {
        title: "Users",
        active: "admin",
        user,
        users: users
          .map((u) => ({
            ...safeUser(u),
            cafeCount: cafeCount.get(u._id) ?? 0,
            isSelf: u._id === user._id,
          }))
          .sort((a, b) => {
            if (a.role !== b.role) return a.role === "admin" ? -1 : 1;
            return a.email.localeCompare(b.email);
          }),
        error,
      });
    },
  },

  /** GET /admin/users/{id} — single user + their cafes. */
  showUser: {
    pre: [requireAdmin],
    handler: async function (request, h) {
      const user = request.auth.credentials;
      const target = await db.userStore.getUserById(request.params.id);
      if (!target) return h.redirect("/admin/users");
      const allCafes = await db.cafeStore.getAllCafes();
      const allCategories = (await db.categoryStore?.getAllCategories?.()) ?? [];
      const owned = allCafes.filter((c) => c.userId === target._id);
      return h.view("admin-user-view", {
        title: target.email,
        active: "admin",
        user,
        target: safeUser(target),
        cafes: decorateCafes(owned, allCategories),
        cafeCount: owned.length,
        isSelf: target._id === user._id,
      });
    },
  },

  /** POST /admin/users/{id}/delete — cascade cafes, delete user. Self-delete blocked. */
  deleteUser: {
    pre: [requireAdmin],
    handler: async function (request, h) {
      const user = request.auth.credentials;
      const targetId = request.params.id;
      if (targetId === user._id) {
        return h.redirect("/admin/users?error=cannot-self-delete");
      }
      const target = await db.userStore.getUserById(targetId);
      if (!target) return h.redirect("/admin/users");
      await db.cafeStore.deleteByUserId(targetId);
      await db.userStore.deleteUser(targetId);
      return h.redirect("/admin/users");
    },
  },
};
