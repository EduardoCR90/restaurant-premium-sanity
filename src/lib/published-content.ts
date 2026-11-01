import { resolvePublishedContent as resolve } from "@restaurant-platform/astro-template/lib/published-content";
import { mockContent } from "./mock";
import { restaurantConfig } from "../../restaurant.config";
export function resolvePublishedContent(raw: unknown) {
  return resolve(raw, {
    fallback: mockContent,
    requiredSlugs: restaurantConfig.requiredSlugs,
  });
}
