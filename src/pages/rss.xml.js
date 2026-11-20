import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const episodes = await getCollection("episodes");

  // Sort newest episodes first
  const sortedEpisodes = episodes.sort((a, b) => b.data.number - a.data.number);

  return rss({
    title: "Consolidated Radio",
    description: "Great Food // Classic Rock",
    site: context.site,

    items: sortedEpisodes.map((episode) => ({
      title: `Episode ${episode.data.number}: ${episode.data.title}`,
      description: episode.data.description,
      date: episode.data.date,
      link: `/episodes/${episode.data.number}/`,
    })),

    customData: `<language>en-us</language>`,
  });
}
