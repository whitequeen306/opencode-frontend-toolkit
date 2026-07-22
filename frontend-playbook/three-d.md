# three-d.md — The 3D Signature Manual

> Companion to `motion-templates.md`. `motion-templates.md` §10 gives the *code* for one 3D pattern (cursor-displaced field). This manual gives the **judgment**: *which* 3D signature fits *which* project, so the same generic effect is never applied across unrelated domains. Read this BEFORE choosing a 3D hero. A flat rectangle grid on an architecture site is a failure of this manual, not of the code.

## 0. Why this manual exists

LLM-generated 3D heroes collapse to one effect: a grid of flat planes that lift toward the camera under the cursor. It is technically a "displacement field" but visually generic — it carries no domain meaning. Applied to architecture (volumetric), photography (discrete objects), a beverage (fluid), or a product (sculptural form), it says nothing about the subject. This manual's job is to make that collapse impossible by giving a **domain → 3D-signature decision matrix** that forces the effect to carry the subject's meaning.

**The one-sentence test:** can you state, in one sentence, why this 3D effect embodies the project's subject? "It looks cool / it's impressive in 3D" = FAIL. "The building is a stack of floor slabs, so we explode them into the architectural axonometric that is the firm's drawing language" = PASS.

---

## 1. The escalation gate — when 3D at all

CSS/SVG handles ~90% of signature moments. Escalate to real 3D (`three` + `@react-three/fiber`) only when **any** of:

1. **The base state needs real perspective, fog, or lighting that CSS `perspective` cannot fake.** A flat card tilt is CSS. A raking light casting long shadows across stacked forms is 3D.
2. **The interaction is a raycast onto a 3D surface** — cursor displaces nearby geometry along the surface normal (the "igloo.inc" signature: cursor parts the assembled object). This is category B below.
3. **The signature is physical objects in space** — polaroids floating, product bodies, architectural slabs — where the objects' volumetric relationship is the content.
4. **The material IS the subject.** Concrete, glass, steel, water, fabric — when the brand is about materiality, PBR materials in 3D beat any 2D representation.

**Do NOT escalate for:** 2D hovers, scroll-triggered tweens, parallax layers, count-ups, anything achievable with templates §1–§9 in `motion-templates.md`. 3D is expensive (bundle, perf, accessibility) — spend it only where the subject demands volume.

---

## 2. The 3D signature taxonomy

Seven categories. Each is a different *metaphor* with a different *interaction model* and *material logic*. Picking the category is the first design decision — before writing any code.

### A — Volumetric architecture / exploded axonometric
- **Metaphor:** a building as stacked solid forms (floor slabs, cross-sections, massing study) with threading cores/columns. The architectural drawing language made volumetric.
- **Interaction:** one-shot load entrance that *explodes* the stack into its axonometric state, then sits as a sculpture; gentle cursor orbit (like a physical model on a table, rotation.y/x following cursor with lerp). **No scroll pin** (see Motion Taste "No scroll-jacking pin traps").
- **Materials:** warm concrete (roughness 0.85, metalness 0), dark steel cores (metalness 0.7), edge lines via `EdgesGeometry` + `lineBasicMaterial` for the technical-drawing quality. Raking low-angle directional light = long shadows on slab edges. One rust/corten accent (the crown slab).
- **Domains:** architecture firms, structural engineering, real-estate masterplans, urban design.
- **Why not a flat grid:** architecture is volumetric and structural. A wall of flat tiles denies everything the brand is about.

### B — Particle / object field dispersion (physical simulation)
- **Metaphor:** many small discrete objects (crystals, polaroids, product cards, tiles) arranged on a surface or in a volume. The cursor is a *force* that parts them with distance falloff; they spring back on leave.
- **Interaction:** raycast cursor → distance to each piece → translate toward camera + slight rotate, `lerp(current, target, 0.18)` toward displaced, `lerp(current, home, 0.06)` spring-back. Per-frame, NOT gsap tweens.
- **Materials:** varied per piece; ~16% are accent/emissive "anchor" pieces. Fog for depth.
- **Domains:** photography studios (silver halide dispersion), jewelry, galleries, portfolios of discrete works, collectibles.
- **This is the ONE case where a grid-of-objects-displaced-by-cursor is correct** — because the objects ARE discrete and the cursor-as-force IS the subject. Mis-applying it to architecture or a single product is the anti-pattern.

