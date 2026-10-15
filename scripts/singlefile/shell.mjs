/** HTML shell templates + vanilla router JS for the single-file build.
 *  Mirrors the real site's markup (header.tsx / footer.tsx / page.tsx /
 *  tools page / contact page) with hash-based navigation (#/...). */

export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function makeCtx(meta) {
  const { tools, categories, counts, popular, icons } = meta;
  const bySlug = new Map(tools.map((t) => [t.slug, t]));
  const catById = new Map(categories.map((c) => [c.id, c]));
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));
  const toolsOf = (catId) => tools.filter((t) => t.category === catId);

  const icon = (name, cls = "h-5 w-5") => {
    const svg = (icons[name] ?? icons.Wand2 ?? "").replace(/class="[^"]*"/, `class="${cls}"`);
    return svg;
  };

  const toolCard = (t) => `
<a href="#/t/${esc(t.slug)}" class="group flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-tool-card data-name="${esc(t.name.toLowerCase())}" data-kw="${esc((t.keywords || []).join(" ").toLowerCase())}" data-cat="${esc(t.category)}">
  <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">${icon(t.icon)}</div>
  <h3 class="font-semibold leading-snug">${esc(t.name)}</h3>
  <p class="line-clamp-2 text-sm text-muted-foreground">${esc(t.description)}</p>
</a>`;

  const categoryCard = (c) => `
<a href="#/c/${esc(c.slug)}" class="group relative flex flex-col overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
  <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${esc(c.color)}" aria-hidden="true"></div>
  <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow ${esc(c.color)}">${icon(c.icon)}</div>
  <h3 class="mt-3 font-semibold">${esc(c.name)}</h3>
  <p class="mt-1 line-clamp-2 text-sm text-muted-foreground">${esc(c.description)}</p>
  <p class="mt-2 text-xs font-medium text-primary">${counts[c.id] ?? toolsOf(c.id).length} tools →</p>
</a>`;

  return { tools, categories, counts, popular, bySlug, catById, catBySlug, toolsOf, icon, toolCard, categoryCard };
}

