export function createExcerpt(content: string) {
  const text = content.trim().replace(/\s+/g, " ");
  return text.length > 150 ? `${text.slice(0, 147)}...` : text;
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

// Normalises a stored post date to the YYYY-MM-DD value a date input expects.
export function dateInputValue(value?: string) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function createPostId() {
  return `post-${Date.now().toString(36).slice(-7)}`;
}

export function defaultPostImage(title: string) {
  const initials = encodeURIComponent(title.slice(0, 2).toUpperCase() || "WE");
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%23fff7fb'/%3E%3Cstop offset='0.52' stop-color='%23eaf6ff'/%3E%3Cstop offset='1' stop-color='%23f3ffe9'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='420' fill='url(%23g)'/%3E%3Ccircle cx='520' cy='88' r='70' fill='%23ffd6e6' opacity='.7'/%3E%3Ccircle cx='92' cy='330' r='90' fill='%23d7f5ee' opacity='.75'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Poppins, Arial' font-size='96' font-weight='700' fill='%237a315f'%3E${initials}%3C/text%3E%3C/svg%3E`;
}
