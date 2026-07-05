# frontend-playbook

面向 AI agent 的前端全流程 skill 包——**design.md 定基调 → frontend-design 出 UI → gsap+Lenis 做动效 → 性能审计 → Playwright 验证**。栈无关（React / Vue / Svelte / 原生），Lenis 平滑滚动默认全站开启，强制 `prefers-reduced-motion` 门控。

## 里面有什么

| Skill | 角色 |
|---|---|
| `frontend-playbook` | 指挥。定义阶段顺序、按栈决策、阶段间交接契约、每阶段一个验证 gate。agent 只需加载它就能跑完整流水线。 |
| `design-md` | Google DESIGN.md 格式的社区 skill（官方没出 skill）。在项目根写一份可移植的设计 token 源文件，lint + 导出。 |

两个 skill 都被 agent 的 `**/SKILL.md` 扫描器按需发现。

## 流水线

```
DESIGN.md (token + rationale)
   │ designmd lint + export
   ├─► tailwind theme / CSS @theme / DTCG
   ▼
frontend-design ─► gsap + Lenis ─► 性能 ─► webapp-testing
   (出 UI)          (动效)        (审计)     (验证)
```

每个阶段都有具体验证 gate（如 `designmd lint` exit 0、computed 样式 == token、60fps、零 console error）。完整细节见 [`frontend-playbook/SKILL.md`](frontend-playbook/SKILL.md)。

## 前置依赖

playbook 在各阶段点名这些 skill；装好它们，指挥才能交接。

| Skill | 必需？ | 来源 |
|---|---|---|
| `frontend-design` | 是 | `anthropics/skills` 仓库（skill 在 `skills/frontend-design`） |
| `webapp-testing` | 是 | `anthropics/skills` 仓库（skill 在 `skills/webapp-testing`）——**独立的 skill**，只是恰好发布在同一仓库 |
| `gsap-core` / `-react` / `-frameworks` / `-scrolltrigger` / `-performance` | 是（agent 按栈选变体） | `greensock/gsap-skills` 仓库 |
| `performance-optimization` | 可选 | cortexloop 发行；不自动装。缺失时 Stage 4 退化为基于 Playwright 的指标（CLS / LCP / long-tasks）。 |

这些在**首次运行时自动检测 + 自动拉取**，由 `frontend-playbook/scripts/ensure-prereqs.{ps1,sh}` 完成（见下文安装）。手动装：`npx skills add https://github.com/anthropics/skills -g -y`（整个 Anthropic 合集，含 frontend-design、webapp-testing、docx/pdf/xlsx/pptx）和 `npx skills add https://github.com/greensock/gsap-skills -g -y`。

运行时库（agent 按项目现装，无需全局配置）：`gsap`、`lenis` 走 npm；`@google/design.md` CLI 走 `npx`。

## 安装本工具包

```bash
# 方式 A — skills CLI（推荐，自动识别 agent）
npx skills add https://github.com/whitequeen306/frontend-playbook -g -y

# 方式 B — clone 到你的 agent skill 目录（以 opencode 为例；其他 agent 换成自己的目录）
git clone https://github.com/whitequeen306/frontend-playbook ~/.config/opencode/skills/frontend-playbook
```

**前置依赖首次运行自动装。** `frontend-playbook` 首次触发时，Stage 0 会跑 `frontend-playbook/scripts/ensure-prereqs.ps1`（Windows）或 `ensure-prereqs.sh`（Unix）——扫描你的 skill 目录，缺的通过 `npx skills add` 自动拉取，过 agent 的 bash 权限门（你仍可控）。`performance-optimization` 可选，留给你自己。

想手动跑检测也行：

```powershell
# Windows
./install.ps1            # 薄封装 -> frontend-playbook/scripts/ensure-prereqs.ps1
```
```bash
# Unix
./install.sh             # 薄封装 -> frontend-playbook/scripts/ensure-prereqs.sh
```

装完**重启 agent**——skill 在启动时扫描，不热重载。

## 用法

正常说前端需求即可。playbook 靠 description 自动触发：

> 用 React + Tailwind v4 做个 SaaS landing 页。品牌偏深森林绿 + 一抹祖母绿 accent，字体几何感，要有首屏动效和顺滑滚动。

agent 加载 `frontend-playbook`，跑 Stage 0（检测栈）→ Stage 1（写 DESIGN.md + lint + 导出）→ … → Stage 5（Playwright 验证），交给你 `DESIGN.md` + 建好的 UI + 逐 gate 报告。

单组件小改或纯后端任务时它保持安静（`Do NOT use for…` 门控）。想强制触发，话里带 `frontend-playbook`。

## 真实构建示例：obscura-studio

