import { qs } from "../utils/dom.js";

export function initYearViewModel(root = document) {
  const year = qs("[data-year]", root);
  if (!year) return;
  year.textContent = String(new Date().getFullYear());
}
