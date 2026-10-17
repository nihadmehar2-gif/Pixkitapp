#!/usr/bin/env python3
"""PART 3 reusable audit — structured data (JSON-LD), sitemap.xml and URL integrity.

Two parts:

  A. Artifact audit  — scans the prerendered production build
     (.next/server/app/**/*.html) and validates every JSON-LD block:
       * valid JSON syntax, exactly one ld+json <script> per page
       * expected schema inventory per page class (home / tool / category /
         static / 404)
       * FAQPage questions must match VISIBLE page text 1:1 (no hidden FAQ)
       * every Question has acceptedAnswer Answer.text (schema.org-valid)
       * no invented ratings/reviews (aggregateRating / review forbidden)
       * SearchAction target + query-input correctness
       * BreadcrumbList positions sequential, URLs are real routes, last
         item equals the page's own canonical URL
       * Organization.logo path exists in /public
       * prerendered sitemap.xml has NO <lastmod> (dropped: not maintainable)

  B. Live URL integrity — against a running server (default
     http://localhost:3001, production standalone):
       * all 147 sitemap URLs -> HTTP 200
       * sitemap: absolute https://pixkitapp.com URLs, no query/hash/dupes/
         trailing slashes, expected route classes, no lastmod
       * invented paths -> HTTP 404, and 404 HTML has NO rel=canonical
       * trailing-slash policy: /tools/ /about/ /categories/x/ -> 308 -> no-slash
       * canonical host: Host www.pixkitapp.com -> 308 https://pixkitapp.com;
         Host pixkitapp.com + X-Forwarded-Proto: http -> 308 https
         (single hop; preview/localhost hosts never redirected, regression-
         checked: staging host still gets X-Robots-Tag noindex, nofollow)
       * /tools?q=… server-renders matching tool cards (crawlable search)

Usage:
  python3 scripts/structured-data-url-audit.py [base_url]
  base_url "none" skips Part B.

Writes an MD report to download/ and exits 1 on any failure.
"""
import glob
import html as htmllib
import json
import os
import re
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime

APP = ".next/server/app"
SITE = "https://pixkitapp.com"
STATIC_PAGES = {"about", "contact", "privacy", "terms"}
INTERNAL = {"_not-found.html", "_global-error.html"}

fails, passes = [], []


def check(name, cond, detail=""):
    (passes if cond else fails).append(
        f"{name}" + (f" — {detail}" if detail and not cond else "")
    )


