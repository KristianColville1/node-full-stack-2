/**
 * Contract for cafe-category storage. Mirrors the minimal-annotation pattern
 * used by IUserStore / ICafeStore — no fancy typing.
 */
export interface ICategoryStore {
  /** Add a new category. */
  addCategory(category: any): any;

  /** Get a category by case-insensitive name (returns the canonical record). */
  getByName(name: string): any;

  /** Get all categories, presets first then custom. */
  getAllCategories(): any;

  /**
   * Seed presets if the store is empty. Idempotent — does nothing if any
   * category already exists.
   */
  seedIfEmpty(seedList: any): any;
}
