// Curated Conversations podcast episodes.
// Audio files live in public/audio/slug.m4a (or .mp3).

export type Episode = {
  slug: string;
  title: string;
  excerpt: string;
  guest?: string;
  guestImage?: string;
  guestImageAlt?: string;
  date: string;
  dateLabel: string;
  duration: string;
  audio: string;
};

// Newest first. The index renders them in this order.
export const EPISODES: Episode[] = [
  {
    slug: "neuroscience-of-changing-behaviours",
    title: "The neuroscience of building a lasting strength-training habit",
    excerpt:
      "Why knowing that strength training matters is never enough to start doing it, and what the brain is actually doing when a new habit sticks.",
    guest:
      "With Dr Peter Steidl, MBA and PhD, co-founder of Neurothinking. His career has moved from brand strategy and neuromarketing to the science of behaviour change, including work with the World Health Organization on programs addressing physical activity, road safety and obesity.",
    guestImage: "/podcast/peter-steidl.jpg",
    guestImageAlt: "Dr Peter Steidl",
    date: "2026-08-27",
    dateLabel: "27 August 2026",
    duration: "35 min",
    audio: "/audio/neuroscience-of-changing-behaviours.m4a",
  },
];

export function getEpisode(slug: string): Episode | undefined {
  return EPISODES.find(function (episode) { return episode.slug === slug; });
}
