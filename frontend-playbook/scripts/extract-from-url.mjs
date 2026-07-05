#!/usr/bin/env node
// extract-from-url.mjs — sample a live URL's static styles AND motion behaviors.
// Outputs JSON with two blocks: `candidates` (static tokens -> DESIGN.md) + `behaviors` (motion findings -> Stage 3 re-implementation).
// Requires: `playwright` installed (npm i -D playwright) + chromium (npx playwright install chromium).
// Usage: node extract-from-url.mjs <url>
// This is observe + rebuild, NOT file copy. The agent re-implements motion thematically (cool serves content).
import { chromium } from 'playwright';

const url = process.argv[2];
if (!url) { console.error('Usage: node extract-from-url.mjs <url>'); process.exit(2); }

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500); // let SPA JS render settle before sampling
} catch (e) {
  console.error('navigation failed:', e.message, '\n(fallback: webfetch the URL + its CSS and parse manually)');
  await browser.close(); process.exit(1);
}

// ---------- 1. STATIC TOKEN CANDIDATES ----------
const targets = [
  { sel: 'h1', role: 'display' }, { sel: 'h2', role: 'heading' }, { sel: 'h3', role: 'heading' },
  { sel: 'p', role: 'body' }, { sel: 'a', role: 'link' },
  { sel: 'button, [class*=btn i], [class*=button i]', role: 'cta' },
  { sel: '[class*=card i], [class*=surface i]', role: 'card' },
  { sel: 'body', role: 'canvas' },
];
const styleProps = ['color','background-color','font-family','font-size','font-weight','line-height','letter-spacing','border-radius','padding','margin','box-shadow','border-color','border-width'];
const sampled = [];
for (const t of targets) {
  const els = await page.$$(t.sel).catch(() => []);
  for (const el of els.slice(0, 3)) {
    const styles = await el.evaluate((el, ps) => { const cs = getComputedStyle(el); const o = {}; ps.forEach(p => o[p] = cs.getPropertyValue(p)); return o; }, styleProps);
    const tag = await el.evaluate(el => el.tagName.toLowerCase() + '.' + (el.className||'').toString().slice(0,40));
    sampled.push({ selector: t.sel, role: t.role, tag, styles });
  }
}
const uniq = (a) => [...new Set(a.filter(v => v && v !== '0px' && v !== 'rgba(0, 0, 0, 0)'))];
const candidates = {
  colors: uniq(sampled.flatMap(s => [s.styles['color'], s.styles['background-color'], s.styles['border-color']])),
  fonts: uniq(sampled.map(s => s.styles['font-family'])),
  fontSizes: uniq(sampled.map(s => s.styles['font-size'])),
  fontWeights: uniq(sampled.map(s => s.styles['font-weight'])),
  radii: uniq(sampled.map(s => s.styles['border-radius'])),
  spacing: uniq(sampled.flatMap(s => [s.styles['padding'], s.styles['margin']])),
};

// ---------- 2. BEHAVIORS (interaction sweep) ----------
const behaviors = {};

// 2a. smooth-scroll lib detection
behaviors.smoothScroll = await page.evaluate(() => {
  const h = document.documentElement, b = document.body;
  return {
    lenis: h.classList.contains('lenis') || b?.classList.contains('lenis') || !!window.Lenis || !!document.querySelector('[class*=lenis i]'),
    locomotive: h.classList.contains('locomotive-scroll') || !!document.querySelector('[class*=locomotive i], [data-scroll-container]'),
    cssSmoothScroll: getComputedStyle(h).scrollBehavior === 'smooth',
  };
});

// 2b. transition/animation CSS on key elements
behaviors.transitions = await page.$$eval('h1, h2, button, a, [class*=card i], [class*=btn i], header, nav', els =>
  els.slice(0, 12).map(el => {
    const cs = getComputedStyle(el);
    return { tag: el.tagName.toLowerCase() + '.' + (el.className||'').toString().slice(0,40), transition: cs.transition, animation: cs.animation, transform: cs.transform, opacity: cs.opacity };
  }).filter(o => o.transition !== 'all 0s ease 0s' || o.animation !== 'none' || o.opacity !== '1' || o.transform !== 'none')
).catch(() => []);

