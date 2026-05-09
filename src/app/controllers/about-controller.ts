export const aboutController = {
  index: {
    auth: { mode: "try" },
    handler: async function (request, h) {
      const user = request.auth?.credentials ?? null;
      return h.view("about-view", { title: "About", active: "about", user });
    },
  },
};
