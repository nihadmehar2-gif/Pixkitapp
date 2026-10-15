/** Report content blocks for PixKitApp SEO Enhancement Report (English).
 *  Block types: h1, h2, p, table {title, headers, rows, widths}, bullets, numbered, note.
 *  All figures come from the 2026-10-14 audit session — nothing invented. */

module.exports = [

// ================= 1. Executive Summary =================
{ t: "h1", x: "1. Executive Summary" },
{ t: "p", x: "This report documents the search-engine-optimization work carried out on PixKitApp.com, a browser-based image toolkit with 127 working tools across 14 categories. The engagement covered ten areas: keyword research, search-intent alignment, competitor analysis, internal linking, technical SEO, content quality, backlink strategy, Google Search Console setup, performance measurement, and a final actionable checklist. All existing tools, URLs, sitemap settings and prior SEO configurations were preserved; every change in this phase was additive or corrective, and no working URL was altered." },
{ t: "p", x: "The headline results are as follows. A keyword map covering all 127 tool pages was produced and delivered as a separate spreadsheet (PixKitApp-Keyword-Map.xlsx). Keyword candidates were verified against Google Autocomplete on 14 October 2026: 121 of 127 on-page primary keywords appear in Google's live suggestion data, and 150 of 442 hand-authored long-tail candidates were confirmed the same way. No search volumes are reported anywhere in the deliverables, because no volume data source was available; the spreadsheet states this explicitly and explains how to add verified volumes later. A 17-point technical audit of the production build passed with zero failures, the pre-existing 68-point regression suite passed 68 of 68, and Lighthouse measured Performance 95 on a representative tool page with a Cumulative Layout Shift of exactly 0." },
{ t: "p", x: "Three genuine content-quality defects were found by audit and fixed in code. First, generated FAQ answers repeated the tool name in every question and answer pair, pushing primary-keyword density above 3 percent on 32 pages (worst case 6.93 percent); answers are now name-free and every page measures at or below 3 percent. Second, boilerplate paragraphs were shared across the twelve social-media resizer pages; they now rotate through factually equivalent variants, reducing the worst cross-page text overlap from 70 shared 8-word sequences to 28. Third, thirty pages had thin FAQ coverage; the site now carries 494 FAQ entries with a minimum of three per tool, including unit-conversion answers (centimeters and inches) that respond to demand observed in real autocomplete data such as \"instagram story size in cm\"." },
{ t: "p", x: "The remaining work is organizational rather than technical: deploy to production, verify the domain in Google Search Console, submit the sitemap, provision the hello@pixkitapp.com mailbox, and begin conservative backlink outreach. These steps, along with realistic expectations about timelines, are described in Sections 9 through 12. Nothing in this report guarantees rankings, indexing, traffic, or AdSense approval." },

// ================= 2. Scope & Methodology =================
{ t: "h1", x: "2. Scope, Data Sources and Methodology" },
{ t: "p", x: "The engagement covered the entire public site: 147 indexable URLs (homepage, /tools, four static pages, 14 category pages and 127 tool pages), plus robots.txt and sitemap.xml. Testing was performed against a production build of the Next.js site (152 static pages prerendered, type-check and lint clean), served locally for measurement. Where third-party data was used, the source and retrieval date are stated; where no data source was available, the deliverable says so plainly rather than presenting estimates as facts." },
{ t: "p", x: "Four data sources feed this report. First, the site's own registry: every tool's name, accepted formats, options and limits, which grounds all keyword and FAQ work in what each tool actually does. Second, Google Autocomplete (public suggest endpoint, English locale), retrieved on 14 October 2026 for 254 seed queries across all 127 tools; this produced verifiable evidence of real query patterns. Third, a competitor scan performed via web search on the same date, identifying the current ranking landscape for image-tool queries. Fourth, direct measurement: a crawler written for this audit fetched all 147 URLs, extracted titles, meta descriptions, headings, canonicals and links, and tested every unique internal link; Lighthouse 12 measured performance and Core Web Vitals on two representative pages under mobile emulation." },
{ t: "p", x: "Two boundaries matter when reading the numbers. Autocomplete verification demonstrates that a query pattern exists in Google's suggestion system; it is not a search-volume measurement and volumes are not inferred from it. Likewise, competition notes in the keyword map are qualitative reasoning based on keyword specificity and the observed landscape, not numerical difficulty scores. Sections of this report distinguish the two explicitly wherever both appear." },

// ================= 3. Keyword Research =================
{ t: "h1", x: "3. Keyword Research and the Keyword Map" },
{ t: "p", x: "Each of the 127 tool pages already carried a hand-authored primary keyword, meta title and meta description from the earlier SEO build; these were preserved unchanged. The new work mapped every page to a set of supporting long-tail keywords, written individually against each tool's real capabilities (target sizes for the KB-compression tools, exact platform dimensions for the social resizers, official millimetre sizes for passport tools, format pairs for the 20 converters), and then verified as much of that set as possible against live Google suggestion data." },
{ t: "table", title: "Table 1: Keyword map coverage and verification results (retrieved 14 October 2026)", headers: ["Measure", "Result"], widths: [62, 38], rows: [
  ["Tool pages mapped", "127 of 127"],
  ["On-page primary keywords verified in Google Autocomplete", "121 of 127 (95 percent)"],
  ["Long-tail candidates authored", "442 (3 to 5 per tool)"],
  ["Long-tail candidates verified in Google Autocomplete", "150 (34 percent)"],
  ["Seed queries that returned live suggestion data", "123 of 127"],
  ["Real suggestion strings harvested as page-level evidence", "up to 8 per tool"],
  ["Search volumes, difficulty scores or traffic predictions included", "None (no data source; not estimated)"],
]},
{ t: "p", x: "The six primary keywords that could not be verified are niche ratio queries (for example \"crop 16:9\") where Google's suggest endpoint returned no response for the colon form; the equivalent spelled-out patterns (\"crop image to 16:9\") were verified as long-tails on the same pages. Five of the six are already supported by on-page titles and headings that use the spelled-out form, so no change was needed. The keyword map marks every keyword as either \"Autocomplete-verified\" or \"Inferred\", adds a priority tier derived transparently from verification coverage (P1 tools have a verified primary plus at least two verified long-tails), and includes the harvested suggestion strings as per-tool evidence." },
{ t: "p", x: "The strongest evidence-led clusters, in priority order, are: exact-KB compression (autocomplete shows dense demand for \"image compressor to 20kb / 50kb / 100kb / 200kb\" and \"resize image to kb and pixel\"); social media sizes with unit conversions (\"instagram story size in cm / in inches / in pixels\"); country-specific passport and visa photo specifications; modern-format conversion (AVIF pages face far fewer dedicated competitors than WebP ones); and developer utilities (Base64, ICO, favicon) that suit the site's precise, no-upload positioning. The full map, with one row per tool, is delivered in PixKitApp-Keyword-Map.xlsx with a methodology sheet that a future maintainer can follow to refresh the data." },

// ================= 4. Search Intent & Content Quality =================
{ t: "h1", x: "4. Search Intent and Content Quality" },
{ t: "p", x: "Every tool page is built to satisfy the searcher in one visit: a working tool above the fold, a four-part written guide (how it works, how to use it, supported formats and limits, common use cases), a FAQ block, and privacy notes that state plainly that images are processed in the browser and never uploaded. As of this phase every one of the 127 pages carries at least three FAQ entries and at least 401 words of main-content text, with FAQs mirrored as FAQPage structured data alongside WebApplication and BreadcrumbList markup." },
{ t: "p", x: "Intent coverage was stress-tested against the real query patterns harvested from autocomplete. Where the data showed informational sub-intent, answers were added rather than left to chance. The clearest case: users searching social-media sizes ask in physical units (\"instagram story size in cm\"), so all twelve social resizer pages now include a pixel-to-print conversion FAQ computed at the 300 DPI print standard, and the passport pages answer requirement questions (acceptable selfie sources, millimetre-to-pixel conversions, home printing) in plain language. These are answers only a functioning tool page can give credibly, which is exactly the advantage this site has." },
{ t: "table", title: "Table 2: Content-quality issues found by audit and their resolution", headers: ["Issue (measured)", "Action taken", "Result (re-measured)"], widths: [34, 33, 33], rows: [
  ["Primary-keyword density above 3 percent on 32 pages (worst 6.93 percent), caused by tool-name repetition in generated FAQ answers",
   "FAQ generator rewritten: answers are now name-free, questions carry the name at most once; variant pools enlarged and staggered",
   "All 127 pages at or below 3 percent density; copy reads naturally"],
  ["Near-identical boilerplate shared across the 12 social resizer pages (worst pair: 70 shared 8-word sequences)",
   "Four paragraph templates per page now rotate through three factually equivalent variants (about text, size, unit, fit and batch answers)",
   "Worst pair reduced to 28 shared sequences, within audit threshold"],
  ["30 pages had fewer than 3 FAQs; 15 answers under 80 characters",
   "Hand-written upgrade layer added for 24 tools (privacy, batch, quality, unit and print questions), merged without duplicating existing questions",
   "494 FAQs total, minimum 3 per tool, zero duplicate questions per page"],
]},
{ t: "p", x: "Two structural safeguards were added so quality does not regress silently. The audit's duplication check now measures paragraph-level 8-word sequence overlap between every pair of tool pages after excluding navigation, footer and related-tool card text, and the keyword-density check computes primary-keyword density over main-content text; both are part of the reusable audit script, so future content changes can be re-checked in one command. Keyword stuffing was deliberately avoided rather than corrected after the fact: no hidden text, no unnatural repetition, and no exact-match anchor stuffing in the internal links added this phase." },

// ================= 5. Competitors =================
{ t: "h1", x: "5. Competitor Analysis" },
{ t: "p", x: "A competitor scan (web search, 14 October 2026) confirmed that the image-tool SERPs are led by a stable set of incumbents, with a long tail of niche utilities ranking for specific intents. The practical takeaway is not to fight the head terms directly but to occupy the specific, well-served-poorly corners: exact file-size targets, unit conversions, country-specific photo standards, modern formats, and privacy-sensitive batch work. Table 3 summarizes the most relevant competitors and the realistic opening for PixKitApp in each case." },
{ t: "table", title: "Table 3: Competitive landscape for image-tool queries (qualitative, from the 14 October 2026 scan)", headers: ["Competitor", "Focus and strength", "Where PixKitApp can realistically compete"], widths: [22, 39, 39], rows: [
  ["iLoveIMG", "Broadest free tool set, strong brand, batch features", "Privacy positioning (zero uploads), dedicated per-size KB pages, cleaner tool pages without aggressive ad density"],
  ["TinyPNG", "Strong brand in compression; simple one-purpose UX", "Format breadth (WebP/AVIF/BMP/ICO), exact-size targets, passport and social resizers that TinyPNG does not offer"],
  ["Adobe Express / Canva", "Design suites with resizers; huge authority", "Speed and focus: one-task pages with no signup, no watermark and no design-suite overhead"],
  ["Pi7 / imresizer / pdfpax", "Rank for exact-KB queries (20-50 KB form photos)", "These are exactly PixKitApp's dedicated 50/100/200/500 KB pages; win on trust, print-sheet extras and FAQ depth"],
  ["imagy.app / simpleimageresizer", "Mid-size tool aggregators", "Match their breadth (127 tools) with stronger internal linking and per-page FAQ coverage"],
  ["Zamzar / Convertio", "General file converters with format breadth", "Image-only speed, no-upload privacy, batch ZIP output; avoid competing on exotic non-image formats"],
  ["Photopea / Squoosh", "Editor and codec showcase with expert credibility", "Simplicity gap: guided one-click tools with sensible defaults rather than expert interfaces"],
  ["123PassportPhoto / iVisa-style sites", "Country photo standards, some paid flows", "Free, no-upload crop with official millimetre presets plus home print sheets; keep specs current"],
]},
{ t: "p", x: "Original-content opportunities follow directly from the site's architecture. The per-size KB pages and the unit-conversion FAQs are content competitors largely do not have as dedicated pages. The privacy story is verifiable (zero uploads were confirmed during earlier testing with network capture), which supports credible copy competitors with upload-based pipelines cannot match. Finally, the 127-page structure means every niche query variant can have a genuine, purpose-built page; the risk to manage is keeping those pages distinct, which the duplication audit now guards." },

// ================= 6. Internal linking =================
{ t: "h1", x: "6. Internal Linking Architecture" },
{ t: "p", x: "The site's link structure was audited end to end and then strengthened in three places, all implemented as code changes and verified on the production build. The hub-and-spoke model is unchanged: the homepage links to all 14 category pages and to popular tools; every category page lists all of its tools and cross-links the other 13 categories; every tool page carries breadcrumbs (Home, category, tool) mirrored as BreadcrumbList structured data, a guide, FAQs and a related-tools block." },
{ t: "p", x: "First, the related-tools block on each tool page previously drew only from the same category, which left small categories (such as Metadata with three tools) under-linked. It now tops up to six cards using keyword-affinity scoring across categories, so pages like the 16:9 cropper link to the YouTube thumbnail resizer and white-background removal links to the transparency utilities. Second, the site footer previously listed six of the fourteen categories; it now lists all of them, giving every category page a sitewide entry point at consistent crawl depth. Third, the FAQ upgrade layer naturally increased contextual cross-references between related tools (for example, the metadata-removal pages now explain when to prefer the GPS-only variant, and passport pages point to the print-sheet tool)." },
{ t: "p", x: "Verification was mechanical rather than impressionistic: the audit crawler extracted every unique internal link from all 147 pages, requested each of the 147 targets, and found zero broken links and zero orphan pages (every URL is reachable from at least one other page). Each tool page carries at least eight crawlable internal links, and the 68-point regression suite confirms the sitemap, category and tool discovery paths remain intact." },

// ================= 7. Technical SEO audit =================
{ t: "h1", x: "7. Technical SEO Audit Results" },
{ t: "p", x: "A 17-point audit ran against the production build, fetching all 147 sitemap URLs and every unique internal link they reference. All 17 checks passed. The checks and their outcomes are listed in Table 4 so the owner can reproduce or extend them; the audit script is part of the repository (scripts/seo-audit.py) and can be re-run against any deployment before and after go-live." },
{ t: "table", title: "Table 4: Technical audit checklist (production build, 14 October 2026)", headers: ["Check", "Result"], widths: [64, 36], rows: [
  ["sitemap.xml valid, 147 URLs, lowercase, no duplicates or fragments", "Pass"],
  ["robots.txt allows crawling and references the sitemap", "Pass"],
  ["All 147 sitemap URLs return HTTP 200", "Pass"],
  ["Page titles unique across all 147 pages", "Pass"],
  ["Meta descriptions unique across all 147 pages", "Pass"],
  ["Self-referencing canonical on every page", "Pass"],
  ["No noindex directives anywhere", "Pass"],
  ["Exactly one H1 per page", "Pass"],
  ["All 147 unique internal hrefs resolve (zero broken links)", "Pass"],
  ["No orphan pages (every URL linked from at least one other page)", "Pass"],
  ["Trailing-slash variant redirects to the canonical URL", "Pass"],
  ["Uppercase slug returns 404 (clean, lowercase-only URLs)", "Pass"],
  ["Tool pages carry substantial main content (minimum 401 words)", "Pass"],
  ["No keyword stuffing (primary-keyword density at or below 3 percent)", "Pass"],
  ["No heavy duplicate content between any two tool pages", "Pass"],
  ["Structured data present: WebApplication, BreadcrumbList, FAQPage", "Pass"],
  ["Static prerendering: full content present without client-side JavaScript", "Pass"],
]},
{ t: "p", x: "Redirect behavior deserves one note of honesty: within the application, trailing-slash requests redirect correctly and unknown URLs return a designed 404 page, but server-level concerns such as forcing HTTPS, apex-to-www selection and HSTS belong to the hosting layer. On Vercel these are automatic once the domain is connected; the checklist in Section 11 includes verifying them from the live URL after deployment, since they cannot be fully tested on a local build." },

// ================= 8. Performance =================
{ t: "h1", x: "8. Performance and Core Web Vitals" },
{ t: "p", x: "Performance was measured, not asserted. Server response times on the production build were 2 to 8 milliseconds time-to-first-byte across the homepage, tool pages, category pages and the tools index, with full HTML payloads of 79 to 95 kilobytes for tool and category pages and 238 kilobytes for the homepage, which intentionally contains the complete tool index for discoverability. First-load JavaScript for a tool page totals 732 kilobytes uncompressed (226 kilobytes gzip); tool workspaces are code-split and load on demand, and the search dialog runs on a lightweight generated index rather than the full registry." },
{ t: "table", title: "Table 5: Lighthouse 12, mobile emulation (production build, local server)", headers: ["Metric", "Tool page (/image-compressor)", "Homepage (/)"], widths: [40, 31, 29], rows: [
  ["Performance score", "95", "88"],
  ["SEO category score", "100", "100"],
  ["Accessibility / Best Practices", "96 / 100", "not measured this run"],
  ["First Contentful Paint", "1.1 s", "1.2 s"],
  ["Largest Contentful Paint", "2.8 s", "2.9 s"],
  ["Total Blocking Time", "110 ms", "320 ms"],
  ["Cumulative Layout Shift", "0", "0"],
  ["Speed Index", "1.1 s", "1.2 s"],
]},
{ t: "p", x: "These are lab numbers under mobile throttling against a local server, so they should be read carefully: real-world field data will differ, usually in the site's favor once served from a CDN edge with Brotli compression. A Cumulative Layout Shift of exactly 0 on both pages is the most important result, because the AdSense placeholders reserve their space by design and the layout does not jump when ads activate. Largest Contentful Paint of 2.8 to 2.9 seconds sits just above Google's 2.5-second \"good\" threshold under throttled lab conditions, and homepage Total Blocking Time of 320 ms is moderate; both are acceptable for launch but worth improving if real-user data confirms them. The honest path is to run PageSpeed Insights on the live URL after deployment (a manual step in the checklist) and treat its field data, once enough traffic exists, as the source of truth for further optimization." },

// ================= 9. Backlinks =================
{ t: "h1", x: "9. Backlink Strategy (White-Hat Only)" },
{ t: "p", x: "The site needs links it can earn, not buy. The recommended tactics are limited to ways of creating genuine value and making it discoverable; none involve link exchanges, paid links, guest-post networks, automated directory submission or comment spam, all of which risk penalties and are excluded from this plan. The common thread is to lead with the site's two defensible differentiators: tools that never upload images, and precise, spec-driven pages (exact KB targets, official photo sizes) that answer niche questions better than anything currently ranking." },
{ t: "table", title: "Table 6: Recommended link-earning tactics, in rough priority order", headers: ["Tactic", "How it earns links", "Effort"], widths: [26, 58, 16], rows: [
  ["Free-tool usage in communities", "Answer real questions (Reddit, Stack Exchange, webmaster and photography forums) where a specific tool genuinely solves the problem; disclose affiliation and participate beyond self-promotion", "Ongoing, low"],
  ["Original small studies", "Publish data-led posts (for example, real compression ratios across formats at equal visual quality, or WebP/AVIF savings measured with the site's own tools); such posts attract editorial citations", "Medium per study"],
  ["Developer-friendly utilities", "Base64, ICO, favicon and SVG tools are natural citations for tutorials and documentation; keep technical answers precise so authors link the tool rather than re-explain it", "Low, passive"],
  ["Launch and directory listings", "Launch once on Product Hunt, AlternativeTo and reputable free-tool lists; legitimate discovery channels when the listing is honest", "One-off, low"],
  ["Open-source technique write-ups", "Publish the client-side image techniques (multi-step resampling, palette quantization) as technical articles or snippet libraries; developers link working code", "Medium"],
  ["Newsletter and creator outreach", "Offer productivity and creator newsletters a genuinely useful free resource for their readers; personalize, keep volumes low, accept most will decline", "Ongoing, low"],
]},
{ t: "p", x: "Two disciplines keep this safe. Anchor text should stay natural (brand names, tool names, plain URLs) rather than exact-match keyword strings at scale. And pace should follow the site's real growth: ten links earned in the first months from real communities are worth more than a hundred directory entries, and search engines are explicit that schemes intended to manufacture authority carry ranking penalties. If a link opportunity requires payment, reciprocal linking or bulk placement, it is outside this strategy by definition." },

// ================= 10. GSC =================
{ t: "h1", x: "10. Google Search Console Setup and Monitoring" },
{ t: "p", x: "Google Search Console (GSC) is the primary feedback loop after launch, and every step in this section is free. The steps below assume the site is deployed at pixkitapp.com on its final host, since verification and sitemap submission must happen against the production domain." },
{ t: "numbered", ref: "gsc-steps", items: [
  "Verify the property: open search.google.com/search-console, add the domain pixkitapp.com as a Domain property, and verify via a DNS TXT record at the registrar (or verify a URL-prefix property with the HTML-file or meta-tag method if DNS access is limited). Domain verification covers http/https and www/non-www variants at once.",
  "Submit the sitemap: in the Sitemaps report, enter sitemap.xml and submit. The sitemap is generated by the site at /sitemap.xml and currently lists all 147 URLs; re-submit after adding tools.",
  "Confirm coverage: use the Pages (Indexing) report to watch discovered, crawled and indexed counts grow. A new domain typically takes days to weeks for first indexing; treat weeks, not days, as normal for the full set.",
  "Inspect key URLs: run URL Inspection on the homepage, one category page and several tool pages. Request indexing for the homepage and a handful of priority tools to nudge first discovery; do not bulk-request all 127.",
  "Monitor queries: once traffic begins, the Performance, Search results report shows queries, impressions, click-through rate and average position per page. Feed real impression data back into the keyword map; it outranks any third-party estimate and often reveals size targets or phrasings to fold into FAQs.",
  "Watch technical problems: Core Web Vitals (field data once available), mobile usability, page-indexing errors and security or manual actions are all reported directly. Investigate anything marked Failed or Needs improvement.",
  "Optional: connect the property to Bing Webmaster Tools as well; it imports GSC data and adds its own index at no cost.",
]},
{ t: "p", x: "A realistic monitoring cadence is weekly during the first two months (indexing progress, coverage errors, first queries) and monthly afterwards (query trends, click-through opportunities, Core Web Vitals field data). Impressions almost always arrive before clicks; improving titles and descriptions for pages with impressions but low click-through is the highest-leverage routine after launch." },

// ================= 11. Checklist =================
{ t: "h1", x: "11. SEO Checklist: Completed, Outstanding and Manual Actions" },
{ t: "p", x: "The checklist below is the engagement's balance sheet. Items are marked complete only where they were implemented and verified in this codebase; outstanding items are real, and manual items require account access or the live domain, which no local build can substitute for." },
{ t: "table", title: "Table 7: Completed and verified in this phase", headers: ["Item", "Status"], widths: [78, 22], rows: [
  ["Keyword map for all 127 tools with verified-vs-inferred labels and harvested query evidence", "Complete"],
  ["Search-intent coverage: working tool plus instructions plus FAQs on every page (494 FAQs, minimum 3 per page)", "Complete"],
  ["Content quality: keyword density at or below 3 percent; duplication audit passing; no filler patterns", "Complete"],
  ["Internal linking: cross-category related tools, full category footer, zero broken links, zero orphans", "Complete"],
  ["Technical audit 17 of 17 (titles, canonicals, sitemap, robots, H1, 404s, redirects, noindex, structured data)", "Complete"],
  ["Performance measured: Lighthouse 95/88 (tool page/homepage), CLS 0, TTFB 2-8 ms, first-load JS 226 KB gzip", "Complete"],
  ["Production build clean: 152 static pages, type-check and lint clean, 68 of 68 regression checks pass", "Complete"],
  ["Deliverables produced: PixKitApp-Keyword-Map.xlsx and this report", "Complete"],
]},
{ t: "table", title: "Table 8: Outstanding items that are part of normal launch work", headers: ["Item", "Owner / when"], widths: [72, 28], rows: [
  ["Run PageSpeed Insights on the live URL after deployment and record field metrics", "Owner, at launch"],
  ["Re-run scripts/seo-audit.py against the live domain (not only the local build)", "Owner, at launch"],
  ["Add measured search volumes to the keyword map once Keyword Planner or GSC data exists", "Owner, 4-8 weeks post-launch"],
  ["Refresh passport/visa specs and social sizes when platforms change their standards", "Owner, quarterly"],
  ["Add new size-target pages only if GSC impressions show demand (for example 20 KB)", "Owner, data-driven"],
]},
{ t: "table", title: "Table 9: Manual actions requiring accounts or the live domain", headers: ["Action", "Notes"], widths: [40, 60], rows: [
  ["Connect pixkitapp.com on the host (Vercel) and confirm HTTPS", "Certificates and apex/www redirects are automatic once connected; verify from the live URL"],
  ["Verify Google Search Console and submit sitemap.xml", "Section 10, step by step"],
  ["Provision the hello@pixkitapp.com mailbox", "Referenced by the contact page, privacy policy and terms"],
  ["AdSense application and environment variables", "Ad slots are built and space-reserving; set NEXT_PUBLIC_ADSENSE_* variables after approval; approval itself is Google's decision"],
  ["Backlink outreach per Section 9", "Human outreach only; no paid or automated links"],
  ["Submit to Bing Webmaster Tools", "Optional but recommended; imports GSC data"],
]},

// ================= 12. Disclaimers =================
{ t: "h1", x: "12. Expectations, Limitations and Disclaimers" },
{ t: "p", x: "This report makes no guarantees of rankings, indexing, traffic, revenue or AdSense approval, and none of its recommendations should be read as such a promise. Search indexing of a new domain takes an unpredictable amount of time; competitive positions change; and search engines weigh hundreds of signals that no outside party can control or fully observe. What the site controls is the quality of its pages, the honesty of its content and the correctness of its technical plumbing; all three are in measurably good shape as documented above." },
{ t: "p", x: "The measurement boundaries stated in Section 2 apply throughout: keyword evidence reflects Google Autocomplete on 14 October 2026 and will drift; performance numbers are lab measurements under throttling on a local server, not field data; competition notes are qualitative. Where this report says something is verified, it names the method; where nothing was measured, it says so. The most useful next data source will be Search Console itself, and the keyword map is structured to absorb that data as soon as it exists." },
{ t: "p", x: "Sustainable SEO for this site now comes down to rhythm rather than projects: keep the tools genuinely useful, add pages only when real demand appears in the query data, refresh specification content when platforms or governments change their standards, and earn links by being citable. The audits, generators and checklists left in the repository exist so that rhythm can be maintained without guesswork." },
];