### C — Single monumental volume / material study
- **Metaphor:** one sculptural hero object (concrete monolith, product body, chapel form) slowly rotating in space, raking light, atmospheric dust/fog.
- **Interaction:** slow auto-rotation (0.05–0.1 rad/s) + subtle cursor parallax; scroll = camera dolly in/out (scrub without pin).
- **Materials:** PBR-driven — concrete, metal, glass, ceramic. The material IS the showcase. One key light + one fill + rim.
- **Domains:** single-product industrial design, automotive, ceramics, a chapel/atmosphere brand, any "one perfect object" subject.
- **Why single, not many:** when the brand is *the object*, a field of many dilutes it. Restraint is the signature.

### D — Wireframe / line-drawing in space
- **Metaphor:** pure `LineSegments` floating in 3D — elevations, sections, isometric line drawings — at different depths, like architectural sketches hung in the void.
- **Interaction:** cursor parallax of line-planes at different depths (near planes move more); scroll assembles the drawing.
- **Materials:** none. `lineBasicMaterial`, color = ink. Width constant (1px). No fills — the line IS the drawing.
- **Domains:** technical/engineering, drafting, CAD-adjacent, minimalist architecture line art, blueprints.
- **Why line, not solid:** a drafting brand's whole POV is the line. Solids betray it.

### E — Topographic / landscape contour field
- **Metaphor:** a site as extruded contour lines (horizontal slices at increasing Z) forming a 3D terrain. The land IS the content.
- **Interaction:** scroll extrudes the terrain upward (scrub without pin); cursor ripples nearest contours.
- **Materials:** minimal, height-based color ramp (low=ink, high=bone). Fog at the base.
- **Domains:** landscape architecture, geography, outdoor/sport, site planning, wine (terroir), any land-driven brand.
- **Why contours, not particles:** the land is continuous and stratified, not discrete. Contours are the land's drawing language.

### F — Fluid / organic surface deformation
- **Metaphor:** a plane or ribbon displaced by noise + cursor (water, fabric drape, sand ripple), vertex-shader driven.
- **Interaction:** cursor ripples the surface via vertex displacement (per-vertex distance falloff). Continuous, spring-back.
- **Materials:** translucent / refractive (water), granular (sand), or woven (fabric). Refraction or normal-map-driven sheen.
- **Domains:** beverage/water, fashion/textile, sand/desert, ambient hero for a material-driven brand.
- **Why a surface, not objects:** the product IS a continuous material, not a collection. Ripples are the material's grammar.

### G — Data / informational 3D (use sparingly — often wrong)
- **Metaphor:** 3D bar fields, globe networks, node graphs in space.
- **Interaction:** hover highlight + camera orbit. Usually no cursor-force.
- **Domains:** data viz, logistics networks, geography.
- **CAUTION:** 3D data viz is usually *worse* than 2D — only when the spatial/geographic meaning is real (a globe of flight routes, a 3D bar field where height = a real volumetric quantity). If the third dimension is decorative, drop to 2D. This category exists to be declined, not defaulted to.

---

## 3. Domain → signature decision matrix

The core of this manual. **Pick the row before writing any 3D code.** If your project isn't here, find the closest subject-match and state why.

| Domain | Primary 3D signature | Fallback | Banned |
|---|---|---|---|
| Architecture firm | **A** exploded axonometric | **D** wireframe line-art | B flat tile grid |
| Structural engineering | **A** or **D** | — | B |
| Photography / art portfolio | **B** particle dispersion | **C** if one hero piece | A (volume ≠ photo) |
| Gallery / museum | **B** or **D** | **C** | F |
| Jewelry / collectibles | **B** | **C** single piece | A |
| Single-product industrial design | **C** monolithic volume | **F** if material-driven | B (one product ≠ many) |
| Automotive | **C** | — | B, F |
| Ceramics / single craft object | **C** | **F** | B |
| Beverage / water | **F** fluid surface | **C** if bottle hero | A, B |
| Fashion / textile | **F** fabric drape | **C** if garment hero | A |
| Sand / desert / outdoor material | **F** or **E** | — | B |
| Landscape architecture / site | **E** topographic | **D** line contours | B, A |
| Geography / maps | **E** or **G** | — | B, C |
| Data viz / networks | **G** (sparingly) | **none** (use 2D) | A, B |
| Logistics / shipping routes | **G** globe network | **E** | B |
| Tech / SaaS | **none** or **D** wireframe | — | A, B, F (all decoration) |
| Restaurant / food | **none** or **F** (steam as surface) | — | A, B, C |
| Music / audio | **none** (use §3 waveform) | **C** if one instrument hero | A, B |

