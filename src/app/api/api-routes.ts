import { cafeApi } from "@/app/api/cafe-api.js";
import { userApi } from "@/app/api/user-api.js";

/**
 * API routes for CRUD. Backend JSON only, no views.
 * Controllers handle frontend (views, redirects); api/* handles API.
 */
export const apiRoutes = [
  ...[
    { method: "POST", path: "/api/users", config: userApi.create },
    { method: "POST", path: "/api/users/authenticate", config: userApi.authenticate },
  ],
  ...[
    { method: "GET", path: "/api/cafes", config: cafeApi.list },
    { method: "GET", path: "/api/cafes/category/{category}", config: cafeApi.getByCategory },
    { method: "GET", path: "/api/cafes/{id}", config: cafeApi.getOne },
    { method: "POST", path: "/api/cafes", config: cafeApi.create },
    { method: "PUT", path: "/api/cafes/{id}", config: cafeApi.update },
    { method: "DELETE", path: "/api/cafes/{id}", config: cafeApi.remove },
  ],
];
