export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  location?: string;
  legacyId?: string;
  category?: string;
  image?: string;
  media?: {
    type: "image" | "video" | "embed";
    url: string;
  };
};
