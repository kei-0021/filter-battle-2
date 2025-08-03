// src/server/choose.ts
import filters from "../data/filters.json" with { type: "json" };
import themes from "../data/themes.json" with { type: "json" };

export function chooseRandomTheme(): string {
  const idx = Math.floor(Math.random() * themes.length);
  return themes[idx];
}

export function chooseRandomFilterCategory(usedFilters: Set<string>): string {
  const filterCategories = Object.keys(filters);
  const availableFilters = filterCategories.filter(
    (filter) => !usedFilters.has(filter)
  );
  const pool = availableFilters.length > 0 ? availableFilters : filterCategories;
  return pool[Math.floor(Math.random() * pool.length)];
}
