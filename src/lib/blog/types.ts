export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  location?: string;
  legacyId?: string;
  // Pinned posts stay at the top of the blog page, whatever their date.
  pinned?: boolean;
  category?: string;
  image?: string;
  media?: {
    type: "image" | "video" | "embed";
    url: string;
  };
  // Optional photo shown for this post in the home page's "Little moments" feed.
  moment?: {
    image: string;
    caption?: string;
  };
};
