import { defineCollection, z } from "astro:content";

const glossary = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    category: z.string(),
    description: z.string(),
    related: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    lastUpdated: z.date().optional(),
  }),
});

export const collections = {
  glossary,
};
