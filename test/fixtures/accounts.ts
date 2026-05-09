/**
 * Fixtures for accounts-controller tests.
 * Use for POST /signup, POST /login, POST /account (update).
 */

export const signupPayload = {
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  password: "testpass123",
};

export const loginPayload = {
  email: signupPayload.email,
  password: signupPayload.password,
};

export const updatePayload = {
  firstName: "Updated",
  lastName: "Name",
  email: "updated@example.com",
};
