/**
 * User entity shape used across all store implementations.
 */
export interface User {
  _id?: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
