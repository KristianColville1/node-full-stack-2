/**
 * Cafe (POI) entity. Assignment: name, category, description, latitude, longitude, analytics, basic user.
 */
export interface Cafe {
  _id?: string;
  name: string;
  category: string;
  description: string;
  latitude?: number;
  longitude?: number;
  analytics?: { views?: number };
  userId?: string;
}
