import { z } from "zod";
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const themeSchema = z.object({
  name: z
    .string()
    .regex(/^[a-z0-9-]{1,64}$/)
    .default("default"),
  paper: color.default("#f7f7f5"),
  ink: color.default("#222222"),
  accent: color.default("#555555"),
  surface: color.default("#eeeeee"),
  onDarkMuted: color.default("#cccccc"),
  darkLine: color.default("#555555"),
  muted: color.default("#666666"),
  line: color.default("#cccccc"),
  imagePlaceholder: color.default("#dddddd"),
  font: z.enum(["editorial", "sans"]).default("editorial"),
  sansFont: z.enum(["system", "humanist", "mono"]).default("system"),
  button: z.enum(["solid", "outline"]).default("solid"),
  cards: z.enum(["editorial", "compact"]).default("editorial"),
  buttonShape: z.enum(["square", "soft", "pill"]).default("square"),
  gutterMin: z.number().min(0.5).max(4).default(1.25),
  gutterVw: z.number().min(1).max(10).default(5),
  gutterMax: z.number().min(4).max(12).default(6),
  spaceMin: z.number().min(1).max(8).default(4),
  spaceVw: z.number().min(1).max(15).default(9),
  spaceMax: z.number().min(8).max(20).default(10),
  contentMax: z.number().int().min(960).max(2560).default(1900),
  readingWidth: z.number().min(24).max(64).default(48),
});
export const moduleSchema = z.object({
  key: z.enum(["reservations", "staff", "qrMenu", "events", "analytics"]),
  enabled: z.boolean().default(false),
  presentation: z.enum(["link", "section"]).default("link"),
});
export type Theme = z.infer<typeof themeSchema>;
export type ModuleEntitlement = {
  key: z.infer<typeof moduleSchema>["key"];
  authorized: boolean;
};
export function canUseModule(
  preference: z.infer<typeof moduleSchema>,
  entitlement?: ModuleEntitlement,
) {
  return (
    preference.enabled &&
    entitlement?.key === preference.key &&
    entitlement.authorized === true
  );
}
export function themeVariables(theme: Theme) {
  const sans = {
    system: "'Helvetica Neue',Arial,sans-serif",
    humanist: "Verdana,Geneva,sans-serif",
    mono: "monospace",
  }[theme.sansFont];
  const radius = { square: "0", soft: ".35rem", pill: "3rem" }[
    theme.buttonShape
  ];
  return `--paper:${theme.paper};--ink:${theme.ink};--rust:${theme.accent};--serif:${theme.font === "sans" ? "Arial,sans-serif" : "Georgia,'Times New Roman',serif"};--sans:${sans};--muted:${theme.muted};--line:${theme.line};--image-placeholder:${theme.imagePlaceholder};--surface:${theme.surface};--on-dark-muted:${theme.onDarkMuted};--dark-line:${theme.darkLine};--gutter:clamp(${theme.gutterMin}rem,${theme.gutterVw}vw,${theme.gutterMax}rem);--space:clamp(${theme.spaceMin}rem,${theme.spaceVw}vw,${theme.spaceMax}rem);--content-max:${theme.contentMax}px;--reading-width:${theme.readingWidth}rem;--button-radius:${radius}`;
}
