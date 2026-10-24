import { z } from 'zod';
export const safeUrl = z.string().url().refine(value => value.startsWith('https://'), 'Se requiere HTTPS');
export const imageSchema = z.object({ url: safeUrl, alt: z.string().min(1) });
export const seoSchema = z.object({ title: z.string().min(1), description: z.string().min(1), image: imageSchema.nullish() });
export const pageSchema = z.object({
 slug: z.enum(['inicio', 'carta', 'restaurante', 'reservas']),
 eyebrow: z.string(), title: z.string(), intro: z.string(), image: imageSchema.nullish(), seo: seoSchema,
});
export const dishSchema = z.object({
 _id: z.string(), name: z.string().min(1), description: z.string(), price: z.number().nonnegative(),
 categoryId: z.string(), allergens: z.array(z.string()).default([]), available: z.boolean(),
 featured: z.boolean().default(false), image: imageSchema.nullish(),
});
export const contentSchema = z.object({
 settings: z.object({
  name: z.string(), tagline: z.string(), concept: z.string(), address: z.string(),
  email: z.string().email(), phone: z.string(), isFictional: z.boolean(),
  reservationUrl: safeUrl.nullish(), hours: z.array(z.object({ days: z.string(), time: z.string() })),
 }),
 pages: z.array(pageSchema),
 categories: z.array(z.object({ _id: z.string(), name: z.string(), note: z.string().nullish() })),
 dishes: z.array(dishSchema),
 story: z.object({ title: z.string(), body: z.string(), philosophy: z.string(), chefName: z.string(), chefBio: z.string(), image: imageSchema.nullish() }),
 gallery: z.array(imageSchema),
});
export type Content = z.infer<typeof contentSchema>;
export type EditorialImage = z.infer<typeof imageSchema>;
export type Dish = z.infer<typeof dishSchema>;
export type ContentResult = { content: Content; source: 'demo' | 'sanity'; warning?: string };
