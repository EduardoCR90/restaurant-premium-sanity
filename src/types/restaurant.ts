import { z } from 'zod';
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const themeSchema = z.object({
 name:z.literal('salitre').default('salitre'), paper:color.default('#ece8df'), ink:color.default('#252d27'), accent:color.default('#95462f'),
 font:z.enum(['editorial','sans']).default('editorial'), button:z.enum(['solid','outline']).default('solid'), cards:z.enum(['editorial','compact']).default('editorial'),
});
export const moduleSchema = z.object({key:z.enum(['reservations','staff','qrMenu','events','analytics']),enabled:z.boolean().default(false),presentation:z.enum(['link','section']).default('link')});
// Las preferencias del CMS nunca constituyen permisos. La autorización llegará del backend.
export type ModuleEntitlement = { key:z.infer<typeof moduleSchema>['key']; authorized:boolean };
export function canUseModule(preference:z.infer<typeof moduleSchema>, entitlement?:ModuleEntitlement) { return preference.enabled && entitlement?.key === preference.key && entitlement.authorized === true; }
export function themeVariables(theme:z.infer<typeof themeSchema>) {
 return `--paper:${theme.paper};--ink:${theme.ink};--rust:${theme.accent};--serif:${theme.font === 'sans' ? "Arial,sans-serif" : "Georgia,'Times New Roman',serif"}`;
}
