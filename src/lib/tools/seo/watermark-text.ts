/** SEO content: Watermarking (5) + Text (5) + Transparency (7) tools. */

import { seo, ToolSeo } from "../types";

export const WATERMARK_SEO: Record<string, ToolSeo> = {
  "watermark-image": seo(
    "Add Text Watermark to Photos – Free Online",
    "Watermark photos with custom text — position, size, opacity, color, rotation and shadow all under your control. Protect your work free, batch of 10 at a time.",
    "add text watermark to photo",
    "The tool composites your text over each image on a canvas layer — you control the string, size, color, opacity, one of nine anchor positions and a rotation angle, plus an optional drop shadow for legibility on busy backgrounds. Everything renders locally, so unpublished work-in-progress never leaves your machine.",
    "Drop up to 10 images, type your watermark text, set size and opacity (15–30% reads professional), pick a position and rotation, then process. Preview each result and download individually or as a ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Watermarks bake into the pixels permanently — keep clean originals. Dark watermarks need lighter opacity on dark photos; the shadow toggle helps on mixed-tone images.",
    "Signing photography before client delivery, marking proofs and drafts, branding marketplace photos, and tagging educational material. Batch mode stamps a whole shoot consistently in a single pass."
  ),
  "add-logo-watermark": seo(
    "Add Logo Watermark to Images – Brand Photos",
    "Add a logo watermark to photos with position, scale and opacity control. Transparent PNG logos supported — free, private, batch-friendly, up to 10 photos.",
    "add logo watermark",
    "Your logo (ideally a transparent PNG) is composited over each photo at a scale relative to image width, with independent opacity, margin and one of nine position anchors. Because compositing happens per image, the same settings produce consistent branding across a whole batch.",
    "Drop your photos, add the logo file in the watermark section, set scale and opacity (20–35% keeps photos readable), pick a corner with a sensible margin, then process and download.",
    "Accepts .jpg, .png and .webp photos up to 30MB each, 10 per batch; the logo itself loads as a separate file. Transparent PNG logos composite cleanly — opaque logos bring their own background rectangle, so export yours with alpha.",
    "Photographers protecting portfolio shots, stores branding listing photos, agencies watermarking campaign previews, and teachers marking handout imagery. One settings pass brands up to ten photos identically."
  ),
  "tiled-watermark": seo(
    "Tiled Repeating Watermark – Diagonal Protection",
    "Cover images with a diagonal repeating text watermark — the strongest visible protection for previews and proofs. Angle, gap and opacity controls included.",
    "tiled watermark",
    "Instead of one corner mark, your text repeats across the entire image on a rotated grid — diagonal at your chosen angle, spaced by your gap setting, at your opacity. Removal would require rebuilding the whole picture, which is exactly the point for preview and proof images.",
    "Drop up to 10 images, enter the watermark text, set opacity (8–15% stays readable without shouting), adjust spacing and angle, then process. Download results individually or zipped.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Denser tiling (small gaps) protects better but distracts more — proof galleries traditionally sit around 10% opacity. The pattern bakes in permanently.",
    "Protecting stock-preview and proofing galleries, marking confidential documents and internal mockups, watermarking real-estate and product photos against reuse, and stamping draft designs before client review."
  ),
  "date-watermark": seo(
    "Add Date Stamp to Photos – Timestamp Online",
    "Stamp today's date (or any date) on photos — the classic camera timestamp for documentation and records. Color, size and position control, batch of 10.",
    "date stamp photo",
    "The tool composites a date string onto each photo — today's date by default, or any custom date you type — styled with your size, color, opacity and one of nine positions, with an optional drop shadow. It recreates the film-era timestamp for modern documentation needs.",
    "Drop up to 10 images, set or override the date, adjust size and position (bottom corners are conventional), and process. Preview each result, then download individually or as a ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. The stamp is pixels, not metadata — it survives every re-upload, screenshot and crop, which is precisely why documentation workflows prefer it over EXIF dates.",
    "Timestamping worksite progress photos, inspection and field-service records, delivery and condition documentation, insurance claim evidence, and family archive prints where the date is part of the memory."
  ),
  "bulk-watermark": seo(
    "Bulk Watermark Photos – Batch of 10 at Once",
    "Apply one text watermark to a whole batch of photos at once — free and private. Identical settings across all images, then download everything as a ZIP.",
    "bulk watermark photos",
    "The batch pipeline applies identical watermark settings — text, size, opacity, color, position — to every image in one processing run, guaranteeing visual consistency that manual per-photo stamping never achieves. Progress reports as each file finishes; a ZIP collects the whole set.",
    "Drop up to 10 photos, configure the watermark once, and process all of them together. Spot-check a few previews, then download the entire batch as one ZIP archive.",
    "Accepts .jpg, .png and .webp up to 30MB per file, 10 per run. One size setting across differently sized photos reads slightly stronger on smaller images — for mixed dimensions, sort files by size or run two batches.",
    "Event photographers delivering watermarked galleries, marketplaces stamping catalog batches, agencies protecting client preview sets, and anyone with ten photos that need the same signature in the same place."
  ),

  // Text
  "add-text-to-image": seo(
    "Add Text to Image Online – Full Typography",
    "Add text to images with full typography control — font size, color, weight, position and an optional background pill. Free, private, no signup, instant.",
    "add text to image",
    "The tool renders your text on a canvas layer over the image with control over size, color, bold weight, one of nine positions and multi-line input — plus an optional rounded background pill with its own color and opacity, which keeps text readable over busy photos.",
    "Drop one image, type your text (multi-line supported), style it — size, weight, color — choose a position, and enable the background pill if the photo is busy. Process, preview, download.",
    "Accepts .jpg, .png and .webp up to 30MB; single-image editing. Very long text wraps within the canvas; test the preview at full zoom if legibility matters. The pill background composites behind every line.",
    "Labeling product photos with prices, annotating screenshots for documentation and bug reports, creating quick social announcements, adding location or name tags to shared photos, and marking images for review workflows."
  ),
  "add-caption-to-image": seo(
    "Add Caption Bar to Images – Styled Captions",
    "Append a styled caption bar under (or over) your image with automatic text wrapping. Great for galleries, documentation and social posts, batch of 10 at once.",
    "add caption to image",
    "The tool extends your image's canvas with a solid bar — below or above the photo, at your chosen height — and renders your caption inside it with automatic wrapping. The photo itself is untouched; the caption lives in new pixels, so nothing overlays your subject.",
    "Drop up to 10 images, type the caption, set bar height and pick top or bottom placement, choose background and text colors, then process. Results download individually or as a ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Output grows by the bar height; long captions may need a taller bar — increase it and re-run if text clips. One caption applies to the whole batch.",
    "Cataloging photo libraries with consistent captions, creating documentation figures with figure numbers, building educational slides and worksheets, and giving social carousels a uniform captioned footer."
  ),
  "meme-generator": seo(
    "Meme Generator Online – Top & Bottom Text",
    "Create classic memes with bold top and bottom text, uppercase toggle and outline colors. Instant, private, no watermark, no signup — your memes stay yours.",
    "meme generator",
    "The generator renders your text in the classic meme style — heavy weight, centered, with a contrasting stroke — at the top and bottom of the image, with an uppercase toggle for traditional ALL CAPS delivery. Everything runs locally: no account, no watermarks, no upload of your template.",
    "Drop one image, type top and bottom text, adjust font size, toggle uppercase, fine-tune text and stroke colors, then generate. Download your meme the moment it looks right.",
    "Accepts .jpg, .png and .webp up to 30MB; single-image runs. Very long lines may need a smaller font size — the preview shows clipping immediately. Output keeps your chosen format and quality.",
    "Classic image macros for group chats and communities, internal team humor boards, lightweight social content, and teaching materials that need a laugh. Also handy for 'error/expectation' style comparisons."
  ),
  "quote-card-maker": seo(
    "Quote Card Maker – Quote to Image Online",
    "Turn quotes into shareable image cards with elegant serif typography and author attribution. Instagram-ready output — free, private, instant, post-ready.",
    "quote card maker",
    "The tool composites your quote in an elegant serif face over your background image, adds the author attribution beneath, and optionally applies a color overlay between photo and text so long quotes stay readable. Overlay color and opacity are yours to tune.",
    "Drop one background image, type the quote and author, enable the overlay if the photo is detailed, adjust its color and opacity, then render. Download the card and it's ready to post.",
    "Accepts .jpg, .png and .webp up to 30MB; single-image sessions. Quieter backgrounds (soft focus, low contrast) make the strongest cards; the overlay rescues busier ones. Very long quotes may need smaller source text or a taller crop.",
    "Daily quote posts for social media, podcast episode pull-quotes, book and article promotion cards, presentation openers, and memorial or celebration keepsakes that pair words with a meaningful photo."
  ),
  "add-title-to-image": seo(
    "Add Title Banner to Images – Thumbnail Maker",
    "A title banner maker for blog thumbnails and video covers: bold title on a color bar with accent stripe and optional subtitle. Free and completely private.",
    "title banner maker",
    "The tool composites a semi-opaque color bar across the bottom (or top) of your image, renders your title in bold white with an accent stripe alongside, and adds an optional subtitle line. Bar color, opacity, text colors and the accent hue are all adjustable to match brand kits.",
    "Drop up to 10 images, type title and subtitle, pick bar placement, set bar color and opacity plus accent color, then process. Preview each cover and download the batch.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. Bar opacity around 60–75% keeps photo context visible while text stays readable. Titles render on one line — shorter phrasing wins for thumbnails.",
    "Blog post thumbnails, YouTube and course covers, podcast episode art, newsletter headers, and presentation title slides — anywhere a photo needs a headline bolted on, consistently, across a whole content batch."
  ),

  // Transparency
  "remove-white-background": seo(
    "Remove White Background from Image – Smart",
    "Make white backgrounds transparent with smart flood-fill that keeps white details inside your subject. Free transparent PNG output, entirely in-browser.",
    "remove white background",
    "A flood-fill grows inward from the image borders, erasing white and near-white pixels only while they remain connected to the edge — so a white shirt inside your subject survives even though the white backdrop vanishes. Tolerance handles slightly off-white studio backgrounds.",
    "Drop one image, adjust tolerance until the background clears in the checkerboard preview, keep connected-only mode on to protect interior whites, then download the transparent PNG.",
    "Accepts .jpg, .png and .webp up to 30MB; single-image runs; output is PNG with alpha. JPEG noise around edges may leave faint halos — raise tolerance slightly. Shadows under subjects count as background and will clear too.",
    "Prepping product photos for marketplaces and catalogs, cutting logos and illustrations out of white-padded exports, cleaning screenshots for presentations, and making sticker-style cutouts for messaging apps."
  ),
  "make-image-transparent": seo(
    "Make Image Background Transparent – Any Color",
    "Make image backgrounds transparent — remove any solid color, white, black or custom, with tolerance and feathering. Clean PNG cutouts, free, private.",
    "make image transparent",
    "The tool keys out your chosen background color by pixel distance: you pick the exact shade, tolerance decides how similar a pixel must be to disappear, and feathering softens the cut edge so subjects don't look stencil-cut. Any color keys — white, black, green, whatever your backdrop was.",
    "Drop one image, sample or pick the background color, raise tolerance until the backdrop clears in the preview, add feather for smooth edges, then download the transparent PNG.",
    "Accepts .jpg, .png and .webp up to 30MB; single-image sessions; output is PNG with real alpha. Gradient or textured backgrounds key imperfectly — uniform studio backdrops are the sweet spot. Feather of 1–2px suits most cutouts.",
    "Extracting subjects from studio backdrops, making logo variants transparent, preparing overlay assets for video editors, creating cutouts for e-commerce listings, and building transparent sticker packs."
  ),
  "add-white-background": seo(
    "Add White Background to Transparent PNG",
    "Flatten transparent PNGs onto a white background — the requirement of marketplaces like Amazon and many print shops. Batch of 10, free, private and instant.",
    "add white background to png",
    "The tool composites each transparent image over an opaque white canvas: every alpha pixel blends against white, and the output loses its alpha channel entirely. JPEG output makes files smaller; PNG output stays lossless if the destination is picky about formats.",
    "Drop up to 10 transparent PNGs (or WebPs), choose JPEG or PNG output, and process. Each result previews on solid white so you can confirm nothing unexpected was hiding in the transparency.",
    "Accepts .png and .webp inputs up to 30MB each, 10 per batch. Semi-transparent edges (soft shadows, anti-aliasing) blend toward white permanently — preview before downloading if edges carry subtle alpha.",
    "Meeting marketplace image requirements that ban transparency, preparing print-shop files, sending designs to clients whose software shows checkerboards, and converting overlays into presentation-safe images."
  ),
  "add-background-color": seo(
    "Add Background Color to Transparent PNG",
    "Add a background color to PNG files: place transparent images on any solid color — brand tints, pastels, darks. Pick your hex and export instantly.",
    "add background color to png",
    "Your transparent image composites over a solid canvas of any color you choose — brand palette, pastel, deep dark — with output as PNG (keeps nothing transparent) or JPEG (smaller). It's the color-anything sibling of the white-background tool.",
    "Drop up to 10 transparent files, pick your background color with the picker, choose output format, and process. Preview each result against its new backdrop, then download individually or zipped.",
    "Accepts .png and .webp up to 30MB each, 10 per batch. Dark backgrounds reveal pale halos around anti-aliased edges that white hides — preview on your actual target color before committing.",
    "Creating brand-colored social graphics from logo files, making themed avatar backgrounds, matching marketplace or storefront background requirements, and generating consistent-background icon sets from transparent sources."
  ),
  "round-corners-image": seo(
    "Round Image Corners Online – Radius Control",
    "Round the corners of any image with an adjustable radius and transparent outside. Modern UI-ready PNG output — free, private, in-browser, any radius you need.",
    "round image corners",
    "A rounded-rectangle mask composites over your image: pixels outside the radius become genuinely transparent, not white. The slider goes from subtle 8px softening to full pill/circle shapes, and the result is the asset style every modern interface expects.",
    "Drop one image, drag the radius slider while previewing, then download the rounded PNG. Smaller images look best with proportionally smaller radii.",
    "Accepts .jpg, .png and .webp up to 30MB; single-image sessions; output is PNG with alpha so the corners stay transparent on any background. For square sources at max radius you get a circle — same math as the circle crop tool.",
    "Making app icons and UI thumbnails, rounding screenshots for documentation so they match your docs' border radius, prepping avatar frames, and softening product images inside card layouts."
  ),
  "transparent-png-maker": seo(
    "Transparent PNG Maker – Alpha Cleaner Tool",
    "A transparent PNG maker that converts any image to PNG with cleaned-up alpha: harden semi-transparency or preserve soft edges. Free, private, in-browser.",
    "transparent png maker",
    "The tool converts your image to PNG and gives you control over its alpha channel: the threshold slider sets where semi-transparent pixels snap to fully opaque or fully transparent, and binarize mode hardens every in-between value — ideal for cleaning up keys that left mushy edges.",
    "Drop one image, adjust the alpha threshold while watching the checkerboard preview, enable binarize for hard edges or leave it off to preserve soft anti-aliasing, then download.",
    "Accepts .jpg, .png and .webp up to 30MB; single-image runs; output is always PNG (the only mainstream raster format with full alpha besides WebP). JPEG sources carry no alpha, so pair this with a background-removal tool first.",
    "Cleaning up alpha from chroma-key exports, hardening soft selection edges from other editors, preparing sprites that need crisp alpha, and converting any image into a standards-compliant PNG asset."
  ),
  "png-drop-shadow": seo(
    "Add Drop Shadow to PNG – Professional Depth",
    "Give transparent PNGs a professional drop shadow — blur, offset, color and opacity control. Design-ready output, free, private and entirely in-browser.",
    "png drop shadow",
    "The tool derives a shadow from your PNG's alpha silhouette, offsets it by your X/Y values, blurs it by your radius, tints it your color at your opacity, and composites it behind the original on a larger transparent canvas. It's the CSS box-shadow you can actually ship inside an image file.",
    "Drop one transparent PNG, tune blur, offsets, color and opacity while previewing, then download the result — a bigger canvas with your cutout casting a clean shadow.",
    "Accepts .png and .webp up to 30MB; single-image runs; output is PNG with alpha (the shadow itself is semi-transparent). Fully opaque sources produce a rectangular shadow — transparency is what defines the silhouette.",
    "Making product cutouts float above catalog backgrounds, adding depth to sticker and meme exports, preparing e-commerce hero assets, and building design elements that need baked-in shadows for non-CSS destinations."
  ),
};
