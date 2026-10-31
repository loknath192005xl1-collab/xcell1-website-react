import { useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { initSite } from './site.js';
import { meta } from './data/meta.js';
import './config.js';

function applyHead(route) {
  const m = meta[route]; if (!m) return;
  document.title = m.title;
  const set = (sel, make, attr, val) => { let el = document.head.querySelector(sel); if (!el) { el = make(); document.head.appendChild(el); } el.setAttribute(attr, val); };
  const mk = (tag, attrs) => () => { const e = document.createElement(tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); return e; };
  set('meta[name=description]', mk('meta', { name: 'description' }), 'content', m.description);
  set('link[rel=canonical]', mk('link', { rel: 'canonical' }), 'href', m.canonical);
  Object.entries(m.og).forEach(([k, v]) => { const sel = k.startsWith('og:') ? `meta[property="${k}"]` : `meta[name="${k}"]`; set(sel, mk('meta', k.startsWith('og:') ? { property: k } : { name: k }), 'content', v); });
  document.head.querySelectorAll('script[data-ld]').forEach(e => e.remove());
  m.ld.forEach(j => { const s = document.createElement('script'); s.type = 'application/ld+json'; s.setAttribute('data-ld', '1'); s.text = j; document.head.appendChild(s); });
}

export default function Layout({ route, navigate, children }) {
  useEffect(() => {
    const m = meta[route] || {};
    applyHead(route);
    document.body.classList.toggle('xl-home', !!m.home);
    if (m.notReady) document.body.dataset.notReady = m.notReady; else delete document.body.dataset.notReady;
    const off = initSite();
    // Client-side navigation for internal links (full HTML is still prerendered for SEO)
    const onClick = e => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = e.target.closest('a[href]'); if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      let u; try { u = new URL(a.getAttribute('href'), location.href); } catch { return; }
      if (u.origin !== location.origin || /\.[a-z0-9]+$/i.test(u.pathname) && !u.pathname.endsWith('.html')) return;
      if (u.pathname === location.pathname && u.hash) return;
      e.preventDefault(); navigate(u.pathname + u.search + u.hash);
    };
    document.addEventListener('click', onClick);
    return () => { off(); document.removeEventListener('click', onClick); };
  }, [route]);
  return (
    <div key={route} style={{ display: 'contents' }}>
      <Header route={route} />
      <main id="main" className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  );
}
