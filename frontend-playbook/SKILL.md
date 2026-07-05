---
name: frontend-playbook
description: Use when starting a greenfield frontend project, a new page or section, or a restyle pass that spans the full design-to-verify flow — design tokens, UI build, animation/motion, performance audit, and end-to-end testing — across React, Vue, Svelte, or vanilla stacks. Do NOT use for single-component tweaks, pure backend/API work, bug fixes in existing code, or one-off questions about a single skill (load design-md, frontend-design, gsap-*, performance-optimization, or webapp-testing directly instead).
license: Internal (authored to orchestrate installed skills)
---

# frontend-playbook

Conductor for the frontend toolbox. Tells you **which skill to run, in what order, and how to verify each stage** — nothing more. For depth, load the skill each stage names. Do not re-implement their expertise here.

Stack-agnostic (branches on React / Vue / Svelte / vanilla). Lenis smooth scroll is **default-on site-wide**, always gated behind `prefers-reduced-motion`.

## Stage 0 — Detect stack (run first, before anything)

**Pre-flight (idempotent, ~seconds):** run `scripts/ensure-prereqs.ps1` (Windows) or `scripts/ensure-prereqs.sh` (Unix) — relative to this skill's base directory — to detect and auto-install any missing prerequisite skills (`frontend-design`, `webapp-testing`, `gsap-*`; `performance-optimization` is optional and skipped). Auto-pull goes through opencode's bash permission gate, so the user stays in control. Skip only if you have confirmed all are present.

Read `package.json` and config files. State the detected stack out loud before building — this choice ripples through every later stage.

| Detect | Stack | gsap skill | Lenis integration | frontend-design output |
|---|---|---|---|---|
| `react` / `next` in deps | React / Next | **gsap-react** | React hook (`useLenis`) | JSX + Tailwind classes |
| `vue` / `nuxt` | Vue / Nuxt | **gsap-frameworks** | Vue composable | `.vue` SFC |
| `svelte` / `sveltekit` | Svelte | **gsap-frameworks** | Svelte action | `.svelte` |
| none of the above / plain `.html` | Vanilla | **gsap-core** | `<script type="module">` | HTML + CSS |

**design.md export format** (used in Stage 1): `tailwind.config.js` present → Tailwind v3 `--format json-tailwind`; only `@import "tailwindcss"` / `@tailwindcss/vite` → Tailwind v4 `--format css-tailwind`; no Tailwind → `--format dtcg`.

## Stage 0.5 — Clone from URL (optional, conditional)

Triggered only when the user wants to replicate a reference site's look. Three-way decision:

- User gave a URL or said "复刻 / clone / 参考 <site>" → run this stage.
- User gave aesthetic direction (colors / fonts / mood) but no URL → **skip**, go to Stage 1.
- User gave neither → ask once via the `question` tool: "有参考网站吗？给 URL 我复刻它的设计系统；没有就跳过，我给你定一套。" If skipped → Stage 1.

If triggered:

