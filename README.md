# Toptal north-star homepage concept

This standalone Phase 1 homepage concept is a complete premium design iteration built around **Human proof, in motion**. It restores the content density, named talent, employer proof, and editorial authority of Toptal's live homepage while establishing a more expressive interaction and motion system. It is a north-star design for the wider public-route rollout, not a replacement for the live hiring platform.

## View locally

Run a static server from this folder:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173/`.

There is no package install or build step. Runtime fonts, icons, scripts, profile portraits, service images, and logos are vendored locally.

## Deploy to Vercel

This repository is ready for a zero-build static deployment:

1. Import the GitHub repository into Vercel.
2. Leave the repository root as the project root.
3. Select **Other** if Vercel asks for a framework preset.
4. Leave the build command and output directory empty, then deploy.

`vercel.json` adds clean URLs, security headers, a fresh-HTML cache policy, and a long Vercel edge-cache policy with a short browser cache for static assets. `.vercelignore` keeps QA screenshots, image-generation sources, superseded font/image files, and legacy ICO marks out of the deployment artifact.

This is a branded design concept, so it intentionally ships with `noindex` metadata, an `X-Robots-Tag` header, and a restrictive `robots.txt`. Remove all three controls together only when an approved production domain, canonical URL, ownership, analytics, consent, and content-governance plan are in place.

## What is implemented

- Sticky Toptal header with governed public routes, rich Hire Talent and Consulting & Services mega menus, feature previews, outside-click close, Escape close, and focus return.
- User-controlled hero for Hire Talent and Consulting & Services. The talent state includes real, current public profiles for Adrian Gonzalez, Casey Arrington, and Danielle Thompson, employer proof, keyboard tabs, swipe selection, and two primary conversion intents.
- Casey's hero proof material is now a portrait-contained 16-26px vertical rail on desktop and a 14px horizontal rail on mobile, with a straight divider and no diagonal blade crossing the face or profile copy.
- Tight 79px desktop employer strip with clearer Microsoft, SpaceX, and StubHub marks, plus a contextual proof rail using 98% trial-to-hire success, an average match under 24 hours, 30,000+ talent, and 140+ countries.
- Descriptive eight-cell talent category grid based on the supplied premium reference, using file-safe local Phosphor image assets and preserved category routes.
- Separate talent network module with all seven category controls, discipline-relevant verified expert cards, honest live-directory/capability states where named public profiles are not available, a 30,000+ discovery card, responsive scroll-snap behavior, spotlight interaction, and explicit controls.
- Editorial delivery selector for Hire an expert, Build a team, and Execute an outcome with real/generated imagery, factual proof, keyboard navigation, mobile snap cards, and synchronized controls.
- Stable three-step process console with a 540px desktop/720px mobile stage, a compact 96px mobile tab rail with full stage names, accessible tab semantics, tangible brief/match/trial artifacts, a single shared liquid material plane, and cancel-safe pointer and keyboard transitions.
- Searchable expertise workbench with seven disciplines, real skill routes, related verified expert proof only for Product Management and Design, truthful discipline-directory states elsewhere, live filtering, clear/reset, and a designed empty state.
- Two-column Newsweek and Statista ranking story with five methodology disclosures and a complete ten-row ranking ladder; Toptal is highlighted at #11 overall and #1 among professional services.
- Technology Services, Marketing Agency, and Management Consulting tabs with local editorial imagery, capability chips, governed service routes, client proof links, and a scrollbar-free mobile rail with restrained overflow fades and automatic selected-tab centering.
- The Services active material is clipped to the exact selected-tab rectangle. Its large transition wipe remains transform-driven, cancels stale transitions, and never paints outside the Services stage.
- The process material is constrained to the 108px desktop/96px mobile tab rail. Narrative and artifact regions transition independently, so the console never receives a full-panel gray wash.
- The highlighted #11 Toptal ranking field uses an edge-to-edge full-fill Paper shader beneath a full-width scrim, with exact row clipping at every tested breakpoint.
- Proof-led closing module with 140+, 35,000+, 4.9/5, an explicit three-step expectation, Hire top talent, and Apply as talent paths.
- Compact deep-navy footer with all required route groups, closed mobile accordions, a visible theme-toggle label, Back to top, legal routes, and 44px interaction targets.
- The user-supplied Paper Design liquid-metal system is integrated on exactly eight high-value, state-bearing surfaces, with CSS-derived chrome/cobalt behavior elsewhere.

## Interaction and motion system

- Arrow, Home, and End keyboard behavior for tab-like controls.
- Crossfades and 8-14px crop/content shifts for intentional state changes.
- One-time proof counters and intersection-driven section/ranking reveals.
- Fine-pointer-only magnetic CTAs and restrained profile-card tilt.
- No autoplay, scroll listeners, scroll-jacking, or uncontrolled continuous animation loops. WebGL is limited to eight governed Paper Design surfaces, with no more than one large canvas moving at once; every idle, offscreen, and hidden-document surface runs at speed 0.
- Reduced motion resolves transitions to 0.01ms, disables tilt/magnetic transforms, shows final proof values immediately, and leaves zero infinite animations.
- Theme state is persisted locally; light and dark tokens preserve the same visual hierarchy.

## Local liquid shader bundle

- Source package: `@paper-design/shaders` version `0.0.69`, as pinned by the supplied `shader-button` app.
- Actual runtime: Paper Design's `ShaderMount` with `liquidMetalFragmentShader`; this is not a gradient imitation.
- Adapted source: `assets/js/shader-system.source.js`.
- Local standalone bundle: `assets/js/shader-system.bundle.js`, a 33.3KiB minified browser IIFE with no runtime CDN or package dependency.
- License: `assets/vendor/paper-design-shaders-LICENSE.txt`.
- Real shader surfaces, exactly eight: hero intent selector, hero expert-proof rail, talent-network discovery card, delivery-mode selector, process-console active step, Toptal ranking row, service-family selector, and full Services liquid wipe.
- Uniform baseline: repetition 4, softness 0.5, red/blue shift 0.3, angle 45, scale 8, full-fill shape 0, X/Y offsets 0.1/-0.1, adapted to cobalt/chrome tinting. Paper's full-fill mode removes the circular mask that previously looked like a warped or cropped edge.
- Motion behavior: every surface idles at speed 0; hover/focus and activation produce short governed pulses with pointer-origin ripple and layered press depth. The process panel swaps at 170ms and settles by 430ms while its shader pulse ends at 480ms. The Services wipe swaps content at 250ms and clears by 620ms. Strict selector geometry moves the clipping wrapper, not the canvas, and the selected Services cell changes immediately rather than dragging material across inactive cells.
- Cancellation: process and Services changes increment a transition token, cancel prior timers and Web Animations, and always settle on the last requested tab with selected state, content, image, route, and announcement synchronized.
- Lifecycle: delayed IntersectionObserver mounting uses idle time before observing, a 72px approach margin, maximum device-pixel ratio 1.25, and per-surface budgets from 36,000 to 200,000 pixels. Large movement is capped at one canvas, service-wipe mounts only on use, hidden/offscreen surfaces return to speed 0, and observers/listeners/animations are cleaned up through `dispose()` on page hide.
- Fallbacks: static cobalt/chrome material for reduced motion, Safari, coarse pointers, Save-Data, constrained-memory/CPU devices, or WebGL failure. Canvases use low-power WebGL without antialiasing and are decorative, `aria-hidden`, unfocusable, and pointer-transparent.

The committed bundle was produced from the supplied app's installed package with esbuild 0.25.9; no build step is needed to view the concept.

## Visual system

- Direction: Human proof, in motion
- Typography: locally vendored Archivo variable font
- Layout: high-contrast editorial grids, strict information hierarchy, square premium surfaces, and 4px controls
- Palette: cool off-white, deep navy, Toptal cobalt, conversion green, and a brighter verified-state green in dark mode
- Runtime icon system: locally vendored Phosphor SVG image assets, avoiding CSS mask base-URL differences so icons render under both HTTP and direct `file:///` use
- Named experts: current public Toptal portraits only; no generated faces are used for talent proof

