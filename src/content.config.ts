import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const episodes = defineCollection({
  loader: glob({ base: './src/content/episodes', pattern: '**/*.json' }),
  schema: z.object({
    number: z.number(),
    title: z.string(),
    description: z.string(),
    audioSrc: z.string(),
    image: z.string(),
    tracks: z.array(z.object({
      artist: z.string(),
      title: z.string(),
    })),
    date: z.string()
  }),
});

export const collections = { episodes };