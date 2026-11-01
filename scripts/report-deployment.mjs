import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import {
  reportDeployment as report,
  runReportCli,
} from "../vendor/restaurant-template/src/ops/report-deployment.mjs";
// This callback runs before npm ci in the existing workflow. Use distributed JS directly.
import { restaurantConfig } from "../restaurant.config.ts";
const environment = (env) => ({
  ...env,
  DEPLOYMENT_REPORT_URL:
    env.DEPLOYMENT_REPORT_URL || restaurantConfig.deployment.reportEndpoint,
});
/** @param {(path:string,encoding?:'utf8')=>Promise<string | Uint8Array>} [read] */
export function reportDeployment(
  phase,
  env = process.env,
  fetcher = fetch,
  read = readFile,
) {
  return report(phase, environment(env), fetcher, read);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await runReportCli(environment(process.env));
