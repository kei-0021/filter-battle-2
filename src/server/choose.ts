// src/server/choose.ts
import filters from "../data/filters.json" with { type: "json" };
import themes from "../data/themes.json" with { type: "json" };
import { FilterCategory } from "../types/gameTypes";

export function chooseRandomTheme(): string {
  const idx = Math.floor(Math.random() * themes.length);
  return themes[idx];
}

export function chooseRandomFilterCategory(usedFilters: Set<string>): FilterCategory {
  const filterCategories = Object.keys(filters) as FilterCategory[];
  const availableFilters = filterCategories.filter(
    (filter) => !usedFilters.has(filter)
  );
  const pool = availableFilters.length > 0 ? availableFilters : filterCategories;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ★ 新規関数：キーワードをランダムにN個抽出する
export function getRandomFilterKeywords(category: FilterCategory, count: number): string[] {
  const words = filters[category] || [];
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
