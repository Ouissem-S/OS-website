export function youtubeEmbedUrl(url: string) {
  if (!url.trim()) return "";
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    if (parsed.hostname.includes("youtube.com")) {
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      const shortsIndex = pathParts.indexOf("shorts");
      if (shortsIndex !== -1 && pathParts[shortsIndex + 1]) {
        return `https://www.youtube.com/embed/${pathParts[shortsIndex + 1]}`;
      }
      if (pathParts[0] === "embed" && pathParts[1]) {
        return `https://www.youtube.com/embed/${pathParts[1]}`;
      }
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (host.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsed.pathname.replace("/", "")}`;
    }
    return url;
  } catch {
    return url;
  }
}

export function isShortVideoUrl(url: string) {
  try {
    return new URL(url).pathname.includes("/shorts/");
  } catch {
    return false;
  }
}