**Reading the matrix:** "Primary" = the signature that embodies the subject. "Fallback" = acceptable alternative with stated reason. "Banned" = the effect that denies the subject — applying it = FAIL the taste gate.

---

## 4. Anti-patterns (banned — any one = FAIL)

1. **Flat rectangle grid displaced by cursor applied to a non-discrete-object domain.** Architecture, beverage, single product, fashion — none are "a field of flat tiles." This is the #1 LLM-default collapse. If the domain isn't "many discrete objects" (B's true home), a tile grid is wrong.
2. **The same 3D effect across unrelated domains.** Reusing last project's 3D hero verbatim on a different subject = no POV. The matrix above exists to prevent this.
3. **3D for 3D's sake when 2D achieves the metaphor.** A parallax of layered images is CSS. A count-up is GSAP. Don't import `three` to impress; import it because volume is irreducible.
4. **Generic floating particles with no domain metaphor.** "Particles" is not a signature — it's filler. Crystals parting like silver halide IS. Dust in a light beam IS. "Some particles" is not.
5. **Pin-scrub scroll trap on a 3D hero** (see Motion Taste "No scroll-jacking pin traps"). The 3D signature should be a one-shot load entrance or cursor-driven, not a scroll-held vanity effect.
6. **3D data viz where the third dimension is decorative.** A 3D bar chart that could be 2D is worse — occlusion, no extra meaning. Only when depth = real spatial/geographic meaning.
7. **No reduced-motion path.** Under `prefers-reduced-motion: reduce`, the 3D scene must render its final static state (e.g. the exploded axonometric, the resting sculpture) with no animation. A blank or stuck-mid-animation canvas = FAIL.

---

## 5. Shared implementation principles (all categories)

These apply regardless of category. Violating them = FAIL the build gate.

