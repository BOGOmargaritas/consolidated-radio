import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  // Get published episodes only
  const episodes = await getCollection("episodes", ({ data }) => {
    return data.published === true && data.audioSrc;
  });

  // Newest episodes first
  const sortedEpisodes = episodes.sort((a, b) => b.data.number - a.data.number);

  // Get the actual MP3 file sizes from Cloudflare R2
  const items = await Promise.all(
    sortedEpisodes.map(async (episode) => {
      const { audioSrc, date, number, title, description } = episode.data;

      const response = await fetch(audioSrc, {
        method: "HEAD",
      });

      if (!response.ok) {
        throw new Error(
          `Could not access audio for episode ${number}: ${response.status}`,
        );
      }

      const fileSize = Number(response.headers.get("content-length"));

      if (!Number.isFinite(fileSize) || fileSize <= 0) {
        throw new Error(
          `Could not determine MP3 file size for episode ${number}`,
        );
      }

      // Convert dates like 2026-10-8 into valid dates
      const [year, month, day] = date.split("-");
      const pubDate = new Date(
        Date.UTC(Number(year), Number(month) - 1, Number(day)),
      );

      return {
        title,
        description,
        pubDate,
        link: `/episodes/${number}/`,

        // This is what makes the feed a podcast feed
        enclosure: {
          url: audioSrc,
          length: fileSize,
          type: "audio/mpeg",
        },
      };
    }),
  );

  return rss({
    title: "Consolidated Radio",
    description: "Independent radio, broadcasting 24/7.",
    site: context.site,
    items,

    xmlns: {
      itunes: "http://www.itunes.com/dtds/podcast-1.0.dtd",
    },

    customData: `
	  <language>en-us</language>
	  <itunes:author>Consolidated Radio</itunes:author>
	  <itunes:summary>Independent radio, broadcasting 24/7.</itunes:summary>
	  <itunes:category text="Music"/>
	`,
  });
}
