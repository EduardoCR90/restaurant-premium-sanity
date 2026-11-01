import {
  pageCopy as sharedPageCopy,
  siteCopy as sharedSiteCopy,
  inherit,
} from "@restaurant-platform/astro-template/editorial";
import { originalDefaults } from "../instance/editorial-defaults";
import type { Content } from "../types/content";
export { originalDefaults } from "../instance/editorial-defaults";
export { visibleEditorialLink } from "@restaurant-platform/astro-template/editorial";
// Compatibility entry points for existing tools/tests; shared renderers receive resolved data.
export function pageCopy(page: Content["pages"][number]) {
  return sharedPageCopy({
    ...page,
    composition: inherit(originalDefaults.composition, page.composition),
  });
}
export function siteCopy(settings: Content["settings"]) {
  return sharedSiteCopy({
    ...settings,
    editorial: inherit(originalDefaults.editorial, settings.editorial),
  });
}
