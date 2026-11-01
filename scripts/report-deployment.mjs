import { readFile, appendFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const endpoint = 'https://wanrzgumoamryuybmopa.supabase.co/functions/v1/publications';
/** @param {(path: string, encoding: 'utf8') => Promise<string>} [read] */
export async function reportDeployment(phase, env = process.env, fetcher = fetch, read = readFile) {
  if (!['building','ready','succeeded','failed'].includes(phase)) throw new Error('Invalid phase');
  let fingerprints = [];
  if (phase !== 'building') {
    try {
      const data = JSON.parse(await read('.publication-build.json','utf8'));
      if (data.runId !== env.GITHUB_RUN_ID || data.attempt !== env.GITHUB_RUN_ATTEMPT || data.sha !== env.GITHUB_SHA || !Array.isArray(data.fingerprints) || data.fingerprints.length>10000 || data.fingerprints.some((h) => typeof h !== 'string' || !/^[a-f0-9]{64}$/.test(h))) throw new Error('Evidence mismatch');
      fingerprints = data.fingerprints;
    } catch (error) { if (error.code !== 'ENOENT') throw new Error('Evidencia de build no válida'); }
    if (['ready','succeeded'].includes(phase) && !fingerprints.length) throw new Error('No se confirma un despliegue sin evidencia');
  }
  // El token efímero nunca se imprime, se guarda ni se sube como artefacto.
  const url = new URL(env.ACTIONS_ID_TOKEN_REQUEST_URL);
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.actions.githubusercontent.com')) throw new Error('Invalid identity endpoint');
  url.searchParams.set('audience','restaurant-platform-publications');
  const response = await fetcher(url,{headers:{Authorization:`Bearer ${env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}`},signal:AbortSignal.timeout(15000),redirect:'error'});
  if (!response.ok) throw new Error('GitHub identity communication failed');
  const {value} = await response.json();
  if (typeof value !== 'string' || value.length>16000) throw new Error('Invalid identity');
  const result = await fetcher(endpoint,{method:'POST',headers:{Authorization:`Bearer ${value}`,'Content-Type':'application/json'},body:JSON.stringify({action:'deployment_report',phase,fingerprints}),signal:AbortSignal.timeout(20000),redirect:'error'});
  if (!result.ok) throw new Error('Deployment report rejected');
  const recorded = await result.json();
  if (phase === 'ready' && env.GITHUB_OUTPUT && typeof recorded.deployRequired === 'boolean') await appendFile(env.GITHUB_OUTPUT, `deploy_required=${recorded.deployRequired}\n`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await reportDeployment(process.argv[2]); console.log('Seguimiento de publicación registrado.'); }
  catch {
    console.error('No se pudo registrar el seguimiento (identidad, conexión o evidencia). No se muestran respuestas ni credenciales. El dashboard no confirmará la web sin evidencia.');
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY,'\nEl informe de publicación no se pudo registrar. La publicación de Pages sigue su flujo habitual; el dashboard tratará la falta de confirmación explícitamente.\n');
    process.exitCode=1;
  }
}
