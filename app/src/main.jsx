import { StrictMode, useEffect, useState, useCallback } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import Layout from './Layout.jsx';
import { loaders, resolveRoute } from './pages.js';

function App({ initial, Initial }) {
  const [state, setState] = useState({ route: initial, Page: Initial });
  const go = useCallback(async (url, push = true) => {
    const u = new URL(url, location.href); const route = resolveRoute(u.pathname);
    const Page = (await loaders[route]()).default;
    if (push) history.pushState({}, '', u.pathname + u.search + u.hash);
    setState({ route, Page });
    if (u.hash) setTimeout(() => document.getElementById(u.hash.slice(1))?.scrollIntoView(), 0); else window.scrollTo(0, 0);
  }, []);
  useEffect(() => { const f = () => go(location.href, false); window.addEventListener('popstate', f); return () => window.removeEventListener('popstate', f); }, [go]);
  const { route, Page } = state;
  return <Layout route={route} navigate={go}><Page /></Layout>;
}

const route = resolveRoute(location.pathname);
const Initial = (await loaders[route]()).default;
const el = document.getElementById('root');
const app = <StrictMode><App initial={route} Initial={Initial} /></StrictMode>;
if (el.hasChildNodes()) hydrateRoot(el, app); else createRoot(el).render(app);
