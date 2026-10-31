import type { Content } from "../types/content";
export const originalDefaults = {
  composition: {
    hero: {
      caption: "01 / Una mesa abierta al Atlántico",
      coordinates: "28°28′ N\n16°15′ O",
      sideNote: "TIERRA · FUEGO · ATLÁNTICO",
      link: {
        label: "Descubrir la carta",
        href: "/carta/",
      },
    },
    essence: {
      eyebrow: "01 — Nuestra esencia",
      heading: {
        before: "Lo extraordinario\nestá en ",
        emphasis: "el origen.",
        after: "",
      },
      link: {
        label: "La filosofía de la casa",
        href: "/restaurante/",
      },
    },
    featured: {
      eyebrow: "02 — En temporada",
      heading: {
        before: "La isla, ",
        emphasis: "en tres actos.",
        after: "",
      },
      link: {
        label: "Ver toda la carta",
        href: "/carta/",
      },
      empty:
        "La próxima selección de temporada está en preparación. Consulta nuestra carta.",
    },
    storyPreview: {
      eyebrow: "03 — La casa",
      link: {
        label: "Nuestra historia",
        href: "/restaurante/",
      },
    },
    story: {
      eyebrow: "Una historia de pertenencia",
    },
    chef: {
      eyebrow: "Al frente de la cocina",
    },
    gallery: {
      eyebrow: "El arte de recibir",
      heading: {
        before: "Luz, materia ",
        emphasis: "y calma.",
        after: "",
      },
      empty: "Próximamente, nuevas miradas a la casa.",
    },
    contact: {
      eyebrow: "01 — Tu mesa",
      heading: {
        before: "Nos vemos ",
        emphasis: "aquí.",
        after: "",
      },
      providerLabel: "Reservar con nuestro proveedor",
      hoursTitle: "Cuándo venir",
      addressTitle: "Dónde encontrarnos",
      unavailable:
        "Las reservas todavía no están activas. Este espacio está preparado para conectar un proveedor real; no se tramita ni se confirma ninguna reserva.",
    },
  },
  editorial: {
    signature: "COCINA DE ORIGEN",
    footer: {
      line: "El lujo de estar aquí.",
      link: {
        label: "Encuéntranos",
        href: "/reservas/",
      },
      backToTop: "Volver arriba",
    },
    reservation: {
      eyebrow: "El tiempo, a tu favor",
      heading: {
        before: "Quédate\n",
        emphasis: "un poco más.",
        after: "",
      },
      link: {
        label: "Tu próxima mesa",
        href: "/reservas/",
      },
    },
    menu: {
      emptyCategory: "Estamos preparando esta selección.",
      emptyMenu: "La carta de temporada estará disponible próximamente.",
      disclaimer:
        "Precios en euros. IVA incluido. Comunica cualquier alergia o intolerancia al equipo; puede haber trazas por contaminación cruzada. La disponibilidad sigue el ritmo de la temporada.",
      noAllergens: "Sin alérgenos declarados",
      unavailable: "Temporalmente no disponible",
    },
  },
} as const;
// Merge only missing/null values. Headings are atomic so a custom heading can omit emphasis.
type Widen<T> = T extends string
  ? string
  : T extends { label: string; href: string }
    ? { label: string; href: string } | null
    : T extends object
      ? { [K in keyof T]: Widen<T[K]> }
      : T;
function inherit<T>(base: T, value: unknown): Widen<T> {
  if (
    value === null &&
    typeof base === "object" &&
    base !== null &&
    "href" in base
  )
    return null as Widen<T>;
  if (value == null) return structuredClone(base) as Widen<T>;
  if (typeof base !== "object" || base === null || Array.isArray(base))
    return value as Widen<T>;
  if ("before" in base) {
    const h = value as Record<string, unknown>;
    return {
      before: h.before ?? "",
      emphasis: h.emphasis ?? "",
      after: h.after ?? "",
    } as Widen<T>;
  }
  return Object.fromEntries(
    Object.entries(base).map(([key, fallback]) => [
      key,
      inherit(fallback, (value as Record<string, unknown>)[key]),
    ]),
  ) as Widen<T>;
}
export function pageCopy(page: Content["pages"][number]) {
  return inherit(originalDefaults.composition, page.composition);
}
export function siteCopy(settings: Content["settings"]) {
  return inherit(originalDefaults.editorial, settings.editorial);
}

export function visibleEditorialLink(
  content: Content,
  link: { href: string; label: string } | null,
) {
  if (!link) return false;
  if (!link.href.startsWith("/")) return true;
  const route = link.href.split(/[?#]/)[0].replace(/^\/|\/$/g, "");
  const slug = route || "inicio";
  return content.pages.some((p) => p.slug === slug && p.status === "published");
}
