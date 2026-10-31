// Writes one real HTML file per route (dist/<route>/index.html) with its own title, meta, JSON-LD and content.
import fs from 'fs'; import path from 'path'; import { pathToFileURL } from 'url';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const { render, allRoutes, meta } = await import(pathToFileURL(path.resolve('dist-ssr/entry-server.js')).href);
const tpl = fs.readFileSync('dist/index.html', 'utf8');
for (const route of allRoutes) {
  const m = meta[route]; const app = await render(route);
  const head = [`<title>${esc(m.title)}</title>`, `<meta name="description" content="${esc(m.description)}">`, `<link rel="canonical" href="${esc(m.canonical)}">`,
    ...Object.entries(m.og).map(([k, v]) => k.startsWith('og:') ? `<meta property="${k}" content="${esc(v)}">` : `<meta name="${k}" content="${esc(v)}">`),
    ...m.ld.map(j => `<script type="application/ld+json" data-ld="1">${j}</script>`)].join('\n');
  let html = tpl.replace('<!--head-->', head).replace('<!--app-->', app);
  if (m.home) html = html.replace('<body class="', '<body class="xl-home ');
  if (m.notReady) html = html.replace('<body ', `<body data-not-ready="${esc(m.notReady)}" `);
  const out = route.endsWith('.html') ? path.join('dist', route) : path.join('dist', route, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, html);
}
fs.rmSync('dist-ssr', { recursive: true, force: true });
console.log('Prerendered', allRoutes.length, 'pages');
