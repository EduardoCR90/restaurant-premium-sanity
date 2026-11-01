import { readBuildEnvironment } from "./build-environment";
import { createContentLoader } from "@restaurant-platform/astro-template/content";
import { restaurantConfig } from "../../restaurant.config";
import { mockContent } from "./mock";
import { recordDeploymentEvidence } from "../../scripts/deployment-evidence";
const loader = createContentLoader({
  configuration: restaurantConfig,
  environment: readBuildEnvironment(),
  mockContent,
  onSnapshot: recordDeploymentEvidence,
});
export const getContent = loader.getContent;
export { formatPrice } from "./format";
