const BLOG_POSTS_KEY = "portfolio_blog_posts";
const BLOG_OWNER_KEY = "portfolio_blog_owner";
const BLOG_PASSWORD = "wissem-oui";

const samplePosts = [
    {
        id: "welcome-blog",
        title: "Welcome to my blog",
        excerpt: "A place for project notes, AI ideas, learning reflections, and small updates from my computer science journey.",
        content: "A place for project notes, AI ideas, learning reflections, and small updates from my computer science journey.",
        date: "2026-05-14",
        image: "",
        featured: true
    }
];

function getPosts() {
    const saved = JSON.parse(localStorage.getItem(BLOG_POSTS_KEY) || "[]");
    return saved.length ? saved : samplePosts;
}

function savePosts(posts) {
    localStorage.setItem(BLOG_POSTS_KEY, JSON.stringify(posts));
}

function isOwner() {
    return localStorage.getItem(BLOG_OWNER_KEY) === "true";
}

function requireOwner() {
    if (isOwner()) return true;

    const attempt = prompt("Owner password:");
    if (attempt === BLOG_PASSWORD) {
        localStorage.setItem(BLOG_OWNER_KEY, "true");
        return true;
    }

    localStorage.removeItem(BLOG_OWNER_KEY);
    return false;
}

function logoutOwner() {
    localStorage.removeItem(BLOG_OWNER_KEY);
    window.location.reload();
}

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function escapeHTML(value = "") {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function postUrl(post) {
    return `view-post.html?id=${encodeURIComponent(post.id)}`;
}

function createExcerpt(content, fallback = "") {
    const text = (content || fallback).trim().replace(/\s+/g, " ");
    return text.length > 150 ? `${text.slice(0, 147)}...` : text;
}

function defaultPostImage(title) {
    const initials = encodeURIComponent((title || "Post").slice(0, 2).toUpperCase());
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%23fff7fb'/%3E%3Cstop offset='0.52' stop-color='%23eaf6ff'/%3E%3Cstop offset='1' stop-color='%23f3ffe9'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='420' fill='url(%23g)'/%3E%3Ccircle cx='520' cy='88' r='70' fill='%23ffd6e6' opacity='.7'/%3E%3Ccircle cx='92' cy='330' r='90' fill='%23d7f5ee' opacity='.75'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Poppins, Arial' font-size='96' font-weight='700' fill='%236e2a4f'%3E${initials}%3C/text%3E%3C/svg%3E`;
}

function renderPostCard(post, options = {}) {
    const image = post.image || defaultPostImage(post.title);
    const excerpt = escapeHTML(post.excerpt || createExcerpt(post.content));
    const ownerControls = options.ownerControls && isOwner()
        ? `<button class="icon-action danger" type="button" data-delete-post="${escapeHTML(post.id)}" aria-label="Delete ${escapeHTML(post.title)}">Delete</button>`
        : "";

    return `
        <article class="post-card">
            <a class="post-card__media" href="${postUrl(post)}">
                <img src="${image}" alt="">
            </a>
            <div class="post-card__body">
                <div class="post-card__meta">${formatDate(post.date)}</div>
                <h3><a href="${postUrl(post)}">${escapeHTML(post.title)}</a></h3>
                <p>${excerpt}</p>
                <div class="post-card__footer">
                    <a class="text-link" href="${postUrl(post)}">Read post</a>
                    ${ownerControls}
                </div>
            </div>
        </article>
    `;
}

function renderPosts(targetId, options = {}) {
    const target = document.getElementById(targetId);
    if (!target) return;

    const posts = getPosts().slice(0, options.limit || getPosts().length);
    target.innerHTML = posts.length
        ? posts.map(post => renderPostCard(post, options)).join("")
        : `<div class="empty-state">No posts yet.</div>`;

    target.querySelectorAll("[data-delete-post]").forEach(button => {
        button.addEventListener("click", () => {
            const id = button.getAttribute("data-delete-post");
            const confirmed = confirm("Delete this post?");
            if (!confirmed) return;
            savePosts(getPosts().filter(post => post.id !== id));
            renderPosts(targetId, options);
        });
    });
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve("");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}