export function head(meta) {
  const { tools } = meta;
  const itemList = tools.map((t) => `{"@type":"ListItem","position":${tools.indexOf(t) + 1},"name":${JSON.stringify(t.name)},"url":"https://pixkitapp.com/#/t/${t.slug}"}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite", name: "PixKitApp", url: "https://pixkitapp.com/",
        description: "127 free browser-based image tools with zero uploads.",
        potentialAction: { "@type": "SearchAction", target: "https://pixkitapp.com/#/tools?q={search_term_string}", "query-input": "required name=search_term_string" },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "Are PixKitApp tools really free?", answer: "Yes — all 127 image tools are completely free with no signup, no watermarks and no usage limits." },
          { "@type": "Question", name: "Are my images uploaded to a server?", answer: "No. Every tool processes images locally in your browser using Canvas and web APIs. Your files never leave your device." },
          { "@type": "Question", name: "Do the tools work on phones and Chromebooks?", answer: "Yes. PixKitApp is mobile-first and works in any modern browser — Android, iPhone, iPad, Chromebook, Windows and Mac." },
        ],
      },
      { "@type": "ItemList", name: "PixKitApp tools", numberOfItems: tools.length, itemListElement: JSON.parse(`[${itemList.join(",")}]`) },
    ],
  };
  return `  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PixKitApp — 127 Free Online Image Tools (No Upload Required)</title>
  <meta name="description" content="Compress, resize, crop, convert, watermark and perfect your images with 127 free browser-based tools. Photos never leave your device. Works on mobile and Chromebook." />
  <meta name="keywords" content="image tools, image compressor, image resizer, convert webp to jpg, crop image, passport photo maker, watermark image, remove background, image converter, photo editor online" />
  <meta name="theme-color" content="#7c3aed" />
  <link rel="canonical" href="https://pixkitapp.com/" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="PixKitApp" />
  <meta property="og:title" content="PixKitApp — Free Online Image Tools" />
  <meta property="og:description" content="127 private, browser-based image tools. No uploads, no signups, no watermarks." />
  <meta property="og:url" content="https://pixkitapp.com/" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="PixKitApp — Free Online Image Tools" />
  <meta name="twitter:description" content="127 private, browser-based image tools. No uploads required." />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23a855f7'/%3E%3Cstop offset='100%25' stop-color='%23f97316'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='2' y='2' width='28' height='28' rx='8' fill='url(%23g)'/%3E%3Cpath d='M9 22V10h6.2c2.9 0 4.8 1.8 4.8 4.4s-1.9 4.4-4.8 4.4H12.4V22H9zm3.4-5.9h2.4c1.2 0 2-.7 2-1.7s-.8-1.7-2-1.7h-2.4v3.4z' fill='%23fff'/%3E%3Crect x='21.5' y='18.5' width='4' height='4' rx='1' fill='%23fff' opacity='.95'/%3E%3C/svg%3E" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
}

export function header(ctx) {
  const navItems = [
    ["#/tools", "All Tools"], ["#/c/compress", "Compress"], ["#/c/convert", "Convert"],
    ["#/c/passport-photos", "Passport Photos"], ["#/about", "About"],
  ];
  return `
<header class="sticky top-0 z-50 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/75">
  <div class="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
    <a href="#/" class="shrink-0" aria-label="PixKitApp home">
      <span class="inline-flex items-center gap-2">
        <svg viewBox="0 0 32 32" class="h-7 w-7 shrink-0" aria-hidden="true"><defs><linearGradient id="pixkit-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#f97316"/></linearGradient></defs><rect x="2" y="2" width="28" height="28" rx="8" fill="url(#pixkit-grad)"/><path d="M9 22V10h6.2c2.9 0 4.8 1.8 4.8 4.4s-1.9 4.4-4.8 4.4H12.4V22H9zm3.4-5.9h2.4c1.2 0 2-.7 2-1.7s-.8-1.7-2-1.7h-2.4v3.4z" fill="#fff"/><rect x="21.5" y="18.5" width="4" height="4" rx="1" fill="#fff" opacity="0.95"/></svg>
        <span class="text-lg font-bold tracking-tight">Pix<span class="text-primary">Kit</span>App</span>
      </span>
    </a>
    <nav class="ml-4 hidden items-center gap-1 lg:flex" aria-label="Main navigation">
      ${navItems.map(([href, label]) => `<a data-nav="${href}" href="${href}" class="rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground">${label}</a>`).join("")}
    </nav>
    <div class="ml-auto flex items-center gap-2">
      <button type="button" data-search-open class="hidden h-10 items-center gap-2 rounded-full border bg-card px-3.5 text-sm text-muted-foreground transition-colors hover:bg-accent sm:inline-flex" aria-label="Search tools">
        ${ctx.icon("Search", "h-4 w-4")} <span>Search tools…</span>
      </button>
      <button type="button" data-theme-toggle class="inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent" aria-label="Toggle dark mode">
        <span class="dark:hidden">${ctx.icon("Sun")}</span><span class="hidden dark:inline">${ctx.icon("Moon")}</span>
      </button>
      <button type="button" data-search-open class="inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent sm:hidden" aria-label="Search tools">${ctx.icon("Search")}</button>
      <button type="button" data-menu-toggle class="inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent lg:hidden" aria-label="Open menu" aria-expanded="false">${ctx.icon("Menu")}</button>
    </div>
  </div>
  <div data-mobile-menu hidden class="border-t bg-background lg:hidden">
    <div class="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
      <a href="#/tools" class="block rounded-lg px-3 py-2.5 text-base font-semibold hover:bg-accent">All Tools</a>
      ${ctx.categories.map((c) => `<a href="#/c/${esc(c.slug)}" class="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"><span>${esc(c.name)}</span><span class="text-xs">${ctx.counts[c.id] ?? 0}</span></a>`).join("")}
      <div class="my-2 h-px bg-border"></div>
      ${["about", "contact", "privacy", "terms"].map((p) => `<a href="#/${p}" class="block rounded-lg px-3 py-2.5 text-sm capitalize hover:bg-accent">${p}</a>`).join("")}
    </div>
  </div>
</header>`;
}

export function home(ctx) {
  const { tools, categories, bySlug, counts } = ctx;
  const popularCards = ctx.popular.map((s) => ctx.toolCard(bySlug.get(s))).join("");
  const spotlight = ["image-compressor", "image-to-pdf", "passport-photo-maker", "remove-white-background", "resize-image-to-kb", "image-metadata-viewer"]
    .map((s) => { const t = bySlug.get(s); return t ? `
    <a href="#/t/${esc(s)}" class="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-accent/40">
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">${ctx.icon(t.icon, "h-4 w-4")}</div>
      <div class="min-w-0"><p class="truncate text-sm font-medium">${esc(t.name)}</p><p class="truncate text-xs text-muted-foreground">${esc(t.description)}</p></div>
    </a>` : ""; }).join("");
  const whyItems = [
    ["Your images never leave your device", "Unlike most online tools, PixKitApp has no upload step. All processing runs locally with the Canvas API and modern browser capabilities — even works offline after the page loads."],
    ["Genuinely different tools, not clones", "Each of the 127 tools has its own purpose-built interface, options and output — from iterative target-size compression to EXIF inspection to passport photo guides."],
    ["Built for every screen", "Large touch targets, responsive layouts and keyboard shortcuts make it fast on phones, Chromebooks and desktops alike."],
    ["Batch everything", "Process up to 10 images per run with per-file stats and one-click ZIP download of all results."],
  ].map(([title, body]) => `
    <div class="flex gap-3">
      <div class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">${ctx.icon("ShieldCheck", "h-3.5 w-3.5")}</div>
      <div><h3 class="font-semibold">${esc(title)}</h3><p class="mt-0.5 text-sm leading-relaxed text-muted-foreground">${esc(body)}</p></div>
    </div>`).join("");
  const allTools = categories.map((c) => {
    const list = tools.filter((t) => t.category === c.id);
    if (!list.length) return "";
    return `
    <div>
      <h3 class="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">${ctx.icon(c.icon, "h-4 w-4")} ${esc(c.name)} <span class="rounded-full bg-muted px-2 py-0.5 text-xs normal-case">${list.length}</span></h3>
      <div class="flex flex-wrap gap-2">${list.map((t) => `<a href="#/t/${esc(t.slug)}" class="rounded-full border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground">${esc(t.name)}</a>`).join("")}</div>
    </div>`;
  }).join("");
  const suggestions = ["compress to 50kb", "webp to jpg", "passport photo", "crop circle", "remove background", "resize for instagram"];
  return `
<section data-page="home">
  <section class="relative overflow-hidden border-b bg-gradient-to-b from-primary/8 via-primary/4 to-transparent">
    <div class="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-20">
      <div class="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">${ctx.icon("BadgeCheck", "h-4 w-4 text-primary")} ${tools.length} tools · zero uploads · free forever</div>
      <h1 class="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">Every image tool you need. <span class="bg-gradient-to-r from-violet-600 to-orange-500 bg-clip-text text-transparent">Right in your browser.</span></h1>
      <p class="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">Compress, resize, crop, convert, watermark and more — ${tools.length} free tools that process images on your device. Nothing is ever uploaded, so your photos stay private.</p>
      <div class="mx-auto mt-7 max-w-xl">
        <form role="search" data-home-search class="flex overflow-hidden rounded-full border bg-card shadow-lg focus-within:ring-2 focus-within:ring-ring">
          <div class="flex flex-1 items-center gap-2 pl-4">${ctx.icon("Search", "h-5 w-5 shrink-0 text-muted-foreground")}
            <input type="search" name="q" placeholder="Search tools — try “compress” or “webp”…" aria-label="Search image tools" class="w-full bg-transparent py-3.5 text-base outline-none placeholder:text-muted-foreground" />
          </div>
          <button type="submit" class="m-1 inline-flex h-11 items-center gap-1.5 rounded-full bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90">Search →</button>
        </form>
        <div class="mt-3 flex flex-wrap justify-center gap-2">${suggestions.map((s) => `<button type="button" data-suggest="${esc(s)}" class="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">${esc(s)}</button>`).join("")}</div>
      </div>
      <div class="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        ${[["ShieldCheck", "Private by design"], ["Zap", "Instant results"], ["Smartphone", "Mobile-first"], ["BadgeCheck", "No watermarks"]].map(([ic, label]) => `<div class="flex items-center justify-center gap-2 rounded-lg border bg-card px-3 py-2.5">${ctx.icon(ic, "h-4 w-4 text-primary")}<span class="font-medium">${label}</span></div>`).join("")}
      </div>
    </div>
  </section>
  <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6">
    <div class="mb-6 flex items-end justify-between">
      <div><h2 class="text-2xl font-bold tracking-tight">Popular tools</h2><p class="mt-1 text-muted-foreground">The most-used image utilities on PixKitApp.</p></div>
      <a href="#/tools" class="hidden shrink-0 text-sm font-medium text-primary hover:underline sm:block">View all ${tools.length} →</a>
    </div>
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">${popularCards}</div>
    <a href="#/tools" class="mt-4 block text-sm font-medium text-primary hover:underline sm:hidden">View all ${tools.length} tools →</a>
  </section>
  <section class="border-y bg-card/50">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h2 class="text-2xl font-bold tracking-tight">Browse by category</h2>
      <p class="mt-1 text-muted-foreground">Every tool organized into ${categories.length} focused categories.</p>
      <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">${categories.map(ctx.categoryCard).join("")}</div>
    </div>
  </section>
  <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6">
    <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight sm:text-3xl">Why PixKitApp is different</h2>
        <div class="mt-5 space-y-4">${whyItems}</div>
      </div>
      <div class="min-w-0 rounded-2xl border bg-card p-6 shadow-sm">
        <h3 class="font-semibold">Tool spotlight</h3>
        <div class="mt-4 grid grid-cols-1 gap-2">${spotlight}</div>
      </div>
    </div>
  </section>
  <section class="border-t bg-card/50">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div class="mb-6 flex items-end justify-between">
        <div><h2 class="text-2xl font-bold tracking-tight">All ${tools.length} tools</h2><p class="mt-1 text-muted-foreground">Everything on PixKitApp, organized by category.</p></div>
        <a href="#/tools" class="shrink-0 text-sm font-medium text-primary hover:underline">Search &amp; filter →</a>
      </div>
      <div class="space-y-6">${allTools}</div>
    </div>
  </section>
</section>`;
}

export function toolsIndex(ctx) {
  const { tools, categories } = ctx;
  return `
<section data-page="tools" hidden>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
    <header class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight">All PixKitApp Tools</h1>
      <p class="mt-2 max-w-2xl text-muted-foreground">Every one of our ${tools.length} free image tools — searchable, filterable and always processed locally in your browser.</p>
    </header>
    <div class="mb-6 space-y-4">
      <div class="relative">
        ${ctx.icon("Search", "absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground")}
        <input type="search" data-tools-filter placeholder="Search ${tools.length} tools — name, format or task…" aria-label="Filter tools" class="h-12 w-full rounded-full border bg-card pl-11 pr-4 text-base outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="flex flex-wrap gap-2" data-cat-chips role="group" aria-label="Filter by category">
        <button type="button" data-chip="all" class="rounded-full border bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground">All</button>
        ${categories.map((c) => `<button type="button" data-chip="${esc(c.id)}" class="rounded-full border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground">${esc(c.name)} <span class="text-xs">${ctx.counts[c.id] ?? 0}</span></button>`).join("")}
      </div>
    </div>
    <p class="mb-4 text-sm text-muted-foreground" data-tools-count aria-live="polite"></p>
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-tools-grid>${tools.map(ctx.toolCard).join("")}</div>
    <div data-tools-empty hidden class="rounded-xl border-2 border-dashed p-10 text-center text-muted-foreground">No tools match your search. Try a different keyword.</div>
  </div>
</section>`;
}

export function dynamicSections() {
  return `
<section data-page="category" hidden><div class="mx-auto max-w-7xl px-4 py-8 sm:px-6" data-category-content></div></section>
<section data-page="tool" hidden><div class="mx-auto max-w-7xl px-4 py-8 sm:px-6" data-tool-content></div></section>
<section data-page="notfound" hidden>
  <div class="mx-auto max-w-2xl px-4 py-24 text-center">
    <p class="text-6xl font-extrabold text-primary">404</p>
    <h1 class="mt-4 text-2xl font-bold">Page not found</h1>
    <p class="mt-2 text-muted-foreground">The page you're looking for doesn't exist or has moved. Try one of our tools instead.</p>
    <a href="#/tools" class="mt-6 inline-flex h-12 items-center rounded-lg bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90">Browse all tools</a>
  </div>
</section>`;
}

export function contactSection(ctx) {
  return `
<section data-page="contact" hidden>
  <div class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
    <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Contact PixKitApp</h1>
    <p class="mt-3 leading-relaxed text-muted-foreground">Questions, bug reports, tool requests or partnership ideas — we want to hear them. The fastest way to reach the team is the form below: it prepares an email draft in your own mail client, so nothing you write passes through a web server first. We typically reply within two business days.</p>
    <div class="mt-6 grid gap-3 sm:grid-cols-3">
      <div class="rounded-lg border bg-card p-4"><h2 class="text-sm font-semibold">Feedback &amp; ideas</h2><p class="mt-1 text-xs leading-relaxed text-muted-foreground">Tell us which tool to build next — user requests drive our roadmap.</p></div>
      <div class="rounded-lg border bg-card p-4"><h2 class="text-sm font-semibold">Bug reports</h2><p class="mt-1 text-xs leading-relaxed text-muted-foreground">Include your browser (e.g. Chrome 130, Android) and what you expected to happen.</p></div>
      <div class="rounded-lg border bg-card p-4"><h2 class="text-sm font-semibold">Everything else</h2><p class="mt-1 text-xs leading-relaxed text-muted-foreground">Press, partnerships, education use — all welcome at nihadmehar2@gmail.com.</p></div>
    </div>
    <div class="mt-8">
      <form data-contact-form novalidate class="space-y-5 rounded-xl border bg-card p-6">
        <div>
          <label class="mb-2 block text-sm font-medium">What's this about?</label>
          <div class="grid grid-cols-3 gap-2" data-contact-types role="group">
            ${[["feedback", "General feedback"], ["bug", "Report a bug"], ["idea", "Tool request"]].map(([id, label], i) => `<button type="button" data-ctype="${id}" class="flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors ${i === 0 ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"}">${label}</button>`).join("")}
          </div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5"><label for="c-name" class="text-sm font-medium">Name</label><input id="c-name" data-c-name maxlength="80" placeholder="Jane Doe" class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
          <div class="space-y-1.5"><label for="c-email" class="text-sm font-medium">Email</label><input id="c-email" data-c-email type="email" maxlength="120" placeholder="jane@example.com" class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
        </div>
        <div class="space-y-1.5"><label for="c-message" class="text-sm font-medium">Message</label><textarea id="c-message" data-c-message rows="6" maxlength="4000" placeholder="Tell us what you love, what's broken, or what tool you wish existed…" class="flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"></textarea></div>
        <p data-contact-error hidden class="text-sm font-medium text-destructive"></p>
        <button type="submit" class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto sm:px-8">Open email draft</button>
        <p class="text-xs leading-relaxed text-muted-foreground">This form composes an email in your own mail client — PixKitApp servers never receive your message or contact details. You can also reach us directly at <span class="inline-flex items-center gap-1 font-medium text-foreground">${ctx.icon("Mail", "h-3.5 w-3.5")} nihadmehar2@gmail.com</span>.</p>
      </form>
      <div data-contact-success hidden class="rounded-xl border bg-card p-8 text-center">
        <h2 class="text-xl font-semibold">Your email draft is ready</h2>
        <p class="mx-auto mt-2 max-w-md text-sm text-muted-foreground">We opened your email client with the message pre-filled — just hit send. This keeps the process fully private: no contact data passes through our site.</p>
        <button type="button" data-contact-again class="mt-5 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-accent">Write another message</button>
      </div>
    </div>
  </div>
</section>`;
}

export function footer(ctx) {
  const year = new Date().getFullYear();
  const popularSlugs = ["image-compressor", "image-resizer", "crop-image", "webp-to-jpg", "image-to-pdf", "passport-photo-maker"];
  return `
<footer class="mt-auto border-t bg-card">
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
    <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
      <div>
        <span class="inline-flex items-center gap-2">
          <svg viewBox="0 0 32 32" class="h-7 w-7 shrink-0" aria-hidden="true"><defs><linearGradient id="pixkit-grad-f" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#f97316"/></linearGradient></defs><rect x="2" y="2" width="28" height="28" rx="8" fill="url(#pixkit-grad-f)"/><path d="M9 22V10h6.2c2.9 0 4.8 1.8 4.8 4.4s-1.9 4.4-4.8 4.4H12.4V22H9zm3.4-5.9h2.4c1.2 0 2-.7 2-1.7s-.8-1.7-2-1.7h-2.4v3.4z" fill="#fff"/><rect x="21.5" y="18.5" width="4" height="4" rx="1" fill="#fff" opacity="0.95"/></svg>
          <span class="text-lg font-bold tracking-tight">Pix<span class="text-primary">Kit</span>App</span>
        </span>
        <p class="mt-3 max-w-xs text-sm text-muted-foreground">${ctx.tools.length} free image tools that run entirely in your browser. No uploads, no signups, no watermarks — your photos stay on your device.</p>
      </div>
      <div>
        <h3 class="text-sm font-semibold">Categories</h3>
        <ul class="mt-3 space-y-2 text-sm text-muted-foreground">${ctx.categories.map((c) => `<li><a href="#/c/${esc(c.slug)}" class="hover:text-primary">${esc(c.name)}</a></li>`).join("")}</ul>
      </div>
      <div>
        <h3 class="text-sm font-semibold">Popular Tools</h3>
        <ul class="mt-3 space-y-2 text-sm text-muted-foreground">${popularSlugs.map((s) => { const t = ctx.bySlug.get(s); return t ? `<li><a href="#/t/${esc(s)}" class="hover:text-primary">${esc(t.name)}</a></li>` : ""; }).join("")}</ul>
      </div>
      <div>
        <h3 class="text-sm font-semibold">Company</h3>
        <ul class="mt-3 space-y-2 text-sm text-muted-foreground">
          <li><a href="#/about" class="hover:text-primary">About Us</a></li>
          <li><a href="#/contact" class="hover:text-primary">Contact</a></li>
          <li><a href="#/privacy" class="hover:text-primary">Privacy Policy</a></li>
          <li><a href="#/terms" class="hover:text-primary">Terms of Service</a></li>
          <li><a href="#/tools" class="hover:text-primary">All ${ctx.tools.length} Tools</a></li>
        </ul>
      </div>
    </div>
    <div class="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
      <p>© ${year} PixKitApp · pixkitapp.com — All rights reserved.</p>
      <p class="flex items-center gap-1.5"><span class="inline-block h-2 w-2 rounded-full bg-green-500" aria-hidden="true"></span>Images are processed in your browser — never uploaded</p>
    </div>
  </div>
</footer>`;
}

export function searchDialog(ctx) {
  return `
<dialog data-search-dialog class="mx-auto mt-24 w-[calc(100vw-2rem)] max-w-xl rounded-xl border bg-popover p-0 text-popover-foreground shadow-xl backdrop:bg-black/50">
  <div class="flex items-center gap-2 border-b px-4 py-3">${ctx.icon("Search", "h-4.5 w-4.5 shrink-0 text-muted-foreground")}
    <input type="search" data-search-input placeholder="Search tools — name, format or task…" aria-label="Search tools" class="h-8 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground" />
    <button type="button" data-search-close aria-label="Close search" class="rounded p-1 hover:bg-accent">${ctx.icon("X", "h-4 w-4")}</button>
  </div>
  <div data-search-results class="max-h-80 overflow-y-auto p-2" role="listbox" aria-label="Search results"></div>
</dialog>`;
}

export function routerJs(ctx) {
  return String.raw`
(function () {
  "use strict";
  var PK = window.PixKitBundle;
  var TOOLS = PK.tools;
  var bySlug = {}; TOOLS.forEach(function (t) { bySlug[t.slug] = t; });
  var CATS = PK.categories;
  var catById = {}; CATS.forEach(function (c) { catById[c.id] = c; });
  var iconMap = window.PixKitIcons || {};
  function icon(name, cls) {
    var raw = iconMap[name] || iconMap.Wand2 || "";
    return raw.replace(/class="[^"]*"/, 'class="' + (cls || "h-5 w-5") + '"');
  }
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };

  var TITLES = { home: "PixKitApp — 127 Free Online Image Tools (No Upload Required)", tools: "All Tools — 127 Free Image Tools A-Z | PixKitApp", about: "About PixKitApp | PixKitApp", contact: "Contact Us | PixKitApp", privacy: "Privacy Policy | PixKitApp", terms: "Terms of Service | PixKitApp", notfound: "Page Not Found | PixKitApp" };

  function show(name) {
    $$("[data-page]").forEach(function (s) { s.hidden = s.getAttribute("data-page") !== name; });
  }
  function setHead(title, desc) {
    document.title = title;
    var m = $('meta[name="description"]'); if (m && desc) m.setAttribute("content", desc);
  }
  function setNav(hash) {
    $$("[data-nav]").forEach(function (a) {
      var active = a.getAttribute("data-nav") === hash;
      a.classList.toggle("text-primary", active);
      a.classList.toggle("text-muted-foreground", !active);
    });
  }
  function scrollTop() { window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" }); }

  function catCardHtml(c) {
    var n = TOOLS.filter(function (t) { return t.category === c.id; }).length;
    return '<a href="#/c/' + c.slug + '" class="group relative flex flex-col overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">' +
      '<div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r ' + c.color + '" aria-hidden="true"></div>' +
      '<div class="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow ' + c.color + '">' + icon(c.icon) + '</div>' +
      '<h3 class="mt-3 font-semibold">' + c.name + '</h3>' +
      '<p class="mt-1 line-clamp-2 text-sm text-muted-foreground">' + c.description + '</p>' +
      '<p class="mt-2 text-xs font-medium text-primary">' + n + ' tools →</p></a>';
  }
  function toolCardHtml(t) {
    return '<a href="#/t/' + t.slug + '" data-tool-card data-cat="' + t.category + '" data-name="' + t.name.toLowerCase() + '" data-kw="' + (t.keywords || []).join(" ").toLowerCase() + '" class="group flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">' +
      '<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">' + icon(t.icon) + '</div>' +
      '<h3 class="font-semibold leading-snug">' + t.name + '</h3>' +
      '<p class="line-clamp-2 text-sm text-muted-foreground">' + t.description + '</p></a>';
  }

  function renderCategory(slug) {
    var c = null; CATS.forEach(function (x) { if (x.slug === slug) c = x; });
    if (!c) return false;
    var list = TOOLS.filter(function (t) { return t.category === c.id; });
    var el = $('[data-category-content]');
    el.innerHTML =
      '<nav class="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb"><a href="#/" class="hover:text-foreground">Home</a>' +
      '<span aria-hidden="true">/</span><span class="text-foreground">' + c.name + '</span></nav>' +
      '<header class="mb-6"><div class="flex items-center gap-3"><div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow ' + c.color + '">' + icon(c.icon, "h-6 w-6") + '</div>' +
      '<div><h1 class="text-3xl font-bold tracking-tight">' + c.name + '</h1><p class="mt-1 text-muted-foreground">' + c.description + '</p></div></div></header>' +
      '<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">' + list.map(toolCardHtml).join("") + '</div>';
    show("category");
    setHead(c.name + " Tools — " + list.length + " Free Tools | PixKitApp", c.description);
    return true;
  }

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  function renderTool(slug) {
    var t = bySlug[slug];
    if (!t) return false;
    var c = catById[t.category];
    var sameCat = TOOLS.filter(function (x) { return x.category === t.category && x.slug !== t.slug; });
    var related = sameCat.slice(0, 4);
    var faq = (t.faq || []).map(function (f) {
      return '<details class="group rounded-lg border bg-card px-4 py-3"><summary class="cursor-pointer list-none text-sm font-medium marker:hidden">' + esc(f.q) + '<span class="float-plus float-right text-muted-foreground transition-transform group-open:rotate-45">+</span></summary><p class="mt-2 text-sm leading-relaxed text-muted-foreground">' + esc(f.a) + '</p></details>';
    }).join("");
    var el = $('[data-tool-content]');
    el.innerHTML =
      '<nav class="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">' +
      '<a href="#/" class="hover:text-foreground">Home</a><span aria-hidden="true">/</span>' +
      '<a href="#/c/' + c.slug + '" class="hover:text-foreground">' + c.name + '</a><span aria-hidden="true">/</span>' +
      '<span class="text-foreground">' + esc(t.name) + '</span></nav>' +
      '<div class="flex items-start gap-3"><div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">' + icon(t.icon, "h-6 w-6") + '</div>' +
      '<div class="min-w-0"><h1 class="text-2xl font-bold tracking-tight sm:text-3xl">' + esc(t.h1) + '</h1>' +
      '<p class="mt-2 max-w-3xl text-muted-foreground">' + esc(t.description) + '</p></div></div>' +
      '<div class="mt-6" id="pk-workspace" aria-label="' + esc(t.name) + ' workspace"></div>' +
      (t.about ? '<div class="mt-8 rounded-xl border bg-card p-6"><h2 class="text-lg font-semibold">About this tool</h2><p class="mt-2 text-sm leading-relaxed text-muted-foreground">' + esc(t.about) + '</p></div>' : "") +
      (faq ? '<div class="mt-8"><h2 class="text-lg font-semibold">Frequently asked questions</h2><div class="mt-4 space-y-2">' + faq + '</div></div>' : "") +
      (related.length ? '<div class="mt-8"><h2 class="text-lg font-semibold">Related tools</h2><div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">' + related.map(toolCardHtml).join("") + '</div></div>' : "");
    show("tool");
    var mt = t.seo && t.seo.metaTitle ? t.seo.metaTitle + " | PixKitApp" : t.name + " — Free Online | PixKitApp";
    setHead(mt, t.seo && t.seo.metaDescription ? t.seo.metaDescription : t.description);
    PK.mountTool(slug, $("#pk-workspace"));
    injectToolJsonLd(t, c);
    return true;
  }

  function injectToolJsonLd(t, c) {
    var old = $("#pk-jsonld-tool"); if (old) old.remove();
    var data = { "@context": "https://schema.org", "@graph": [
      { "@type": "WebApplication", name: t.name + " — PixKitApp", url: "https://pixkitapp.com/#/t/" + t.slug, applicationCategory: "MultimediaApplication", operatingSystem: "Any (web browser)", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: t.description },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://pixkitapp.com/" },
        { "@type": "ListItem", position: 2, name: c.name, item: "https://pixkitapp.com/#/c/" + c.slug },
        { "@type": "ListItem", position: 3, name: t.name, item: "https://pixkitapp.com/#/t/" + t.slug }] }
    ] };
    if (t.faq && t.faq.length) data["@graph"].push({ "@type": "FAQPage", mainEntity: t.faq.map(function (f) { return { "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }; }) });
    var s = document.createElement("script");
    s.type = "application/ld+json"; s.id = "pk-jsonld-tool";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  var activeChip = "all";
  function applyToolsFilter() {
    var q = ($('[data-tools-filter]').value || "").trim().toLowerCase();
    var cat = activeChip;
    var terms = q.split(/\s+/).filter(Boolean);
    var shown = 0;
    $$("[data-tools-grid] [data-tool-card]").forEach(function (card) {
      var okCat = cat === "all" || card.getAttribute("data-cat") === cat;
      var hay = card.getAttribute("data-name") + " " + card.getAttribute("data-kw") + " " + card.getAttribute("data-cat");
      var okQ = !terms.length || terms.every(function (term) { return hay.indexOf(term) !== -1; });
      var vis = okCat && okQ;
      card.hidden = !vis;
      if (vis) shown++;
    });
    $('[data-tools-count]').textContent = shown + " tool" + (shown !== 1 ? "s" : "") + (q || cat !== "all" ? " matching" : " available");
    $('[data-tools-empty]').hidden = shown !== 0;
  }

  function handleRoute() {
    var hash = location.hash.replace(/^#\/?/, "");
    var path = hash.split("?")[0];
    var query = new URLSearchParams((hash.split("?")[1] || ""));
    closeSearch(); closeMenu();
    setNav("#/" + path.split("/")[0] === "#/" ? "#/" : "#/" + (path.split("/")[0] === "t" || path.split("/")[0] === "c" ? path : path));
    PK.unmountAll();
    if (path === "" ) { show("home"); setHead(TITLES.home); }
    else if (path === "tools") {
      show("tools"); setHead(TITLES.tools);
      var q = query.get("q") || "";
      activeChip = "all";
      $$("[data-cat-chips] [data-chip]").forEach(function (x) { x.className = x.getAttribute("data-chip") === "all" ? "rounded-full border bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground" : "rounded-full border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"; });
      $('[data-tools-filter]').value = q;
      applyToolsFilter();
    }
    else if (path.indexOf("c/") === 0) { if (!renderCategory(path.slice(2))) renderNotFound(); }
    else if (path.indexOf("t/") === 0) { if (!renderTool(path.slice(2))) renderNotFound(); }
    else if (TITLES[path]) { show(path); setHead(TITLES[path]); }
    else renderNotFound();
    scrollTop();
  }

  function renderNotFound() { show("notfound"); setHead(TITLES.notfound); }

  // ---- search dialog ----
  var dlg = $('[data-search-dialog]');
  function openSearch() { dlg.showModal(); var i = $('[data-search-input]'); i.value = ""; searchResults(""); i.focus(); }
  function closeSearch() { if (dlg.open) dlg.close(); }
  function searchResults(q) {
    q = q.trim().toLowerCase();
    var terms = q.split(/\s+/).filter(Boolean);
    var hits = !terms.length ? TOOLS.slice(0, 8) : TOOLS.map(function (t) {
      var hay = (t.name + " " + t.slug + " " + t.description + " " + (t.keywords || []).join(" ")).toLowerCase();
      var score = 0;
      terms.forEach(function (term) { if (t.slug.indexOf(term) !== -1) score += 10; if (t.name.toLowerCase().indexOf(term) !== -1) score += 8; if (hay.indexOf(term) !== -1) score += 2; });
      return [t, score];
    }).filter(function (p) { return p[1] > 0; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 12).map(function (p) { return p[0]; });
    $('[data-search-results]').innerHTML = hits.length ? hits.map(function (t) {
      return '<a href="#/t/' + t.slug + '" class="flex items-center gap-3 rounded-lg p-2.5 hover:bg-accent" role="option">' +
        '<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">' + icon(t.icon, "h-4 w-4") + '</span>' +
        '<span class="min-w-0"><span class="block truncate text-sm font-medium">' + esc(t.name) + '</span>' +
        '<span class="block truncate text-xs text-muted-foreground">' + esc(t.description) + '</span></span></a>';
    }).join("") : '<p class="p-6 text-center text-sm text-muted-foreground">No tools found. Try a different keyword.</p>';
  }

  // ---- mobile menu ----
  var menu = $('[data-mobile-menu]');
  function closeMenu() { menu.hidden = true; $('[data-menu-toggle]').setAttribute("aria-expanded", "false"); }

  // ---- contact form ----
  var CONTACT_EMAIL = "nihadmehar2@gmail.com";
  function wireContact() {
    var form = $('[data-contact-form]'); if (!form) return;
    var ctype = "feedback";
    $$("[data-ctype]").forEach(function (b) {
      b.addEventListener("click", function () {
        ctype = b.getAttribute("data-ctype");
        $$("[data-ctype]").forEach(function (x) { x.className = "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors text-muted-foreground hover:bg-accent"; });
        b.className = "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors border-primary bg-primary/10 text-primary";
      });
    });
    function err(msg) {
      var p = $('[data-contact-error]');
      if (!msg) { p.hidden = true; return; }
      p.textContent = msg; p.hidden = false;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault(); err("");
      var name = $('[data-c-name]').value.trim();
      var email = $('[data-c-email]').value.trim();
      var message = $('[data-c-message]').value;
      if (!name) return err("Please enter your name.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err("Please enter a valid email address.");
      if (message.trim().length < 10) return err("Please write at least a sentence (10+ characters).");
      var subject = "[PixKitApp " + ctype + "] " + message.slice(0, 60).replace(/\s+/g, " ");
      var body = message + "\n\n—\nName: " + name + "\nEmail: " + email + "\nSent from pixkitapp.com contact page";
      window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      form.hidden = true; $('[data-contact-success]').hidden = false;
    });
    $('[data-contact-again]').addEventListener("click", function () {
      form.hidden = false; $('[data-contact-success]').hidden = true; $('[data-c-message]').value = "";
    });
  }

  function wire() {
    window.addEventListener("hashchange", handleRoute);
    $$("[data-theme-toggle]").forEach(function (b) {
      b.addEventListener("click", function () {
        var dark = document.documentElement.classList.toggle("dark");
        try { localStorage.setItem("pixkit-theme", dark ? "dark" : "light"); } catch (e) {}
      });
    });
    $$("[data-search-open]").forEach(function (b) { b.addEventListener("click", openSearch); });
    $$("[data-search-close]").forEach(function (b) { b.addEventListener("click", closeSearch); });
    $('[data-search-input]').addEventListener("input", function (e) { searchResults(e.target.value); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeSearch(); });
    $('[data-menu-toggle]').addEventListener("click", function () {
      menu.hidden = !menu.hidden;
      this.setAttribute("aria-expanded", String(!menu.hidden));
    });
    $('[data-tools-filter]').addEventListener("input", applyToolsFilter);
    Array.prototype.forEach.call(document.querySelectorAll("[data-cat-chips] [data-chip]"), function (b) {
      b.addEventListener("click", function () {
        activeChip = b.getAttribute("data-chip");
        Array.prototype.forEach.call(document.querySelectorAll("[data-cat-chips] [data-chip]"), function (x) { x.className = "rounded-full border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"; });
        b.className = "rounded-full border bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground";
        applyToolsFilter();
      });
    });
    $$("[data-suggest]").forEach(function (b) { b.addEventListener("click", function () { location.hash = "#/tools?q=" + encodeURIComponent(b.getAttribute("data-suggest")); }); });
    $$("[data-home-search]").forEach(function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var q = f.querySelector("input").value.trim();
        location.hash = q ? "#/tools?q=" + encodeURIComponent(q) : "#/tools";
      });
    });
    wireContact();
    handleRoute();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
`;
}
