/**
 * Contract for cafe storage: CRUD, query, group by category.
 */
export interface ICafeStore {
  /**
   * Add a cafe to the store.
   * @param cafe 
   */
  addCafe(cafe: any): any;

  /**
   * Get a cafe by id.
   * @param id 
   */
  getCafeById(id: string): any;

  /**
   * Get all cafes.
   */
  getAllCafes(): any;

  /**
   * Update a cafe.
   * @param id 
   * @param cafe 
   */
  updateCafe(id: string, cafe: any): any;

  /**
   * Delete a cafe.
   * @param id 
   */
  deleteCafe(id: string): any;

  /**
   * Get cafes by category.
   * @param category
   */
  getByCategory(category: string): any;

  /**
   * Delete every cafe owned by the given user. Used for cascading
   * deletes when a user is removed (self-delete or admin-delete).
   * @param userId
   */
  deleteByUserId(userId: string): any;
}
