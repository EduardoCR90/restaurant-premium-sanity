import type { RestaurantConfigInput } from "@restaurant-platform/astro-template/config";
import { originalDefaults } from "./src/instance/editorial-defaults.ts";
export const restaurantConfig = {
  contractVersion: 1,
  restaurantKey: "salitre",
  site: {
    url: "https://eduardocr90.github.io",
    base: "/restaurant-premium-sanity",
  },
  sanity: { projectId: "hfa8zkyw", dataset: "production" },
  requiredSlugs: ["inicio", "carta", "restaurante", "reservas"],
  theme: {
    name: "salitre",
    paper: "#ece8df",
    ink: "#252d27",
    accent: "#95462f",
    muted: "#5c625a",
    line: "#b9b9aa",
    imagePlaceholder: "#c6c3b6",
    surface: "#d4d0c5",
    onDarkMuted: "#c4c6bc",
    darkLine: "#586057",
    font: "editorial",
    sansFont: "system",
    button: "solid",
    cards: "editorial",
    buttonShape: "square",
    gutterMin: 1.25,
    gutterVw: 5,
    gutterMax: 6,
    spaceMin: 4,
    spaceVw: 9,
    spaceMax: 10,
    contentMax: 1900,
    readingWidth: 48,
  },
  editorial: {
    composition: originalDefaults.composition,
    site: originalDefaults.editorial,
  },
  assets: {
    favicon: "/favicon.svg",
    socialImage: {
      path: "/og-default.jpg",
      alt: "Mesa de alta cocina, vajilla y copas con luz cálida · {name}",
      type: "image/jpeg",
      width: 1200,
      height: 630,
    },
    imageOrigins: ["https://images.unsplash.com"],
  },
  deployment: {
    provider: "github-pages",
    reportEndpoint:
      "https://wanrzgumoamryuybmopa.supabase.co/functions/v1/publications",
  },
} satisfies RestaurantConfigInput;
