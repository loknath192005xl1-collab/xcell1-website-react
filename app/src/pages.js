// Page registry: route -> component. Lazy on the client, eager for prerender.
import { routes } from './data/routes.js';
const mods = import.meta.glob('./pages/*.jsx');
export const loaders = Object.fromEntries(routes.map(([r, n]) => [r, mods[`./pages/${n}.jsx`]]));
export const allRoutes = routes.map(r => r[0]);
export const normalize = p => (p.endsWith('/') || /\.[a-z0-9]+$/i.test(p) ? p : p + '/');
export const resolveRoute = p => { const n = normalize(p); return loaders[n] ? n : (p === '/404' ? '/404.html' : '/404.html'); };
