/**
 * Promote the user matching ADMIN_EMAIL to role="admin" at server start.
 * Idempotent — does nothing if the user already has the role, and logs
 * a warning (rather than throwing) if the user hasn't signed up yet so
 * a fresh deploy boots cleanly.
 */
export async function ensureAdmin(adminEmail, userStore) {
  if (!adminEmail) return;
  if (!userStore?.getUserByEmail || !userStore?.updateUser) return;

  const user = await userStore.getUserByEmail(adminEmail);
  if (!user) {
    console.warn(
      `[admin] ADMIN_EMAIL="${adminEmail}" not found in user store. Will be promoted on next start once that account signs up.`,
    );
    return;
  }
  if (user.role === "admin") return;
  await userStore.updateUser(user._id, { role: "admin" });
  console.log(`[admin] Promoted ${adminEmail} to admin.`);
}