## Generated service imagery

The built-in image generation tool was used in `photorealistic-natural` mode for anonymous service/editorial scenes only. Source PNGs and responsive WebP derivatives are stored under `assets/images/services/`.

### Marketing strategy

Files: `marketing-strategy-source.png`, `marketing-strategy-960.webp`, `marketing-strategy-1600.webp`

Prompt: premium enterprise services image of a candid marketing strategy workshop with four anonymous senior professionals of varied age and ethnicity, physical campaign layouts, market maps, swatches, cool-neutral daylight, restrained cobalt accents, real paper/fabric/wood texture, wide responsive crop, and no readable text, logos, trademarks, fake UI, watermark, or staged stock-photo gestures.

### Management consulting

Files: `management-consulting-source.png`, `management-consulting-960.webp`, `management-consulting-1600.webp`

Prompt: premium enterprise services image of an operational transformation working session with three anonymous senior consultants and one client leader, physical operating-model materials, crisp late-morning light, slate/navy wardrobe, quiet decision-making, wide responsive crop, and no readable text, logos, trademarks, fake UI, watermark, handshakes, holograms, or glossy stock-photo staging.

The previously approved technology collaboration image was retained and re-exported as `technology-collaboration-960.webp` and `technology-collaboration-1600.webp`.

## Verification completed

