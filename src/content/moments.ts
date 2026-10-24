// The "Little moments" feed on the home page shows these pinned posts first, then one
// moment for each blog post that has one (set in the blog editor under "Little moment").
// `image` is relative to the public/ folder.

export type Moment = {
  image: string;
  caption: string;
  place?: string;
  link?: { href: string; label: string };
};

const RTSC_COVER =
  "blog-media/1778794768669-real-time-data-sensor-calibration-university-of-nottingham-school-of-computer-science-cover-1778827606882-tw8wjm.jpg";

// A pinned moment that links to a blog post is hidden once that post gets its own moment in the editor.
export const pinnedMoments: Moment[] = [
  {
    image: RTSC_COVER,
    caption: "Showcase day with my team for our Real-time Sensor Calibration project 🎉",
    place: "University of Nottingham",
    link: { href: "#/post/rtsc", label: "Read the post" }
  },
  {
    image: "gabriele-malaspina-CjWsslYVnPI-unsplash.jpg",
    caption: "Lately I've been reading about AI moving off our screens and into robots that can learn and act 🤖",
    link: { href: "#/post/ai-robotics-physical-world", label: "Read the post" }
  }
];
