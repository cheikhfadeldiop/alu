let pendingNewsCategoryId: number | null = null;

export function getPendingNewsCategoryId() {
  return pendingNewsCategoryId;
}

export function setPendingNewsCategoryId(categoryId: number | null) {
  pendingNewsCategoryId = categoryId;
}

export function clearPendingNewsCategoryId(categoryId?: number) {
  if (typeof categoryId === "number" && pendingNewsCategoryId !== categoryId) return;
  pendingNewsCategoryId = null;
}
