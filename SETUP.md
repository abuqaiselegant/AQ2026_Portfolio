# Project setup – what you need

This doc lists everything the project depends on and what you need to configure.

---

## 1. Environment variables

**None.** The project runs with no `.env` file and no secrets.

---

## 2. Project pages

Each project in `content/projects/*.mdx` gets its own page at **`/projects/<slug>`**,
generated statically at build time. Clicking a project anywhere on the site opens that
page, which shows the banner, title, excerpt, tech tags, GitHub/live links, and the full
MDX body.

---

## 3. Content and assets

- **Blogs:** `content/blogs/*.mdx`
- **Projects:** `content/projects/*.mdx`
- **Project banners:** Each project needs `bannerLight` and `bannerDark` in frontmatter, pointing to images under `content/assets/`. Currently all use `../assets/betternews-light.png` and `../assets/betternews-dark.png`. To use custom images per project, add files to `content/assets/` and update the project’s frontmatter.

Velite builds this at `bun run dev` / `bun run build`; no extra step.

---

## 4. Resume PDF

- **`/resume`** is rewritten to **`/abuqais.pdf`** (see `next.config.ts`).
- You must have **`public/abuqais.pdf`** for the resume link to work. The repo has `resume.tex`; compile it to PDF and save as `public/abuqais.pdf`, or replace with your own PDF.

---

## 5. Site identity and links

**`src/config/site.config.ts`** holds:

- Site name, title, description, origin, OG image URL
- Email and social links (GitHub, X, LinkedIn, Medium, Buy Me a Coffee)

Update these for your own brand and links. No env vars needed; edit the file.

---

## 6. GitHub contributions widget

- Uses the public API `https://github-contributions-api.jogruber.de/v4/{username}`.
- Username is hardcoded as **`abuqaiselegant`** in `src/components/github-contributions.tsx`. Change it there if your GitHub username is different.
- No API key; the third-party service is public (and may have rate limits).

---

## 7. Deployment (e.g. Google Cloud Run)

- **Deploy script:** `bun run deploy` runs `gcloud run deploy --source .`, which builds the Dockerfile on Cloud Build. You need the **gcloud CLI** installed and logged in.
- No env vars are needed in the Cloud Run service.

---

## 8. Nothing else required

- **OG images:** `/api/og` uses `@vercel/og`; no extra config.
- **Book a call:** Section is a mailto link using `siteConfig.email`; no Cal.com or other service.
- **Theme:** next-themes; no env.

---

## Quick checklist

- [ ] Ensure `public/abuqais.pdf` exists for the resume link
- [ ] Update `src/config/site.config.ts` (name, origin, email, socials)
- [ ] If not abuqais: change GitHub username in `src/components/github-contributions.tsx`
- [ ] Run `bun install` then `bun run dev`