// 2c. scroll-triggered diff (first sticky header/nav at y=0 vs y=600)
behaviors.scrollTriggered = [];
for (const sel of ['header', 'nav', '[class*=header i]', '[class*=nav i]']) {
  const el = await page.$(sel).catch(() => null);
  if (!el) continue;
  const before = await el.evaluate(e => { const cs = getComputedStyle(e); return { background: cs.backgroundColor, boxShadow: cs.boxShadow, height: cs.height, padding: cs.padding, position: cs.position, transform: cs.transform }; });
  try {
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(400);
    const after = await el.evaluate(e => { const cs = getComputedStyle(e); return { background: cs.backgroundColor, boxShadow: cs.boxShadow, height: cs.height, padding: cs.padding, position: cs.position, transform: cs.transform }; });
    const diff = {};
    for (const k of Object.keys(before)) if (before[k] !== after[k]) diff[k] = { before: before[k], after: after[k] };
    if (Object.keys(diff).length) behaviors.scrollTriggered.push({ selector: sel, diff });
  } catch {}
  break;
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(200);

// 2d. hover diff (first button + first card)
behaviors.hover = [];
for (const sel of ['button, [class*=btn i]', '[class*=card i]']) {
  const el = await page.$(sel).catch(() => null);
  if (!el) continue;
  const before = await el.evaluate(e => { const cs = getComputedStyle(e); return { background: cs.backgroundColor, color: cs.color, transform: cs.transform, boxShadow: cs.boxShadow, transition: cs.transition }; });
  try {
    await el.hover(); await page.waitForTimeout(300);
    const after = await el.evaluate(e => { const cs = getComputedStyle(e); return { background: cs.backgroundColor, color: cs.color, transform: cs.transform, boxShadow: cs.boxShadow, transition: cs.transition }; });
    const diff = {};
    for (const k of Object.keys(before)) if (before[k] !== after[k]) diff[k] = { before: before[k], after: after[k] };
    behaviors.hover.push({ selector: sel, diff: Object.keys(diff).length ? diff : null, transition: before.transition });
  } catch {}
}

// 2e. reveal candidates (opacity:0 or translated — likely animate-in on scroll)
behaviors.revealCandidates = await page.$$eval('[class*=reveal i], [class*=fade i], [class*=anim i], [data-animate]', els =>
  els.slice(0, 20).map(el => { const cs = getComputedStyle(el); return { tag: el.tagName.toLowerCase() + '.' + (el.className||'').toString().slice(0,40), opacity: cs.opacity, transform: cs.transform }; }).filter(o => o.opacity !== '1' || o.transform !== 'none')
).catch(() => []);

// 2f. interaction-model guess
const tabsOrClicks = await page.$$eval('[role=tab], [class*=tab i], [class*=pill i]', els => els.length).catch(() => 0);
const vids = await page.$$eval('video', els => ({ count: els.length, autoplay: els.filter(e => e.autoplay).length })).catch(() => ({count:0,autoplay:0}));
behaviors.interactionModelGuess = {
  scrollDriven: behaviors.scrollTriggered.length > 0 || behaviors.smoothScroll.lenis || behaviors.smoothScroll.locomotive,
  clickDriven: tabsOrClicks > 0,
  timeDriven: vids.autoplay > 0,
  note: 'best-effort guess from the sweep; confirm by watching the live site before re-implementing.',
};

console.log(JSON.stringify({
  url,
  note: 'candidates -> DESIGN.md (Stage 1). behaviors -> Stage 3 re-implement motion thematically (cool serves content). observe+rebuild, NOT file copy.',
  candidates,
  behaviors,
}, null, 2));

await browser.close();
