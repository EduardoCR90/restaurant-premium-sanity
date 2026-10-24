import { z } from 'zod';
export const safeUrl = z.string().url().refine(value => value.startsWith('https://'), 'Se requiere HTTPS');
export const imageSchema = z.object({ url: safeUrl, alt: z.string().min(1) });
export const seoSchema = z.object({ title: z.string().min(1), description: z.string().min(1), image: imageSchema.nullish() });
export const pageSchema = z.object({
 slug: z.enum(['inicio', 'carta', 'restaurante', 'reservas']),
 eyebrow: z.string().min(1), title: z.string().min(1), intro: z.string().min(1), image: imageSchema.nullish(), seo: seoSchema,
});
export const dishSchema = z.object({
 _id: z.string().min(1), name: z.string().min(1), description: z.string().min(1), price: z.number().nonnegative(),
 categoryId: z.string().min(1), allergens: z.array(z.string().min(1)).default([]), available: z.boolean(),
 featured: z.boolean().default(false), image: imageSchema.nullish(),
});
export const contentSchema = z.object({
 settings: z.object({
  name: z.string().min(1), tagline: z.string().min(1), concept: z.string().min(1), address: z.string().min(1),
  email: z.string().email(), phone: z.string().min(1), isFictional: z.boolean(),
  reservationUrl: safeUrl.nullish(), hours: z.array(z.object({ days: z.string().min(1), time: z.string().min(1) })),
 }),
 pages: z.array(pageSchema),
 categories: z.array(z.object({ _id: z.string().min(1), name: z.string().min(1), note: z.string().nullish() })),
 dishes: z.array(dishSchema),
 story: z.object({ title: z.string().min(1), body: z.string().min(1), philosophy: z.string().min(1), chefName: z.string().min(1), chefBio: z.string().min(1), image: imageSchema.nullish() }),
 gallery: z.array(imageSchema),
});
export type Content = z.infer<typeof contentSchema>;
export type EditorialImage = z.infer<typeof imageSchema>;
export type Dish = z.infer<typeof dishSchema>;
export type ContentResult = { content: Content; source: 'demo' | 'sanity'; warning?: string };