- Browser QA at 1440x1000, 1280x800, 1024x768, 768x1024, 390x844, and 360x800, with the final category/icon regressions repeated at 1440 and 390 under both HTTP and direct `file:///` runtime.
- Desktop hero CTAs fit both required initial viewports: CTA bottom at 585px in 1280x800 and 586px in 1024x768.
- Zero document-level horizontal overflow at 1440, 1280, 1024, 768, 390, and 360 widths.
- Mega-menu preview, Escape/focus return, hero intent/profile selection, synthetic touch swipe, category/network selection, mobile carousel controls, delivery controls, process pointer/Arrow/Home/End controls, expertise filtering/empty/reset, methodology disclosures, rapid service switching, theme, Back to top, footer accordions, and mobile focus/inert behavior exercised in a real browser. The focused regression confirmed Product Managers shows Adrian Gonzalez and Casey Arrington only, Designers shows Danielle Thompson only, and the other five disciplines show explicitly non-profile directory/proof cards.
- All eight category icons report complete local SVG image loads at 1440 and 390 in both HTTP and direct-file runs; all four runs retained zero document-level horizontal overflow.
- Axe-core 4.12.1: zero violations in the final light desktop and light mobile focused runs. Remaining incomplete items are axe's pseudo-element/background-detection review, not identified failures.
- Browser console and page-error checks returned no errors after a fresh reload; the bundle and application scripts also pass syntax checks.
- Process stability: 540px at 1440/1024/768 and 720px at 390/360 before and after changes. The refined 390px rail measures 96px, every tab retains a 96px target and its complete label, and rapid 0→2→1 requests settle on step 1 with no stale panel or residual transition.
- Mobile Services rail: all three selected tabs center with a measured 0px center delta at 390px; edge-fade classes update at the start, middle, and end without exposing a scrollbar or creating document overflow.
- Services stability: fixed 640px desktop, 950px at 768, and 820px mobile stages. Rapid selection and keyboard changes settle on the final requested service with the correct image, title, capabilities, and governed route.
- Reduced motion: zero canvases, immediate process/service swaps, final counter values present, ranking visible, and zero continuous animations.
- Shader lifecycle: the fresh hero mounts two surfaces with 15,928 total canvas pixels and zero large moving shaders. All eight surfaces mounted after targeted visits; at settled idle all eight reported speed 0, large-moving count 0 against the maximum of 1, and every canvas was `aria-hidden` with `tabIndex=-1`. Emulated reduced motion mounted zero canvases and completed process/Services swaps immediately.
- Resource loading: the initial desktop route requests only the active 960px Services image, not all service variants. Mobile always requests the 960px derivative and did not request a 1600px Services asset after switching. Service-image warming occurs only on pointer/focus intent.
- The seven ranking employer marks were converted from 350.5KB of legacy ICO files to 18.6KB of locally vendored 56px PNGs, a 94.7% runtime reduction. The older ICO files remain unreferenced for source-history safety.
- Focused local performance comparison at 1440px:

