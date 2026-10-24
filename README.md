# Ouissem Portfolio

Personal portfolio and blog rebuilt with React, TypeScript, and Vite.

## Features

- React single-page app with Home, About, Blog, New Post, and Post views
- TypeScript blog storage utilities backed by `posts/posts.json`
- Owner-only post creation flow
- Interactive neural-network background, panel tilt, and click feedback
- Browser-safe profile image served from `public/profile.png`

## Run Locally

Install Node.js first, then run:

```bash
npm install
npm run dev
```

Open the Vite URL, usually:

```text
http://127.0.0.1:5173/
```

## Build

```bash
npm run build
```

The production build will be created in `dist/`.

## Project Structure

```text
├── index.html              Vite entry HTML
├── public/                 Static files served as-is (profile photo, favicon, blog media)
├── posts/posts.json        Blog posts — read and written at runtime via the GitHub API
├── assets/originals/       Unused source images kept for reference (not part of the site)
└── src/
    ├── main.tsx            React entry point
    ├── App.tsx             Route → page switch
    ├── config.ts           Repo, storage keys, and other site settings
    ├── pages/              One component per route
    │   ├── HomePage.tsx
    │   ├── AboutPage.tsx
    │   ├── ContactPage.tsx
    │   ├── BlogPage.tsx
    │   ├── PostPage.tsx         #/post/:id
    │   └── PostEditorPage.tsx   #/new and #/edit/:id
    ├── components/
    │   ├── layout/         SiteNav, NetworkCanvas background
    │   ├── blog/           PostCard, PostContent renderer, VideoPlayer
    │   ├── editor/         Image/video block editors, CropModal
    │   └── ContactLinks.tsx
    ├── hooks/              useRoute, useBlogPosts, useOwner
    ├── lib/
    │   ├── blog/           Post types, GitHub storage, sample posts, editor block format
    │   ├── auth.ts         Owner mode
    │   ├── router.ts       Hash-based navigation
    │   ├── format.ts       Dates, excerpts, placeholder images
    │   ├── files.ts        File → data URL helpers
    │   └── video.ts        YouTube URL helpers
    └── styles/
        ├── index.css       Imports every stylesheet in cascade order
        └── *.css           One file per area (base, home, blog, editor, responsive…)
```

`posts/posts.json` and `public/blog-media/` are referenced by path from the live site through the GitHub API, so don't move them.
