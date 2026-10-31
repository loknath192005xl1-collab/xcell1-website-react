// One-time converter: static HTML build -> React components. Usage: node tools/convert.mjs <path-to-static-repo>
import fs from 'fs'; import path from 'path'; import * as cheerio from 'cheerio'; import * as m from 'html-to-jsx-transform';
const SRC = process.argv[2], OUT = path.resolve('src'); const toJsx = m.htmlToJsx;
const files = []; (function walk(d){ for (const e of fs.readdirSync(d,{withFileTypes:true})) { const p=path.join(d,e.name);
  if (e.isDirectory()) { if(!['.git','node_modules'].includes(e.name)) walk(p); } else if (e.name==='index.html'||(d===SRC&&e.name==='404.html')) files.push(p); } })(SRC);
const sp = h => h.replace(/>( )</g,'>XLSPACEX<');
const fix = s => s.replace(/ checked=\{true\}/g,' defaultChecked').replace(/ selected=\{true\}/g,'').replace(/<script[\s\S]*?<\/script>/g,'').replace(/XLSPACEX/g,'{" "}');
const routeOf = f => { const r=path.relative(SRC,f).replace(/\\/g,'/'); return r==='404.html'?'/404.html':'/'+r.replace(/index\.html$/,''); };
const nameOf = r => r==='/'?'home':r==='/404.html'?'not-found':r.replace(/^\/|\/$/g,'').replace(/\//g,'__');
const classCount = html => { const $=cheerio.load(html,null,false); const a=[]; $('*').each((_,e)=>{ if(e.attribs.class!==undefined) a.push([e.attribs.class,e.attribs['aria-current']??null]); }); return a; };
const pages=[]; for (const f of files) { const h=fs.readFileSync(f,'utf8'); const route=routeOf(f);
  const body=h.match(/<body([^>]*)>([\s\S]*?)<main[^>]*>([\s\S]*)<\/main>([\s\S]*)<\/body>/); if(!body){console.log('skip',f);continue;}
  const $=cheerio.load(h); const head=[]; head.push(['title',$('title').text()]);
  const meta={ title:$('title').text(), description:$('meta[name=description]').attr('content')||'', canonical:$('link[rel=canonical]').attr('href')||'',
    og:Object.fromEntries($('meta[property^="og:"],meta[name^="twitter:"],meta[name=robots]').map((_,e)=>[[e.attribs.property||e.attribs.name,e.attribs.content]]).get()),
    ld:$('script[type="application/ld+json"]').map((_,e)=>$(e).html()).get(),
    notReady:(body[1].match(/data-not-ready="([^"]*)"/)||[])[1]||null, home:/xl-home/.test(body[1]) };
  pages.push({route,name:nameOf(route),meta,pre:body[2],main:body[3],post:body[4]}); }
// Shell: base header = page with no active item (contact), patches = per-route differences
const base=pages.find(p=>p.route==='/contact/')||pages[0]; const baseCls=classCount(base.pre); const patches={}; const acIdx=new Set(), diffIdx=new Set();
for (const p of pages) { const c=classCount(p.pre); if(c.length!==baseCls.length) throw new Error('shell mismatch '+p.route); const ps=[];
  c.forEach((x,i)=>{ if(x[0]!==baseCls[i][0]||x[1]!==baseCls[i][1]){ ps.push([i,x[0],x[1]]); diffIdx.add(i); if(x[1]!==null||baseCls[i][1]!==null) acIdx.add(i);} }); if(ps.length) patches[p.route]=ps; }
let hj=fix(toJsx(sp(base.pre))); let k=0; hj=hj.replace(/className="([^"]*)"/g,(all,c)=>{ const i=k++; if(!diffIdx.has(i)) return all; return `className={c(${i},${JSON.stringify(c)})}`+(acIdx.has(i)?` aria-current={ac(${i})}`:''); });
if(k!==baseCls.length) console.warn('className count',k,baseCls.length);
fs.mkdirSync(OUT+'/components',{recursive:true});
fs.writeFileSync(OUT+'/components/Header.jsx',`// Generated from the existing site header. Active-link styles come from navPatches (per route).\nimport { navPatches } from '../data/navPatches.js';\nexport default function Header({ route }) {\n  const p = navPatches[route] || [];\n  const c = (i, d) => { const x = p.find(y => y[0] === i); return x ? x[1] : d; };\n  const ac = i => { const x = p.find(y => y[0] === i); return x && x[2] ? x[2] : undefined; };\n  return (<>${hj}</>);\n}\n`);
fs.writeFileSync(OUT+'/components/Footer.jsx',`// Generated from the existing site footer, floating demo tab, drawer and dialogs.\nexport default function Footer() {\n  return (<>${fix(toJsx(sp(base.post)))}</>);\n}\n`);
fs.mkdirSync(OUT+'/data',{recursive:true});
fs.writeFileSync(OUT+'/data/navPatches.js','export const navPatches = '+JSON.stringify(patches)+';\n');
fs.writeFileSync(OUT+'/data/meta.js','export const meta = '+JSON.stringify(Object.fromEntries(pages.map(p=>[p.route,p.meta])),null,1)+';\n');
for (const p of pages) fs.writeFileSync(`${OUT}/pages/${p.name}.jsx`,`// ${p.route}\nexport default function Page() {\n  return (<>${fix(toJsx(sp(p.main)))}</>);\n}\n`);
fs.writeFileSync(OUT+'/data/routes.js','export const routes = '+JSON.stringify(pages.map(p=>[p.route,p.name]))+';\n');
console.log('pages',pages.length,'patched routes',Object.keys(patches).length,'diff idx',diffIdx.size);