| Measure | Before | After | Change |
| --- | ---: | ---: | ---: |
| Resource requests | 33 | 21 | -36.4% |
| Encoded subresource bodies | 977,177B | 357,306B | -63.4% |
| Services images before reaching Services | 4 | 1 | -75.0% |
| Initial canvas pixels | 91,918 | 15,928 | -82.7% |
| Idle large-moving shaders | 1 | 0 | eliminated |
| DOMContentLoaded | 786.8ms | 627.5ms | -159.3ms |
| CLS | 0.00 | 0.00 | unchanged |
| FCP | 464ms | 588ms | +124ms |
| LCP | 1,332ms | 2,068ms | +736ms |
| TTFB | 5.6ms | 8.8ms | +3.2ms |
| Long tasks over 50ms | 0 | 0 | unchanged |

The encoded-body comparison sums `PerformanceResourceTiming.encodedBodySize` for 21 subresources and excludes the HTML navigation document and HTTP response headers. Against the recorded 977,177B baseline, the verified 357,306B current total is 619,871B lower, a 63.4% reduction. The resource, image, and GPU-memory improvements are deterministic in the local trace. The single-run paint/vital timings are local lab values and show normal run-to-run variability; FCP/LCP/TTFB regressed in this sample and are not presented as a production performance win.
- All lazy images were explicitly scrolled into view and confirmed complete before final full-page capture.
- Clean-boundary captures: `assets/screenshots/clean-hero-casey-1440.png`, `assets/screenshots/clean-hero-casey-390.png`, `assets/screenshots/clean-services-marketing-1440.png`, `assets/screenshots/clean-services-marketing-390.png`, `assets/screenshots/clean-process-transition-mid-1440.png`, `assets/screenshots/clean-process-trial-1440.png`, `assets/screenshots/clean-process-trial-390.png`, `assets/screenshots/clean-ranking-material-1440.png`, `assets/screenshots/clean-ranking-material-390.png`, and `assets/screenshots/clean-file-services-1440.png`.
- Final desktop capture: `assets/screenshots/desktop-1440x1000.png`, 1440x9598.
- Final mobile capture: `assets/screenshots/mobile-390x844.png`, 390x11682. The mobile footer retains all governed routes in compact closed accordions.

## Source and claim notes

Visible metrics, category naming, service routes, navigation labels, process language, and ranking proof are grounded in the supplied August 24, 2026 current-site research audit. The Newsweek source links directly to the 2026 America's Most Reliable Companies ranking. Named profile details and portraits were verified against their current public Toptal profile pages before implementation.

## Limitations

- Hiring, application, login, service, profile, case study, and Newsweek journeys intentionally continue to their public destinations; no backend workflow is reproduced here.
- Analytics, CMS governance, CRM handoffs, redirects, production headers, consent, and sitemap behavior belong to the planned production rollout.
- Public claims and profile facts should be reverified immediately before production release.
- Automated browser and axe checks do not replace final NVDA, VoiceOver, Safari, or physical-device testing.
- A browser motion-demo recording was attempted, but the local browser harness could not finalize video because FFmpeg is not installed; the interaction sequence itself completed cleanly in browser QA.