- **Per-frame `lerp` for continuous cursor tracking — NOT gsap elastic.** `k≈0.18` toward target, `k≈0.06` spring-back home. GSAP `elastic.out` is for one-shot tweens; per-frame lerp is frame-rate-independent and cheap. (This is Motion Taste Principle #7 applied to 3D.)
- **R3F `<Canvas>` with `dpr={[1, 2]}` cap** — bounds retina cost. No unbounded dpr.
- **Pointer events via `useThree()` `gl.domElement`** — never `document.querySelector('canvas')` + `setInterval` polling. The canvas is guaranteed to exist by the time R3F renders; querySelector + polling is a cleanup-leak bug.
- **No scroll-jacking pin** (Motion Taste "No scroll-jacking pin traps"). 3D entrances are one-shot `gsap.to` on mount; scroll-coupled sub-effects use `scrub` *without* `pin` so the page advances.
- **Fog for depth** — a 3D scene without fog reads flat; fog (near ~6, far ~16) gives the explosion/parallax its depth cue.
- **Edge lines where the domain warrants drawing quality** — `EdgesGeometry` + `lineBasicMaterial` on solids gives the technical-drawing register. Use for A, D, and structural B. Skip for F (fluid) and C (material study) where edges would betray the material.
- **Ambient breathing at low amplitude** — `gsap.to(el, { repeat: -1, yoyo: true, amplitude 1–3px/0.01–0.03rad })` so the scene is never dead between interactions. Subconscious.
- **Reduced-motion: render final static state, no rAF animation.** Set the explode factor to max, the rotation to rest, skip the entrance tween. Content (the sculpture) stays visible.
- **Perf budget:** ≤90 meshes, group by material to minimize draw calls, `dispose()` geometries/materials on unmount, no per-frame allocations of `Vector3` (hoist to a `useMemo` scratch). 60fps target on hero load.
- **Progressive enhancement:** the canvas is decoration + signature, never the sole carrier of content. The H1/manifesto/nav must render and be readable without WebGL.

---

## 6. Category quick-reference (for fast lookup during Stage 2 design)

- **A — Exploded axonometric** · stacked solids + cores · one-shot explode + cursor orbit · concrete/steel/edge-lines · architecture
- **B — Particle dispersion** · many discrete objects · cursor-as-force raycast + spring-back · varied + accents · photography/galleries/jewelry
- **C — Monolithic volume** · one sculptural object · slow auto-rotate + parallax · PBR material · single-product/automotive/ceramics
- **D — Wireframe in space** · pure LineSegments · depth-parallax + assemble · ink lines · drafting/engineering
- **E — Topographic field** · extruded contours · scroll-extrude + cursor-ripple · height ramp · landscape/site/geography
- **F — Fluid surface** · displaced plane/ribbon · cursor vertex-ripple + spring-back · refractive/granular · beverage/textile/sand
- **G — Data 3D (decline by default)** · bars/globe/network · hover + orbit · minimal · only when depth = real meaning

---

## 7. Solidity craft — making 3D read as a real object (立体感 + 实物感)

A category choice (§2) names the metaphor; this section makes it read as a solid thing. The failure mode to avoid: "随便一个3D建模糊弄一下" — vague floating shapes that aren't recognizably anything. A building must read as a building, a product as a product. Solidity is not automatic from choosing category A/C — it comes from the six concrete crafts below. Skip any one and the output slides toward "a CGI blob". **At minimum the result must be a recognizable thing — if a no-context viewer can't name the object from a static screenshot, it is not done.**

### 7.1 Geometry — real thickness, form, and designed variation

- **Solids are boxes/extrusions with real thickness, never flat `planeGeometry`.** A floor slab is `boxGeometry(width, 0.14–0.20, depth)` where thickness is 5–8% of the span. A wall has depth. A product body has real topology (extruded profile, boolean cutouts). A bare plane reads as a card, not a thing. (Category D wireframe and category F fluid surface are the deliberate exceptions — they are *surfaces* and *lines*, not objects.)
- **Bevel the edges.** Real objects don't have razor edges. Use `RoundedBoxGeometry` (from `@react-three/drei`) with `radius=0.02–0.04, segments=4`. The bevel catches a 1–2px highlight along the top edge that instantly reads as "machined object" vs "Unity cube". For non-box forms, `ExtrudeGeometry` with `bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02`.
- **Add designed geometric variation — massing, not primitives.** A raw box looks CGI. For category A, vary each slab's footprint (width/depth ±0.4) and add setbacks/cantilevers (plan offset ±0.3) so the stack reads as *a designed building*, not a stack of identical plates. For C, break the monolith's silhouette with a chamfer or inset facet. Identical repeated primitives = the AI-default "grid of cubes" tell.
- **Get proportions right.** A building slab is wider/longer than tall. A car body is long and low. A ceramic vessel is taller than wide. Wrong aspect ratio is the fastest way "a thing" becomes "a shape". Pull the real object's proportions before sizing in scene units.
- **Edges definition via `EdgesGeometry`.** Add `<lineSegments>` with `<edgesGeometry>` + `<lineBasicMaterial>` at ~0.5 opacity in a tone 2–3 stops darker than the fill. This crisp contour is what makes a slab read as a *drafted floor plate* rather than a grey box. Use for A, structural B, D.

### 7.2 Materials — PBR that gives weight, not flat color

- **Always `meshStandardMaterial` for solids, never `meshBasicMaterial`.** Basic material has no light response = flat, weightless, CGI. Standard (PBR) responds to roughness/metalness/environment = weight.
- **Roughness is the #1 solidity lever.** Concrete 0.85–0.95 (chalky, absorbs light). Brushed steel 0.35–0.5 (soft highlight). Polished metal 0.1–0.2 (sharp specular). Glass 0.05–0.1. Wood 0.6–0.75. **Wrong roughness = plastic.** The most common failure: roughness 0.5 everywhere → everything looks like grey plastic.
- **Metalness by material, not by default.** Steel/metal 0.6–0.9. Concrete/ceramic/wood/fabric 0.0–0.1. Never 0.5 "everywhere". Metalness on a non-metal = glowing plastic.
- **Per-piece color variation.** A real concrete slab isn't one flat hex. Add ±3–5% lightness variation per instance (a low-amplitude noise tint or a per-piece `color` offset). Identical color on N pieces reads as "instanced copies"; slight variation reads as "real materials".
- **Texture maps beat flat color for hero objects.** For the one signature object (category C especially), use a real texture: concrete (roughness map + subtle normal), brushed metal (anisotropic highlight), wood (grain normal). A 256×256 tileable is enough. Flat color on a hero object = the cheapest possible 3D.
- **Emissive only for accents.** ~16% of pieces may be the "accent" (rust crown, lit crystal) with `emissive` color + `emissiveIntensity 0.15–0.25`. Never emissive everywhere — glows = not solid.

### 7.3 Lighting — the thing that makes volume visible

Three lights minimum. One light = flat, no volume. This is non-negotiable for solidity.

- **KEY — raking, low-angle directional.** `<directionalLight position={[6, 3, 4]} intensity={1.0} castShadow />`. Low angle grazes across surfaces, casting long shadows off slab edges and revealing texture/form. Front light (high, behind camera) flattens; raking light volumizes. This is THE architectural-rendering light.
- **FILL — opposite side, dimmer, color-tinted.** `<directionalLight position={[-5,-1,3]} intensity={0.35} color="#b8542a" />`. Lifts the shadow side without killing the key's form. Tint to the brand's warm accent or cool secondary.
- **RIM — behind, separates object from background.** `<pointLight position={[0,2,-6]} intensity={0.5} color="#5a6b78" />` (behind the object, cool tone). Draws the silhouette edge so the object separates from the ink background.
- **Ambient — very low.** `<ambientLight intensity={0.3} color="#ece8dd" />` max. Too much ambient flattens volume; it exists only to lift absolute blacks.

### 7.4 Shadows + AO — what grounds objects as solid

- **Enable shadow maps.** `<Canvas shadows>` (or `gl={{ shadows: true }}`), `castShadow` + `receiveShadow` on every solid mesh, `directionalLight castShadow` with `shadow-mapSize-width/height={[2048,2048]}` and tuned `shadow-camera` bounds. Without shadows, objects hover in a void — hovering = CGI. Shadows = sits.
- **Contact shadows for hero objects.** `<ContactShadows>` from `@react-three/drei` under category C (the monolith) — a soft ground shadow that anchors it. A floating product without a contact shadow reads as a cutout.
- **Ambient occlusion for stacked forms.** For category A (stacked slabs) and B (dense fields), the crevices between objects MUST go dark. If not using post-proc SSAO, fake it: a low `ambientLight` + a downward `directionalLight` leaves the underside of each slab dark — that gradient IS the occlusion that reads "stacked solid" not "floating cards".
- **Self-shadowing on the explode.** When category A's slabs separate, the shadow each slab casts on the one below is what reveals the gap is real space, not a 2D offset. No self-shadow = flat stack.

### 7.5 Atmosphere + camera — depth and scale

- **Fog (near ~6, far ~16) is mandatory.** `<fog attach="fog" args={['#08090b', 6, 16]} />`. Without fog, Z-depth collapses — top/bottom slabs of category A, far particles of B, all sit on the same plane visually. Fog separates them into real space. Tone fog to the background so objects fade into atmosphere, not into a wall.
- **Background distinct from object.** Dark ink bg (#08090b) + warm concrete object (#9c958a) — the silhouette reads in 1 frame. Same-tone bg+object = mud.
- **Camera fov 38–46.** Low fov = orthogonal, architectural, designed. High fov (>55) = fish-eye, cheap, mobile-camera. 42–44 is the architectural sweet spot.
- **Object fills 40–60% of frame height.** Too small = "a floating shape"; too big = "a wall of material". Find the framing where it reads as "a thing in space".

### 7.6 Per-category "what makes it a thing" — the concrete recipe

Each category has one specific move that, if missed, collapses solidity:

- **A — exploded axonometric → reads as "a building in section" when:** slabs are real boxes (thickness 5–8% of span) with plan offsets/cantilevers, 2 core columns threading through (dark steel, metalness 0.7), concrete roughness 0.9, **raking key light + self-shadowing** so each separating slab casts on the one below, edge lines on every slab, one rust crown slab (corten cap). Miss the cores or the self-shadow → reads as "floating cards", not a building.
- **B — particle field → reads as "discrete objects on a surface" when:** each crystal/polaroid is a real thin box (thickness 0.02–0.04) with slight per-piece random rotation (±0.1rad on all axes) and scale variation (±15%), edge lines, fog separating the Z layers. Identical flat planes with no rotation → reads as "a tiled wall", not a field of objects.
- **C — monolith → reads as "a sculptural object" when:** ONE `RoundedBoxGeometry` (or extruded profile) with bevel, a real PBR texture map, slow auto-rotation (0.05–0.08 rad/s), **contact shadow** grounding it, three-light setup, camera at object's eye level (not above). A bevel-less box with flat color, floating with no shadow → reads as "a cube", not a designed object.
- **D — wireframe → reads as "a precise drawing in space" when:** line weight is consistent (1px `lineBasicMaterial`), depth-graded opacity (far lines fade via fog), planes at distinct Z depths parallaxing. Intentionally NOT solid — but must be precise, not sketchy.
- **E — topographic → reads as "terrain" when:** contour rings at real Z steps (0.1–0.2 each), height-ramped color (low ink → high bone), fog pooling at the base. Flat shaded rings at one Z → reads as "concentric circles", not land.
- **F — fluid surface → reads as "a material surface" when:** a 64×64+ subdivided `planeGeometry` with per-vertex noise displacement + cursor ripple (vertex shader or per-frame `position.array` mutation), translucent/refractive material with a normal map, refraction or fresnel. A 4×4 plane with a flat color → reads as "a tilting card", not water/fabric.

### 7.7 Solidity anti-patterns (any one = "not a thing")

1. Flat `planeGeometry` for an object that should be solid (the cardinal sin — a card is not a thing).
2. `meshBasicMaterial` on a solid (flat, weightless).
3. One light only (no shadows → no volume).
4. Razor edges, no bevel (Unity-cube CGI tell).
5. No shadow / no AO (objects hover, never sit).
6. Roughness 0.5 + metalness 0.5 everywhere (grey-plastic default).
7. Identical repeated primitives, no massing variation (instanced-copy tell).
8. No fog (Z-depth collapses, layers mush).
9. Wrong proportions (a "building" with slab taller than long).
10. Background tone == object tone (silhouette lost → mud).

### 7.8 The static-screenshot naming test (mandatory before verify gate)

Screenshot the resting state — no animation, no cursor, final pose. Hand it to a viewer with no context. Can they name the object?
- "A building in cross-section" / "a row of crystals" / "a concrete sculpture" / "a terrain" = **PASS**.
- "Some shapes" / "I think that's a... box?" / "a grid?" = **FAIL** — return to §7.1–7.5 until the object names itself. The whole point of 3D is that it is *a thing*; if it isn't a thing, it is decoration, and decoration belongs to CSS.

---

## 8. Workflow gate (how this manual plugs into the pipeline)

- **Stage 2 (design):** before any 3D code, state (a) the category letter from §2, (b) the matrix row from §3, (c) the one-sentence subject-embodiment test from §0. If you can't state all three, you have not chosen a 3D signature — you have defaulted. Go back.
- **Stage 3 (signature build):** the built effect must match the stated category's metaphor AND interaction model. A "category A" claim that ships a flat tile grid = FAIL, regardless of code quality.
- **Self-critique:** the `e2e/motion-critique.md` must answer "which 3D category, and why not the banned one for this domain?" If the critique can't name the category, the choice was unexamined.
- **Verify:** the Playwright render check confirms the 3D canvas mounts AND that the stated category's defining interaction works (e.g. for A, the explode factor reaches max; for B, displacement > threshold + spring-back; for F, vertex displacement responds to cursor).

> **Relation to `motion-templates.md`:** §10 provides the reference *code* for **category B** (the cursor-displaced particle field); §11 provides the reference *code* for **category A** (the exploded axonometric building). This manual provides the *judgment* (which category for which domain) + the *solidity craft* (§7, how to make the code produce "a thing"). When you reach for §10 or §11, confirm via §3 that your domain actually maps to that category. If it doesn't, that code is the wrong starting point — use the category your matrix row names and adapt the §7 solidity crafts to it.