1. Ensure Playwright is available — run `npm i -D playwright` and `npx playwright install chromium` if not already present (reuses the `webapp-testing` prerequisite's stack).
2. Run `scripts/extract-from-url.mjs <url>` (relative to this skill's base directory) → JSON token candidates sampled from the live page's computed styles (colors / fonts / sizes / weights / radii / spacing).
3. Name + dedupe the candidates, normalize color formats, add rationale (why each color / font / spacing), author `DESIGN.md` from them.
4. Hand off to Stage 1's `designmd lint` to validate — fix broken refs / contrast failures surfaced there.

**Fallback:** if Playwright is blocked by the site (anti-bot) or unavailable, use `webfetch` on the URL + its linked CSS files and parse tokens manually. Lower fidelity — note this in the final report.

**Fidelity note:** this samples a few elements and infers a token system — good for "复刻大概感觉", not pixel-perfect brand cloning. For higher fidelity the user can install a dedicated extractor skill (see README); not bundled by default.

## Stage 1 — Baseline (skill: design-md)

Author `DESIGN.md` at project root (YAML front-matter tokens + markdown rationale, section order per design-md spec). Lint. Export to the format from Stage 0.

**Verify gate — must pass before Stage 2:**
- `npx -p "@google/design.md" designmd lint DESIGN.md` → exit `0`, zero `error`-severity findings.
- Fix every `broken-ref` and duplicate-section (errors). Fix `contrast-ratio` warnings (WCAG AA). `orphaned-tokens` / `missing-*` are advisory.
- Windows: invoke the `designmd` alias (not `design.md`) — the `.md` suffix collides with the Markdown file association.
- Artifact out: `DESIGN.md` + exported theme file (`tailwind.theme.json` / `theme.css` / `tokens.json`).

## Stage 2 — Build UI (skill: frontend-design)

Hand frontend-design the `DESIGN.md` path **and** the exported theme. Instruct it to execute its bold aesthetic **within** the token system — no ad-hoc hex, fonts, or spacing outside DESIGN.md. If a needed value is missing, **add it to DESIGN.md and re-export** rather than inlining.

**Verify gate:**
- Spot-check rendered computed `color` / `font-family` / `border-radius` on key elements == DESIGN.md tokens.
- Grep the codebase for hardcoded hex colors outside the exported theme → expect none.

## Stage 3 — Motion (skills: gsap-* + Lenis)

Load the gsap variant from Stage 0. Add animation. Lenis is **default-on site-wide**.

- **Thematic motion (design rule):** every effect must tie to the project's subject — the motion metaphor derives from the domain (photography → shutter / aperture / film grain / exposure; finance → counting / data ticks / precision; outdoor / sports → parallax / momentum; music → waveform / beat). Cool serves content, not itself — reject flashy-but-irrelevant effects (no skiing effect on a photography site). State the metaphor you chose and why before implementing.
- **Lean gsap for the cool stuff:** GSAP for timelines / choreography / scroll-linked / FLIP / SVG morph; CSS-only for simple hovers/transitions. Don't escalate to GSAP where CSS suffices (perf, per **gsap-performance**).
- Wire Lenis ↔ ScrollTrigger: `lenis.on('scroll', ScrollTrigger.update)`; drive `lenis.raf` from `gsap.ticker` + `ScrollTrigger.update`. (Full detail in **gsap-scrolltrigger**; just ensure this wiring exists.)
- **Reduced-motion (mandatory):** wrap all motion in `gsap.matchMedia({ '(prefers-reduced-motion: no-preference)': … })`; under reduced-motion, disable Lenis smoothing (`smoothWheel: false` or skip init) and skip non-essential animations. See **gsap-performance**.

**Verify gate:**
- Thematic fit: every effect has a stated justification tying it to the project's subject; no flashy-but-irrelevant effects shipped.
- Animate only `transform` / `opacity` (no layout-thrash props) — gsap-performance rule.
- 60fps target on hero/landing scroll.
- Emulate `prefers-reduced-motion: reduce` → Lenis off, animations skipped, no layout shift.

## Stage 4 — Smoothness audit (skill: performance-optimization)

Run the perf audit on the built + animated UI.

**Verify gate:**
- No long tasks blocking the main thread on scroll; CLS ≈ 0; LCP in budget.
- Token-sprawl check: exported theme has no unused/duplicate tokens — if it does, feed back to design-md (re-lint + prune).
- Lenis raf loop stable, not causing jank.

## Stage 5 — Verify end-to-end (skill: webapp-testing)

Playwright assertions across the whole flow.

**Verify gate (final, must all pass):**
- Computed styles on key components == DESIGN.md tokens.
- Lenis active on all pages (smoothing engaged) under default motion preference.
- `prefers-reduced-motion: reduce` emulation → Lenis off, animations skipped, no layout shift.
- Zero console errors across the flow.

## Handoff contract

| Stage | In | Out |
|---|---|---|
| 1 design-md | brand / requirements | `DESIGN.md` + theme file |
| 2 frontend-design | DESIGN.md + theme | components / pages |
| 3 gsap + Lenis | components | animated UI |
| 4 performance-optimization | animated UI | audit + fixes |
| 5 webapp-testing | fixed UI | test pass |

## Rules of thumb

- Always start at Stage 0 (detect stack) and Stage 1 (design-md) unless the user explicitly says "skip the design baseline."
- Missing token → edit DESIGN.md + re-export, never inline a hex.
- design.md format is `alpha` → re-lint after any DESIGN.md edit.
- This playbook only orchestrates. For depth, load the skill each stage names.