class NoRedirect(urllib.request.HTTPRedirectHandler):
    """Disable urllib auto-follow so 3xx status + Location stay observable."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


OPENER = urllib.request.build_opener(NoRedirect)


def get(url, headers=None, timeout=10):
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with OPENER.open(req, timeout=timeout) as r:
            return r.status, dict(r.headers), r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        return 0, {}, str(e)


def extract_jsonld(html):
    """Return (blocks, parse_errors). blocks = list of parsed dicts."""
    raw = re.findall(
        r'<script type="application/ld\+json"[^>]*>(.*?)</script>',
        html, re.S | re.I,
    )
    blocks, errs = [], []
    for i, r in enumerate(raw):
        try:
            blocks.append(json.loads(r))
        except json.JSONDecodeError as e:
            errs.append(f"block {i}: {e}")
    return raw, blocks, errs


def visible_text(html):
    t = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", html, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    t = htmllib.unescape(t)
    return re.sub(r"\s+", " ", t)


def top_nodes(block):
    """Direct @graph children of a block (or the block itself) — for the
    per-page schema inventory. A dict mainEntity (e.g. CollectionPage
    .mainEntity = ItemList on category pages) counts as a top-level node;
    LIST mainEntity (FAQPage.mainEntity = [Question, ...]) does not —
    questions are property values, not standalone page-level entities."""
    if isinstance(block, dict) and isinstance(block.get("@graph"), list):
        yield from block["@graph"]
    elif isinstance(block, dict):
        yield block


def walk(node):
    """Deep-walk: yield (type, obj) for EVERY schema node found anywhere —
    @graph children, potentialAction (SearchAction), mainEntity (Questions,
    ItemList), acceptedAnswer, etc. Used for validation, not inventory."""
    if isinstance(node, dict):
        t = node.get("@type")
        for ty in (t if isinstance(t, list) else ([t] if t else [])):
            yield ty, node
        for v in node.values():
            yield from walk(v)
    elif isinstance(node, list):
        for v in node:
            yield from walk(v)


# ---------------------------------------------------------------------------
# PART A — artifact audit
# ---------------------------------------------------------------------------
def part_a():
    print("== PART A: structured-data artifact audit ==")
    html_files = sorted(glob.glob(f"{APP}/**/*.html", recursive=True))
    check("A. prerendered HTML found (148 = 146 indexable + 404 + global-error)",
          len(html_files) == 148, f"got {len(html_files)}")

    by_class = {"home": [], "tool": [], "category": [], "static": [], "internal": []}
    for f in html_files:
        rel = os.path.relpath(f, APP)
        base = os.path.basename(rel)
        if base in INTERNAL:
            by_class["internal"].append(f)
        elif base == "index.html":
            by_class["home"].append(f)
        elif base in {f"{p}.html" for p in STATIC_PAGES}:
            by_class["static"].append(f)
        elif rel.startswith("categories/"):
            by_class["category"].append(f)
        else:
            by_class["tool"].append(f)

    check("A. class counts home=1 static=4 category=14 tool=127 internal=2",
          len(by_class["home"]) == 1 and len(by_class["static"]) == 4
          and len(by_class["category"]) == 14 and len(by_class["tool"]) == 127
          and len(by_class["internal"]) == 2,
          str({k: len(v) for k, v in by_class.items()}))

    # required ⊆ types ⊆ allowed — catches missing AND duplicate/conflicting nodes
    expect_required = {
        "home": {"WebSite", "Organization", "FAQPage"},
        "tool": {"WebApplication", "BreadcrumbList"},
        "category": {"CollectionPage", "ItemList", "BreadcrumbList"},
        "static": set(),
        "internal": set(),
    }
    expect_allowed = {
        # FAQPage only on pages whose FAQ section is visibly rendered
        "home": {"WebSite", "Organization", "FAQPage"},
        "tool": {"WebApplication", "BreadcrumbList", "FAQPage"},
        "category": {"CollectionPage", "ItemList", "BreadcrumbList"},
        "static": set(),
        "internal": set(),
    }
    label = {"home": "homepage", "tool": "tool page", "category": "category page",
             "static": "static page", "internal": "internal page"}

    bad_syntax, dup_blocks, wrong_schema, no_accepted, hidden_faq, forbidden = [], [], [], [], [], []
    bad_breadcrumb, bad_itemlist, bad_searchaction, bad_org = [], [], [], []
    total_pages = 0

    for cls, files in by_class.items():
        for f in files:
            total_pages += 1
            rel = os.path.relpath(f, APP)
            page_html = open(f, encoding="utf-8", errors="replace").read()
            raw, blocks, errs = extract_jsonld(page_html)
            page_label = f"{label[cls]} {rel}"

            if errs:
                bad_syntax.append(f"{rel}: {errs}")
            if len(raw) > 1:
                dup_blocks.append(f"{rel}: {len(raw)} ld+json scripts")

            # --- inventory: page-level schema nodes -------------------------
            types = set()
            for b in blocks:
                for n in top_nodes(b):
                    t = n.get("@type")
                    types.update(t if isinstance(t, list) else ([t] if t else []))
                    me = n.get("mainEntity")
                    if isinstance(me, dict) and me.get("@type"):
                        types.add(me["@type"])

            # --- validation: deep walk of every nested node -----------------
            for b in blocks:
                for ty, obj in walk(b):
                    # forbidden invented facts anywhere
                    for k in obj.keys():
                        if k in ("aggregateRating", "review", "reviewAspect"):
                            forbidden.append(f"{rel}: {k}")
                    if ty == "SearchAction":
                        tgt = obj.get("target", "")
                        inp = obj.get("query-input", "")
                        if not (isinstance(tgt, str) and
                                tgt == f"{SITE}/tools?q={{search_term_string}}"
                                and inp == "required name=search_term_string"):
                            bad_searchaction.append(f"{rel}: {tgt!r} / {inp!r}")
                    if ty == "Question":
                        aa = obj.get("acceptedAnswer")
                        if not (isinstance(aa, dict) and aa.get("@type") == "Answer"
                                and isinstance(aa.get("text"), str) and aa["text"].strip()):
                            no_accepted.append(rel)
                    if ty == "BreadcrumbList":
                        items = obj.get("itemListElement", [])
                        positions = [it.get("position") for it in items]
                        urls = [it.get("item", "") for it in items]
                        if positions != list(range(1, len(items) + 1)):
                            bad_breadcrumb.append(f"{rel}: positions {positions}")
                        if any(not str(u).startswith(SITE + "/") and u != SITE
                               for u in urls):
                            bad_breadcrumb.append(f"{rel}: bad item URL {urls}")
                        if cls == "tool" and len(items) == 3 and urls and urls[-1]:
                            slug = rel.replace(".html", "")
                            if urls[-1] != f"{SITE}/{slug}":
                                bad_breadcrumb.append(f"{rel}: last item != page URL")
                    if ty == "Organization":
                        logo = obj.get("logo", {})
                        lp = logo.get("url", "") if isinstance(logo, dict) else logo
                        logo_path = lp.replace(SITE, "") if isinstance(lp, str) else ""
                        if not (isinstance(lp, str) and lp.startswith(SITE)
                                and logo_path and os.path.exists("public" + logo_path)):
                            bad_org.append(f"{rel}: logo {lp!r}")

            want_req = expect_required[cls]
            want_allow = expect_allowed[cls]
            if not (want_req <= types and types <= want_allow):
                wrong_schema.append(
                    f"{rel}: got {sorted(t for t in types if t)}, "
                    f"need {sorted(want_req)} ⊆ types ⊆ {sorted(want_allow)}")

            # FAQPage <-> visible text matching (home + tools emit FAQPage)
            if "FAQPage" in types:
                vis = visible_text(page_html)
                qnames = []
                for b in blocks:
                    for ty, obj in walk(b):
                        if ty != "FAQPage":
                            continue
                        for q in obj.get("mainEntity", []):
                            qnames.append(q.get("name", ""))
                            ans = q.get("acceptedAnswer", {})
                            if isinstance(ans, dict) and ans.get("text") not in vis:
                                hidden_faq.append(f"{rel}: answer not visible: {str(ans.get('text'))[:60]!r}")
                            if q.get("name") and q["name"] not in vis:
                                hidden_faq.append(f"{rel}: question not visible: {q['name'][:60]!r}")
                # visible h3 questions should equal JSON-LD questions
                visible_h3 = re.findall(r"<h3[^>]*>(.*?)</h3>", page_html, re.S)
                visible_h3 = [htmllib.unescape(re.sub(r"<[^>]+>", "", h)).strip() for h in visible_h3]
                faq_h3 = [h for h in visible_h3 if h in qnames]
                if len(faq_h3) != len(qnames):
                    hidden_faq.append(f"{rel}: JSON-LD questions={len(qnames)} but only {len(faq_h3)} rendered as h3")

            # category ItemList integrity
            for b in blocks:
                for ty, obj in walk(b):
                    if ty == "ItemList" and obj.get("numberOfItems") is not None:
                        elems = obj.get("itemListElement", [])
                        if obj.get("numberOfItems") != len(elems):
                            bad_itemlist.append(f"{rel}: numberOfItems != element count")
                        bad = [e.get("url") for e in elems
                               if not str(e.get("url", "")).startswith(SITE + "/")]
                        if bad:
                            bad_itemlist.append(f"{rel}: non-absolute item URLs {bad[:3]}")

    check("A. every ld+json block parses as valid JSON", not bad_syntax, "; ".join(bad_syntax[:5]))
    check(f"A. exactly one ld+json script per page ({total_pages} pages scanned)",
          not dup_blocks, "; ".join(dup_blocks[:5]))
    check("A. schema inventory matches page class on all pages (no duplicates/conflicts)",
          not wrong_schema, "; ".join(wrong_schema[:8]))
    check("A. every Question uses acceptedAnswer{@type Answer,text} (no raw 'answer')",
          not no_accepted, "; ".join(no_accepted[:5]))
    check("A. FAQPage content is 1:1 with visible page text", not hidden_faq, "; ".join(hidden_faq[:5]))
    check("A. no aggregateRating / review anywhere (nothing invented)",
          not forbidden, "; ".join(forbidden[:5]))
    check("A. BreadcrumbList positions sequential, item URLs real, last == page URL",
          not bad_breadcrumb, "; ".join(bad_breadcrumb[:5]))
    check("A. category ItemList counts + absolute item URLs", not bad_itemlist, "; ".join(bad_itemlist[:5]))
    check("A. SearchAction target = https://pixkitapp.com/tools?q={search_term_string}",
          not bad_searchaction, "; ".join(bad_searchaction[:3]))
    check("A. Organization.logo file exists in /public", not bad_org, "; ".join(bad_org[:3]))

    # sitemap artifact: no lastmod
    sm_path = os.path.join(APP, "sitemap.xml.body")
    if os.path.exists(sm_path):
        sm = open(sm_path, encoding="utf-8", errors="replace").read()
        check("A. prerendered sitemap contains NO <lastmod> (policy: omitted)",
              "<lastmod>" not in sm, "lastmod present")
        check("A. prerendered sitemap has 147 <url> entries", sm.count("<url>") == 147,
              f"got {sm.count('<url>')}")
    else:
        check("A. prerendered sitemap file found", False, sm_path)

    # 404 artifact: no structured data, no canonical
    nf_path = os.path.join(APP, "_not-found.html")
    if os.path.exists(nf_path):
        nf = open(nf_path, encoding="utf-8", errors="replace").read()
        check("A. 404 page emits no JSON-LD", "<script type=\"application/ld+json\"" not in nf)
        check("A. 404 page does NOT canonicalize (no rel=canonical)", 'rel="canonical"' not in nf)
    else:
        check("A. _not-found.html found", False, nf_path)


# ---------------------------------------------------------------------------
# PART B — live URL integrity
# ---------------------------------------------------------------------------
def part_b(base):
    print(f"== PART B: live URL integrity against {base} ==")

    # sitemap
    st, _, sm = get(f"{base}/sitemap.xml")
    check("B. /sitemap.xml returns 200", st == 200, f"got {st}")
    try:
        root = ET.fromstring(sm)
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        locs = [e.text.strip() for e in root.findall(".//s:loc", ns)]
    except ET.ParseError as e:
        locs = []
        check("B. sitemap.xml parses as valid XML", False, str(e))
    check("B. sitemap has 147 URLs", len(locs) == 147, f"got {len(locs)}")
    check("B. all sitemap URLs absolute https://pixkitapp.com",
          all(u.startswith(SITE) for u in locs))
    check("B. no query/hash variants in sitemap",
          all("?" not in u and "#" not in u for u in locs))
    check("B. no trailing slashes in sitemap (homepage = bare apex)",
          all(u == SITE or not u.endswith("/") for u in locs))
    check("B. no duplicate sitemap URLs", len(set(locs)) == len(locs))
    check("B. sitemap has no <lastmod>", "<lastmod>" not in sm)
    paths = {u[len(SITE):] for u in locs}
    expected_single = {"tools"} | STATIC_PAGES
    tool_paths = [p for p in paths
                  if p and p.count("/") == 1 and not p.startswith("/categories/")
                  and p.lstrip("/") not in expected_single]
    check("B. sitemap classes: 1 home + /tools + 4 static + 14 categories + 127 tools",
          "" in paths and "/tools" in paths
          and sum(1 for p in paths if p.startswith("/categories/")) == 14
          and len(tool_paths) == 127
          and len(paths) == 147,
          f"tools={len(tool_paths)} cats={sum(1 for p in paths if p.startswith('/categories/'))} total={len(paths)}")

    # all sitemap URLs 200
    bad200 = []
    for u in locs:
        s, _, _ = get(u.replace(SITE, base))
        if s != 200:
            bad200.append(f"{u} -> {s}")
    check("B. all 147 sitemap URLs return HTTP 200", not bad200, "; ".join(bad200[:8]))

    # invented paths -> 404, no canonical
    invented = [f"{base}/this-tool-does-not-exist", f"{base}/tools/not-a-tool",
                f"{base}/categories/not-a-cat", f"{base}/a/b/c/missing"]
    bad404 = []
    for u in invented:
        s, _, body = get(u)
        if s != 404:
            bad404.append(f"{u} -> {s}")
        if 'rel="canonical"' in body:
            bad404.append(f"{u} has canonical (forbidden)")
    check("B. invented paths return 404 with NO canonical", not bad404, "; ".join(bad404[:6]))

    # trailing-slash policy (308, single hop)
    slash_bad = []
    for path in ["/tools/", "/about/", "/categories/compression/"]:
        s, hdr, _ = get(base + path)
        loc = hdr.get("Location") or hdr.get("location") or ""
        # Location may be relative ("/tools") or absolute (base + "/tools")
        norm = loc if loc.startswith("/") else loc.replace(base, "")
        if s != 308 or norm.rstrip("/") != path.rstrip("/"):
            slash_bad.append(f"{path} -> {s} {loc}")
    check("B. trailing slashes 308-redirect to no-slash (policy: no trailing slash)",
          not slash_bad, "; ".join(slash_bad[:4]))

    # canonical host redirects (single hop, 308)
    host_bad = []
    s, hdr, _ = get(base + "/tools?q=webp", headers={"Host": "www.pixkitapp.com"})
    loc = hdr.get("Location") or hdr.get("location") or ""
    if s != 308 or loc != "https://pixkitapp.com/tools?q=webp":
        host_bad.append(f"www host: {s} {loc}")
    s, hdr, _ = get(base + "/", headers={"Host": "pixkitapp.com", "X-Forwarded-Proto": "http"})
    loc = hdr.get("Location") or hdr.get("location") or ""
    if s != 308 or loc != "https://pixkitapp.com/":
        host_bad.append(f"http apex: {s} {loc}")
    s, hdr, _ = get(base + "/", headers={"Host": "www.pixkitapp.com", "X-Forwarded-Proto": "http"})
    loc = hdr.get("Location") or hdr.get("location") or ""
    if s != 308 or loc != "https://pixkitapp.com/":
        host_bad.append(f"http www: {s} {loc}")
    check("B. canonical-host 308 redirects (www->apex, http->https, path+query preserved)",
          not host_bad, "; ".join(host_bad[:4]))

    # non-prod hosts: never redirected, still noindexed
    stage_bad = []
    s, hdr, _ = get(base + "/", headers={"Host": "staging.example.com"})
    if s != 200:
        stage_bad.append(f"staging redirected? {s}")
    xr = ""
    for k, v in hdr.items():
        if k.lower() == "x-robots-tag":
            xr = v
    if "noindex" not in xr.lower():
        stage_bad.append(f"X-Robots-Tag={xr!r}")
    check("B. non-prod host NOT redirected + still X-Robots-Tag noindex,nofollow",
          not stage_bad, "; ".join(stage_bad[:4]))

    # SSR search results (crawlable) — SearchAction justification
    s, _, body = get(f"{base}/tools?q=webp")
    has_results = s == 200 and "matching" in body and 'href="/webp-to-jpg"' in body
    check("B. /tools?q=webp server-renders matching tool cards (crawlable search)", has_results,
          f"status={s}")
    s, _, body = get(f"{base}/tools?cat=convert")
    has_cat = s == 200 and "matching" in body
    check("B. /tools?cat=convert server-renders filtered results", has_cat, f"status={s}")
    s, _, body = get(f"{base}/tools")
    check("B. plain /tools still 200 with full listing", s == 200 and 'href="/image-compressor"' in body,
          f"status={s}")

    # robots.txt (production build)
    st, _, rb = get(f"{base}/robots.txt")
    check("B. robots.txt allows crawling + references production sitemap",
          st == 200 and "Allow: /" in rb and f"Sitemap: {SITE}/sitemap.xml" in rb,
          rb[:120])


def main():
    base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3001"
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
    part_a()
    if base.lower() != "none":
        part_b(base)
    else:
        print("== PART B skipped (base_url=none) ==")

    print(f"\nPASS {len(passes)} / FAIL {len(fails)}")
    for f in fails:
        print(f"  FAIL: {f}")
    os.makedirs("download", exist_ok=True)
    report = os.path.join("download",
                          f"structured-data-url-audit-{datetime.now():%Y%m%d-%H%M%S}.md")
    with open(report, "w", encoding="utf-8") as fh:
        fh.write("# PixKitApp — Part 3 structured data / sitemap / URL integrity audit\n\n")
        fh.write(f"Generated: {datetime.now():%Y-%m-%d %H:%M:%S}\n\n")
        fh.write(f"Result: **{len(passes)} PASS / {len(fails)} FAIL**\n\n")
        if fails:
            fh.write("## Failures\n\n")
            for f in fails:
                fh.write(f"- FAIL: {f}\n")
            fh.write("\n")
        fh.write("## Passed checks\n\n")
        for p in passes:
            fh.write(f"- {p}\n")
    print(f"Report: {report}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
