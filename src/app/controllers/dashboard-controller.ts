import { db } from "@/core/data/db.js";

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const cafes = await db.cafeStore.getAllCafes();
      return h.view("dashboard-view", { title: "Dashboard", active: "dashboard", cafes, user: loggedInUser, showCafeDelete: false });
    },
  },
};