[obscura-studio](https://github.com/whitequeen306/obscura-studio) 是用本 playbook 全程由 agent 自主规划 + 实现的摄影工作室站——不是虚构演示，是真实跑出来的。下面是真实验证证据。

**Stage 0**：React 19 + Vite + Tailwind v4 + gsap + Lenis + Playwright → 选 `gsap-react`、Tailwind v4 `css-tailwind` 导出。

**Stage 1（design-md，真 lint 过）**：根目录 `DESIGN.md` = "OBSCURA" 暗房编辑系统。**实跑 `designmd lint`：0 errors / 0 warnings / 1 info**（不是信 agent 说的，是验过的）。token 节选：

```yaml
name: OBSCURA Photography Studio
colors:
  primary: "#d4a24e"     # 放大机灯光，唯一交互驱动色
  ink: "#0b0b0d"         # 暗房画布
  bone: "#f4f1ea"        # 暖象牙白正文
  mist: "#9a9890"
typography:
  display-xl: { fontFamily: "Cormorant Garamond", fontSize: 112px, fontWeight: 600 }
  body:       { fontFamily: "Inter", fontSize: 16px }
rounded: { sm: 2px, md: 4px }   # 建筑感锐角
```

导出 `theme.css`（Tailwind v4 `@theme`）。

**Stage 2（frontend-design）**：Hero / Nav / Studio / Works / Services / Contact / Footer + `Grain.jsx`（胶片颗粒层）。全用 token，无 ad-hoc hex。

**Stage 3（gsap+Lenis，主题化 + signature moment）**：agent 从"主题×动效表"挑了 **Photography → aperture iris open** 做成 signature moment——`Hero.jsx` 里 6 片光圈叶片 SVG + `clipPath: circle(var(--iris)%)` 从 0 开到 130（光圈打开露出照片）。配套：film-advance 滚动、grain 叠加、exposure-shift hover。Lenis 全站 + `gsap.matchMedia` 双分支 + **渐进增强**（默认 `--iris:130` 可见，JS 再藏起来动画——无 JS / reduced-motion 用户直接看到内容）。

**Stage 4 + 5（真 perf + 真 verify）**：`e2e/perf.py` 测 long tasks / CLS / LCP / FPS；`e2e/verify.py` 断言 computed 样式==token、零 console error、Lenis 默认开 / reduced 关、reduced-motion 下 hero 可见。都在仓库里，可跑。

> 注：obscura-studio 建于 playbook 的"强制 gate 报告"规则**之前**，所以它没有 `e2e/REPORT.md`——正是这次真实构建暴露了"gate 信誉制"的漏洞，才催生了那条规则。以后用 playbook 建的项目会自动产出 REPORT.md。

完整代码 + DESIGN.md + 验证脚本见 [whitequeen306/obscura-studio](https://github.com/whitequeen306/obscura-studio)。

## 可选：从 URL 复刻网站样式

`frontend-playbook` 能复刻参考站的设计系统。用户给 URL（或说"复刻 / 参考 <站>"）时，Stage 0.5 跑 `frontend-playbook/scripts/extract-from-url.mjs`——一个 Playwright 采样器，导航到 URL，把 computed style 的 token 候选（色 / 字体 / 字号 / 圆角 / 间距）以 JSON 输出。agent 给候选命名 + 去重、加 rationale、写 `DESIGN.md`，再在 Stage 1 lint。

无需额外安装——复用 Playwright（由 `webapp-testing` 前置提供）。缺 Playwright 时 agent 跑 `npm i -D playwright && npx playwright install chromium`。

**保真度：** 采样是从几个元素推断 token 系统——适合"复刻大概感觉"，不是像素级品牌克隆。要更高保真可另装专门提取 skill（如 `shaom/brand-to-design-md-skill`）——默认不捆绑。

**动效永远不复刻**——只有静态样式能复刻。Stage 3 按项目主题设计动效（炫酷服务内容、不为炫而炫——摄影站不会上滑雪特效），用 gsap 做。

## 怎么验证的

按 `writing-skills` 的 RED-GREEN 方法测过：

- **RED**（无 playbook）：agent 跳过 DESIGN.md，盲发未验证、未渲染的代码。
- **GREEN**（有 playbook）：agent 写 + lint 了 DESIGN.md，跑 Playwright 21/21，**首轮就抓到一个真 LCP bug**（2516ms → 2296ms）并修掉。两个 gap 都堵上。

## 互补工具

本 playbook 是"按主题新建前端 + token + 验证"的指挥。如果你要的是**像素级整站克隆成 Next.js 代码**（连内容、资产、交互一起搬），用专门的克隆模板更合适：

- **[JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template)**（25k★）—— `/clone-website` skill 跑多阶段流水线：Chrome MCP 侦察（截图 + token 提取 + scroll/click/hover 交互扫描）→ 基础层 → 组件 spec → 并行 builder → 视觉 QA diff。它的交互扫描技术（多状态 diff、transition 提取、交互模型判定）已被我们借鉴进 Stage 0.5 的采样器。它的 [INSPECTION_GUIDE](https://github.com/JCodesMore/ai-website-cloner-template/blob/master/docs/research/INSPECTION_GUIDE.md) 是一份很好的克隆检查表。
- 区别：他模板绑死 Next.js + 假设 `claude --chrome`，输出一整个项目；我们栈无关、是装到任何 agent 的可移植 skill。两者互补——新建用我们，整站克隆用他。

## 许可证与归属

- `frontend-playbook/SKILL.md` — **MIT**（本仓库）。
- `design-md/SKILL.md` — **Apache-2.0**；Google DESIGN.md 格式的社区 skill。格式规范归 [`google-labs-code/design.md`](https://github.com/google-labs-code/design.md) 所有（alpha，会变）。本 skill **不**附属于 Google、未受其背书。
- 前置 skill（`frontend-design`、`webapp-testing`、`gsap-*`）保留各自许可——按上面的官方来源装。

## 状态

- `design.md` 格式是 `alpha`——`@google/design.md` 升级时重新对齐 `design-md/SKILL.md`。
- `frontend-playbook` 是 `v0.1`（RED-GREEN 验证过一次）。未 exhaustive 地堵完所有漏洞，预期会迭代。
