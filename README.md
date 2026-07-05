# opencode-frontend-toolkit

Opencode skills for the end-to-end frontend build pipeline — **design.md baseline → frontend-design → gsap+Lenis → performance → Playwright verify**. Stack-agnostic (React / Vue / Svelte / vanilla). Lenis smooth scroll default-on, gated behind `prefers-reduced-motion`.

## What's in the box

| Skill | Role |
|---|---|
| `frontend-playbook` | Conductor. Defines stage order, per-stack decisions, handoff contracts, and a verification gate at each stage. The only thing an agent loads to run the whole pipeline. |
| `design-md` | Community skill for Google's DESIGN.md format (no official skill exists). Author / lint / export a portable design-token source-of-truth at the project root. |

Both are discovered on demand by opencode's `**/SKILL.md` scanner.

## The pipeline

```
DESIGN.md (tokens + rationale)
   │ designmd lint + export
   ├─► tailwind theme / CSS @theme / DTCG
   ▼
frontend-design ─► gsap + Lenis ─► performance ─► webapp-testing
   (build UI)        (motion)        (audit)        (verify)
```

Each stage carries a concrete verify gate (e.g. `designmd lint` exit 0, computed styles == tokens, 60fps, zero console errors). Full detail in [`frontend-playbook/SKILL.md`](frontend-playbook/SKILL.md).

## Prerequisites

The playbook names these skills at each stage; install them so the conductor can hand off.

| Skill | Required? | Source |
|---|---|---|
| `frontend-design` | yes | `anthropics/skills` repo (skill at `skills/frontend-design`) |
| `webapp-testing` | yes | `anthropics/skills` repo (skill at `skills/webapp-testing`) — **a separate skill**, just published in the same repo |
| `gsap-core` / `-react` / `-frameworks` / `-scrolltrigger` / `-performance` | yes (agent picks variant by stack) | `greensock/gsap-skills` repo |
| `performance-optimization` | optional | cortexloop distribution; not auto-installed. Stage 4 degrades to Playwright-based metrics (CLS / LCP / long-tasks) if absent. |

These are **auto-detected and auto-pulled** on first run by `frontend-playbook/scripts/ensure-prereqs.{ps1,sh}` (see Install below). To install manually: `npx skills add https://github.com/anthropics/skills -g -y` (whole Anthropic collection — includes frontend-design, webapp-testing, docx/pdf/xlsx/pptx) and `npx skills add https://github.com/greensock/gsap-skills -g -y`.

Runtime libraries (the agent installs these per project — no global setup needed): `gsap` and `lenis` via npm; the `@google/design.md` CLI via `npx`.

## Install this toolkit

```bash
# option A — skills CLI (recommended)
npx skills add https://github.com/whitequeen306/opencode-frontend-toolkit -g -y

# option B — clone into your opencode skills dir
git clone https://github.com/whitequeen306/opencode-frontend-toolkit ~/.config/opencode/skills/opencode-frontend-toolkit
```

**Prerequisites auto-install on first run.** The first time `frontend-playbook` triggers, Stage 0 runs `frontend-playbook/scripts/ensure-prereqs.ps1` (Windows) or `ensure-prereqs.sh` (Unix) — it scans your skill directories and auto-pulls anything missing via `npx skills add`, through opencode's bash permission gate (you stay in control). `performance-optimization` is optional and left to you.

To run the check manually instead:

```powershell
# Windows
./install.ps1            # thin wrapper -> frontend-playbook/scripts/ensure-prereqs.ps1
```
```bash
# Unix
./install.sh             # thin wrapper -> frontend-playbook/scripts/ensure-prereqs.sh
```

Restart opencode after install — skills are scanned at startup, not hot-reloaded.

## Usage

Just give a frontend task. The playbook auto-triggers on its description:

> 用 React + Tailwind v4 做个 SaaS landing 页。品牌偏深森林绿 + 一抹祖母绿 accent，字体几何感，要有首屏动效和顺滑滚动。

The agent loads `frontend-playbook`, runs Stage 0 (detect stack) → Stage 1 (author DESIGN.md + lint + export) → … → Stage 5 (Playwright verify), and hands you `DESIGN.md` + the built UI + a gate-by-gate report.

For single-component tweaks or backend work it stays quiet (`Do NOT use for…` gate). Force it by mentioning `frontend-playbook` in your request.

## Optional: clone a site's look from a URL

`frontend-playbook` can replicate a reference site's design system. When the user gives a URL (or says "复刻 / 参考 <site>"), Stage 0.5 runs `frontend-playbook/scripts/extract-from-url.mjs` — a Playwright sampler that navigates the URL and dumps computed-style token candidates (colors / fonts / sizes / radii / spacing) as JSON. The agent names + dedupes them, adds rationale, writes a `DESIGN.md`, and lints it in Stage 1.

No extra install — it reuses Playwright (provided by the `webapp-testing` prerequisite). If Playwright is missing, the agent runs `npm i -D playwright && npx playwright install chromium`.

**Fidelity:** sampling infers a token system from a few elements — good for "复刻大概感觉", not pixel-perfect brand cloning. For higher fidelity, optionally install a dedicated extractor skill (e.g. `shaom/brand-to-design-md-skill`) — not bundled by default.

**Effects (motion) are never cloned** — only static style is. Stage 3 designs motion thematically around the project's subject (cool serves content, not itself — no skiing effect on a photography site), built with gsap.

## How it was validated

RED-GREEN tested per the `writing-skills` methodology:

- **RED** (no playbook): agent skipped DESIGN.md and shipped unverified, unrendered code.
- **GREEN** (with playbook): agent authored + linted DESIGN.md, ran Playwright 21/21, **caught and fixed a real LCP regression** (2516ms → 2296ms) on the first pass. Both gaps closed.

## Licenses & attribution

- `frontend-playbook/SKILL.md` — **MIT** (this repo).
- `design-md/SKILL.md` — **Apache-2.0**; a community skill summarizing Google's DESIGN.md format. The format spec is owned by [`google-labs-code/design.md`](https://github.com/google-labs-code/design.md) (alpha, may change). This skill is **not** affiliated with or endorsed by Google.
- Prerequisite skills (`frontend-design`, `webapp-testing`, `gsap-*`) retain their own licenses — install them from their official sources above.

## Status

- `design.md` format is `alpha` — re-sync `design-md/SKILL.md` when `@google/design.md` bumps.
- `frontend-playbook` is `v0.1` (validated once via RED-GREEN). Not exhaustively loophole-closed; expect to iterate.
