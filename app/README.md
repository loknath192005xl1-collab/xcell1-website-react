# Xcell1 website: React multi-page build

React (Vite) version of the multi-page Xcell1 website. **Same design as www.xcellsoftware.in**: the original CSS, fonts, header pill, day/night toggle, cards, footer and floating demo tab are unchanged. 65 pages (64 + 404), every page prerendered to its own HTML file so Google sees each page's title, description, FAQ schema and content.

## Run

```
cd d:\xcell1-website-react\app
npm install
npm run dev       # local dev server
npm run build     # production build into dist/ (also prerenders all pages)
npm run preview   # serve dist/ locally
```
Node 20 or newer. Deploy the `dist/` folder to any static host (Netlify, Vercel, Cloudflare Pages, S3, Nginx).

## Where things live

| What | File |
|---|---|
| Page content (one React component per page) | `src/pages/*.jsx` (e.g. `products__xcell1-meet.jsx` = `/products/xcell1-meet/`) |
| Title, meta description, canonical, Open Graph, JSON-LD per page | `src/data/meta.js` |
| Route list | `src/data/routes.js` |
| Header (menu, mega menus, mobile menu) | `src/components/Header.jsx` |
| Footer, floating demo tab and drawer, dialogs | `src/components/Footer.jsx` |
| Active menu link per page | `src/data/navPatches.js` |
| Layout, per-route head updates, client-side navigation | `src/Layout.jsx` |
| Interactions (dropdowns, theme, drawer, demo form, dialogs, scroll reveal) | `src/site.js` |
| Settings: lead endpoint, WhatsApp number, login action, not-ready pages | `src/config.js` |
| CSS, fonts, images (unchanged from the existing site) | `public/assets/`, `public/cards/`, `public/HeroSection/` |
| sitemap.xml, robots.txt, favicon, og-image | `public/` |

## Settings (`src/config.js`)
- `leadEndpoint`: empty = demo form opens WhatsApp (+91 90806 81711) with details filled in. Set a backend URL to receive leads as JSON.
- `demoLoginAction`: URL for the Start a Demo sign-in. Until connected, the dialog says access is shared by the team.
- `notReady`: pages that open the "still working on this page" dialog (Customers, Case studies, Blog, About us, Careers, Support, Multi-campus groups). Remove a path when its page is built.

## Xcell1 Meet
`/products/xcell1-meet/`. Title: Virtual Classroom Software for Live Classes | Xcell1 Meet. Primary keyword: virtual classroom software. Secondary: live class app for schools, online class platform with attendance, class recording software for colleges. Check search volumes before relying on them.

## Adding or editing a page
Edit the JSX in `src/pages/`, and its SEO fields in `src/data/meta.js`. For a new page, add the file, a `meta.js` entry, and a line in `src/data/routes.js`, and add the URL to `public/sitemap.xml`.

## Before launch
1. Connect `leadEndpoint` and `demoLoginAction`.
2. Paste the GA4 snippet where the comment in `index.html` says.
3. Confirm screenshot names are demo data; add the real Login URL and social links.
4. Home stats (1,250+ institutions, 2.4M+ students) come from the existing site. Confirm they are approved.

`tools/convert.mjs` is the one-time script that converted the earlier static HTML build into these components. It is not needed to run the site.
