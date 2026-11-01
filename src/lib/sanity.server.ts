import { readBuildEnvironment } from "./build-environment";
import { createContentClient as create } from "@restaurant-platform/astro-template/lib/sanity.server";
import {
  resolveConfiguration,
  type BuildEnvironment,
} from "@restaurant-platform/astro-template/config";
import { restaurantConfig } from "../../restaurant.config";
export function createContentClient(
  env: BuildEnvironment = readBuildEnvironment(),
) {
  const { sanity } = resolveConfiguration(restaurantConfig, env);
  if (!sanity.projectId)
    throw new Error("Configura el proyecto Sanity de la instancia");
  return create({
    projectId: sanity.projectId,
    dataset: sanity.dataset,
    token: env.SANITY_API_READ_TOKEN,
  });
}
