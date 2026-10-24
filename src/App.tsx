import { useEffect } from "react";
import { NetworkCanvas } from "./components/layout/NetworkCanvas";
import { useRoute } from "./hooks/useRoute";
import { AboutPage } from "./pages/AboutPage";
import { BlogPage } from "./pages/BlogPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { PostEditorPage } from "./pages/PostEditorPage";
import { PostPage } from "./pages/PostPage";

export function App() {
  const route = useRoute();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [route]);

  let page = <HomePage />;
  if (route === "/about") page = <AboutPage />;
  if (route === "/contact") page = <ContactPage />;
  if (route === "/blog") page = <BlogPage />;
  if (route === "/new") page = <PostEditorPage />;
  if (route.startsWith("/edit/")) page = <PostEditorPage editId={decodeURIComponent(route.replace("/edit/", ""))} />;
  if (route.startsWith("/post/")) page = <PostPage id={decodeURIComponent(route.replace("/post/", ""))} />;

  return (
    <>
      <NetworkCanvas />
      {page}
      <footer className="site-footer">Copyright © Ouissem Salag 2026</footer>
    </>
  );
}
