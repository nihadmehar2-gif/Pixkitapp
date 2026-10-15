/** SEO content: Resizing (11) + Cropping (8) tools. */

import { seo, ToolSeo } from "../types";

export const RESIZING_SEO: Record<string, ToolSeo> = {
  "image-resizer": seo(
    "Free Image Resizer – Exact W×H Online",
    "Resize images to exact width and height online free. Lock aspect ratio, choose output format, batch up to 10 photos — private, no upload.",
    "image resizer",
    "The resizer computes your target dimensions and scales the image with multi-step downsampling — repeatedly halving before the final pass — which keeps edges noticeably cleaner than a single crude scale. With aspect lock on, changing one side updates the other automatically so nothing stretches.",
    "Drop up to 10 images, type a width and height (or set one with the aspect lock on), choose JPG, PNG or WebP output with a quality level, then process. Results show new dimensions per file; download them one by one or zipped together.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Upscaling beyond the original size is possible but adds softness — for enlargements use the dedicated Enlarge Image tool with its sharpening option.",
    "Everyday sizing for blog content widths, marketplace image rules, profile photos and email attachments. It's also the quickest way to normalize a mixed batch of camera and phone photos to one consistent dimension."
  ),
  "resize-image-by-percentage": seo(
    "Resize Image by Percentage – 10%–400%",
    "Scale images to any percentage of original size, from 10% to 400%. Quick proportional resizing with quality control — free, instant, in-browser.",
    "resize image by percentage",
    "Instead of pixel math, you pick a percentage and the tool does the arithmetic: 50% quarters the total pixel count and usually cuts file size by 75% or more. Internally it downsamples in steps for clean results, and quality/format controls handle the encoding side.",
    "Add up to 10 images, drag the percentage slider — under 100 shrinks, over 100 enlarges — choose an output format and quality, then process. Every result shows its new pixel dimensions so you always know exactly what changed.",
    "Accepts .jpg, .png and .webp up to 30MB per file, 10 per run. Percentages above 100 stretch pixels rather than inventing detail; keep enlargements modest or use the Enlarge Image tool for better upscaling.",
    "The fast path when exact pixels don't matter: making a photo 'about half size' for a slide, trimming camera files for chat, or shrinking scans before OCR. Batch mode handles whole folders' worth of consistent scaling."
  ),
  "resize-image-to-width": seo(
    "Resize Image to Fixed Width – Auto Height",
    "Set an exact width and get the height calculated automatically. Built-in presets for 640, 800, 1200 and 1920px — free browser-based resizer.",
    "resize image to width",
    "You supply one number — the width — and the tool derives the height from the image's aspect ratio, so proportions can never distort. The preset dropdown covers the widths content systems actually ask for: 640 for forums, 800 for email, 1200 for blog columns, 1920 for full-bleed heroes.",
    "Drop up to 10 images, pick a preset or type a custom width, choose output format and quality, then process. Each result reports its final dimensions; download individually or grab the whole batch as a ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Widths larger than the original upscale the image (with softening); for serious enlargements, the Enlarge Image tool with sharpening is the better route.",
    "Developers sizing images to container widths, writers hitting CMS 'max width' rules, and marketplace sellers matching listing specs all live here. It's the tool when the requirement reads 'must be N pixels wide'."
  ),
  "resize-image-to-height": seo(
    "Resize Image to Fixed Height – Auto Width",
    "Set an exact height and the width adjusts automatically to keep proportions. Great for story frames, banners and profile covers — free, private, instant.",
    "resize image to height",
    "This is the height-first sibling of the width resizer: you fix the vertical dimension, and the tool computes the matching width from the original aspect ratio. Multi-step resampling keeps the downscale clean, and optional format/quality settings control the output encoding.",
    "Add up to 10 images, enter your target height in pixels, choose JPG, PNG or WebP with a quality level, then process. Results display final dimensions per file; save them individually or as one ZIP download.",
    "Accepts .jpg, .png and .webp up to 30MB per file, 10 per batch. If your source is shorter than the target height, the tool will upscale (with mild softness) — cropping to the target instead may look better in those cases.",
    "Typical jobs: 1080px-tall story frames, 720px video thumbnails, banner strips with fixed vertical space, and UI mockups matching a design spec. Vertical-first layouts like phone wallpapers and cover images are its natural territory."
  ),
  "resize-image-to-dimensions": seo(
    "Resize to Exact Dimensions (W×H) – Fit Modes",
    "Force images to exact pixel dimensions with stretch, cover-crop or contain-pad fit modes. Total control over every output pixel — free and private.",
    "resize to exact dimensions",
    "When the output must be exactly W×H, aspect ratios have to be reconciled somehow — that's what the fit modes are for. Cover scales up and center-crops the overflow; contain fits everything inside and pads the remainder with your chosen background color; stretch ignores ratio entirely and fills the frame.",
    "Drop up to 10 images, enter width and height, pick a fit mode (and pad color for contain), choose an output format, then process. The preview shows precisely how each image lands in the frame before you download.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. PNG output preserves the padding as transparency if you pick a transparent-friendly workflow; JPEG fills padded areas with the solid color you selected.",
    "The tool for rigid specs: app store screenshots, ad placements with fixed slots, thumbnail grids, print templates and CMS featured-image fields that demand exact dimensions regardless of source shape."
  ),
  "resize-image-to-kb": seo(
    "Resize Image to a Target KB – Dual Search",
    "Resize and compress until your image hits an exact KB target. Smart search over dimensions and quality finds the best possible fit — free, no upload.",
    "resize image to kb",
    "This tool outsmarts simple compression by searching two dials at once: it progressively trims the longest edge (up to your max-dimension cap) and re-encodes at descending quality until the file lands at or under your KB target. The result keeps as many pixels as the size budget permits.",
    "Drop up to 10 images, type the target size in kilobytes, optionally cap the max dimension so the search prefers scaling, choose JPG or WebP, and run. Each result confirms the achieved size — download or re-run with a different cap.",
    "Accepts .jpg, .png and .webp up to 30MB each; output is JPG or WebP. Very small targets (under ~30KB) eventually cost real resolution — that's physics, not the tool. Setting a sensible max dimension yields visibly better results.",
    "When a portal says 'maximum 150KB' and you also care how the photo looks, this beats a plain compressor. Common at university admission portals, tender submissions, marketplace listings and anywhere both size and dignity matter."
  ),
  "resize-png-image": seo(
    "Resize PNG Images – Keep Transparency",
    "Resize PNG files online while transparency and crisp edges survive. Built for logos, screenshots and UI graphics — free, batch up to 10.",
    "resize png",
    "The tool resamples your PNG with stepped downsampling and re-encodes it losslessly, so every semi-transparent pixel survives the journey. Edges stay sharp because PNG's lossless encoding doesn't add the fuzzy halo a JPEG re-save would around text and borders.",
    "Add up to 10 .png files, enter a target width (height follows automatically with aspect lock on), choose whether to scale up or down only, then process. Results preview on a checkerboard so you can confirm transparency held.",
    "Input: .png only, up to 30MB each; output is always PNG, preserving alpha. For photographic PNGs, consider JPG or WebP output via the universal converter — photos shrink far more in those formats.",
    "Standard work for logos going into decks, screenshots resized for documentation, app icons between density buckets, and Discord/OBS overlay assets. Anywhere transparency is the point, this resizer keeps it."
  ),
  "resize-jpg-image": seo(
    "Resize JPG Images – Quality Control Included",
    "Resize JPG photos online with smart scaling and a quality slider. Fast, free, batch-friendly — up to 10 photos processed entirely in your browser.",
    "resize jpg",
    "Your JPG is decoded, scaled with multi-step resampling (cleaner than one big downscale), and re-encoded with a quality slider under your control. Because resizing and encoding happen in one pass, you avoid the double-generation softening that comes from resizing in one app and compressing in another.",
    "Drop up to 10 .jpg files, set the target width with aspect lock handling the height, adjust quality if needed, then process. Results report new dimensions and sizes; download separately or as a ZIP.",
    "Accepts .jpg and .jpeg up to 30MB per file, 10 per batch; output is JPEG. Resizing doesn't remove EXIF by default unless the compression option says so — check the metadata tools if privacy of GPS data matters.",
    "The everyday pick for camera photos heading to blogs, marketplaces, email and family chats. Batch mode makes quick work of a whole shoot that needs to be 'half size and under 200KB each'."
  ),
  "resize-webp-image": seo(
    "Resize WebP Images – Modern Format Control",
    "Resize WebP images with a quality slider while keeping modern-format efficiency. Hit target dimensions without losing WebP's size advantage.",
    "resize webp",
    "The tool decodes WebP through the browser's native codec, scales it with stepped resampling, and re-encodes as WebP at your chosen quality. Staying inside the same modern codec means the file keeps most of its size advantage over JPG even after the resize.",
    "Add up to 10 .webp files, set the target width (aspect lock keeps proportions), pick a quality level — 80+ is usually visually identical — and process. Results show new dimensions and byte sizes before you download.",
    "Input: .webp only (animated files use the first frame), 30MB max each, 10 per batch; output is .webp. Each pass is a new lossy generation, so archive originals if you expect to resize repeatedly.",
    "Web developers adjusting assets inside WebP-first pipelines, designers iterating on page mockups, and anyone whose CMS exports WebP but whose layout needs it smaller. Pairs naturally with the web optimizer for a one-two publish step."
  ),
  "enlarge-image": seo(
    "Enlarge Image 2x–4x – Smart Upscale",
    "Enlarge images up to 4x with multi-step upscaling and optional sharpening. Noticeably better than naive stretching — free, private, in-browser.",
    "enlarge image",
    "Instead of stretching in one jump, the tool interpolates in repeated doubling steps, which preserves smoother gradients and straighter edges, then applies an unsharp-mask convolution to restore perceived crispness. It can't invent detail that was never captured — but it gets far closer to clean than a naive scale.",
    "Drop one image, choose 2x, 3x or 4x, toggle sharpening on (recommended for screenshots and photos alike), pick a quality level, and process. Compare the preview against the original and adjust before downloading.",
    "Accepts .jpg, .png and .webp up to 30MB; single-image runs. 4x on a low-resolution source will still look soft up close — the bigger the factor, the more the original resolution limits the result.",
    "Rescuing small images for larger placements: a 400px web graphic destined for a slide, old photos being printed at modest sizes, icons needed at 2x for retina displays, and screenshots that must fill a presentation slide."
  ),
  "thumbnail-maker": seo(
    "Thumbnail Maker – Square or Fit, 64–640px",
    "Generate square center-crop or fit-scale thumbnails in sizes from 64 to 640px. Batch process 10 images into clean, consistent thumbnails.",
    "thumbnail maker",
    "The maker renders each image onto a square canvas at your chosen size: cover mode center-crops to fill the square edge to edge, while contain fits the whole image and pads the rest. Downsampling happens in steps for sharp results, and the output format choice lets WebP shrink thumbnails further.",
    "Drop up to 10 images, pick a size from 64 to 640px, choose cover or contain, select WebP, JPEG or PNG output, then process. Every thumbnail previews in the results grid; download the set as a ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. For gallery grids, pick one size and stick to it — mixing sizes breaks uniform rows. Contain mode with JPEG pads with a solid color rather than transparency.",
    "Gallery previews, product listing grids, video libraries, documentation figure thumbs and chat previews — anywhere a grid of uniform tiles matters. WebP output makes page-load budgets happy even at 640px."
  ),

  // Cropping
  "crop-image": seo(
    "Free Online Image Cropper – Interactive Editor",
    "Crop images online with a live interactive editor — drag the frame, lock aspect ratios, rotate and flip, then export JPG, PNG or WebP.",
    "crop image online",
    "This is a hands-on editor, not a preset: your image loads onto an interactive canvas where you drag, move and resize the crop frame freely, with ratio locks (free, 1:1, 16:9 and more) and straightening controls when the horizon needs help. The final pixels come from a clean canvas crop — no re-compression round trips in between.",
    "Drop one image, drag the frame handles until the composition looks right, optionally lock a ratio or nudge rotation in fine steps, then apply. Choose your output format and quality, and download the crop instantly.",
    "Accepts .jpg, .png and .webp up to 30MB; single-image editing. PNG output preserves transparency outside rotated corners; JPEG fills them with your background color. Works with mouse, trackpad and touch alike.",
    "Framing product shots, tightening headshots, trimming slides from screenshots, and any composition call a human should make. When you know the target ratio, the ratio presets (square, 16:9, 4:3, 3:2) get you there in one lock and one drag."
  ),
  "crop-image-to-square": seo(
    "Crop Image to Square (1:1) – One Click",
    "Center-crop any photo to a perfect square instantly, with top, center or bottom anchoring. Batch-crop 10 images for Instagram and avatars.",
    "crop image to square",
    "The tool computes the largest square that fits inside your image, slices it out with no resampling (pixels stay original), and anchors the cut where you choose — center for symmetric shots, top for portraits where faces sit high, bottom for products on shelves. The crop itself is geometric; the saved file is then re-encoded at your chosen quality, and PNG output keeps it mathematically lossless.",
    "Add up to 10 images, pick an anchor point, optionally set output format and quality, and process. Each result previews as a finished square; download files individually or as a ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Very wide panoramas lose a lot of content in a 1:1 cut — for those, the interactive cropper lets you choose the window manually.",
    "Instagram grid posts, avatar uploads, marketplace product squares and app profile photos all demand 1:1. Batch mode squares an entire product catalog in one pass, which is exactly where the one-click design pays off."
  ),
  "crop-image-to-circle": seo(
    "Crop Image to a Circle – Transparent PNG",
    "Cut a perfect circular crop from any photo and download as a transparent PNG. Ideal for profile pictures, badges and round UI avatars.",
    "circle crop",
    "The tool inscribes the largest possible circle in your image, masks everything outside it to transparency, and exports a PNG whose corners are genuinely see-through — not white squares pretending. An anchor control decides whether the circle favors the top, center or upper third of the source.",
    "Drop one image, choose which vertical region the circle should favor, and process. The preview sits on a checkerboard so you can confirm the transparency; download the PNG and it's ready for any round slot.",
    "Accepts .jpg, .png and .webp up to 30MB; single-image runs; output is always PNG with alpha. If the destination (some legacy forums) can't handle transparency, flatten the result onto a background color with the Add Background Color tool.",
    "Profile pictures for apps and communities, team pages, testimonial avatars, badge and sticker design, and round 'chat bubble' artwork. Designers also use it as a quick mask stand-in before fancier cut-outs."
  ),
  "crop-image-16-9": seo(
    "Crop Image to 16:9 Widescreen – One Click",
    "Center-crop photos to 16:9 widescreen for YouTube thumbnails, monitors and video frames. Batch support and anchor control — free, instant.",
    "crop 16:9",
    "The tool finds the largest 16:9 rectangle inside your image and cuts it with zero resampling, so pixels remain exactly as captured. An anchor setting shifts the window toward the top (landscapes and skies), center (balanced default) or bottom (products and text near the floor of the frame).",
    "Add up to 10 images, choose the anchor, optionally set output format and quality, and process. Every crop previews in place; grab files individually or as one ZIP for the batch.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. A 4:3 or square source loses substantial height at 16:9 — if the subject is off-center, switch the anchor or use the interactive cropper for manual framing.",
    "YouTube thumbnails and channel art, presentation slides that fill a screen, video stills, blog headers with a cinematic feel — anywhere a widescreen rectangle is the canvas. Batch mode uniformizes a whole set of stills for a video project."
  ),
  "crop-image-9-16": seo(
    "Crop Image to 9:16 Vertical – Stories & Reels",
    "Crop photos to 9:16 vertical for Instagram Stories, TikTok, Reels and Shorts. Turn landscape shots into full-screen verticals — free, in-browser.",
    "crop 9:16",
    "From any image, the tool extracts the tallest 9:16 rectangle it can, keeping pixels untouched, and anchors the cut toward the top of the frame by default — which usually keeps faces and headlines intact when slicing a landscape photo into a phone-shaped window.",
    "Add up to 10 images, choose top or center anchoring, set output format and quality if you like, then process. Preview each vertical crop and download the batch as files or a single ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Horizontal sources lose their sides at 9:16 — dramatic, but often exactly the point. For gentle conversions, crop to 4:5 first, then let the platform pad.",
    "Story covers, Reels and Shorts thumbnails, TikTok backgrounds, phone wallpapers and app splash art. Social teams batch-convert campaign photography into vertical-ready frames in one pass before scheduling."
  ),
  "crop-image-4-3": seo(
    "Crop Image to 4:3 Classic Ratio – One Click",
    "Crop photos to the classic 4:3 ratio for prints, presentations and photo albums. Anchored cropping with batch support — free and instant.",
    "crop 4:3",
    "A pure pixel crop: the largest 4:3 rectangle is located inside your image and sliced out without resampling, so sharpness is identical to the original. The anchor control nudges the window up or down — handy for portraits where the head must stay in frame after the trim.",
    "Add up to 10 images, pick top, center or bottom anchoring, choose output format and quality, and process. Results preview immediately; download individually or as a batch ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. Panoramic sources give up a lot of width at 4:3; if that hurts, the free-form interactive cropper preserves more of your own framing choice.",
    "Print lab submissions (many standard print sizes are 4:3), PowerPoint and Keynote slide imagery, old-school TV-shaped frames, and family album pages where the classic ratio still rules the layout."
  ),
  "crop-image-3-2": seo(
    "Crop Image to 3:2 Photo Ratio – 35mm Classic",
    "Crop to 3:2 — the 35mm film and DSLR standard — for prints and photography portfolios. Anchored, batch-friendly, entirely in-browser.",
    "crop 3:2",
    "The tool slices out the largest 3:2 rectangle with no resampling — identical math to a 35mm frame — keeping every pixel at original sharpness. Anchors shift the crop toward the top, center or bottom so the horizon or the subject's eyes stay exactly where you want them.",
    "Add up to 10 images, choose an anchor, optionally set format and quality, then process. Each crop previews in place; download individually or grab the batch as a ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Phone photos (usually 4:3) lose height at 3:2; DSLR JPGs often need no crop at all — the tool simply confirms the frame and passes pixels through cleanly.",
    "Standard print sizes (4×6, 8×12), photography portfolio grids, contest submissions with ratio rules, and album layouts. It's the photographer's ratio — this tool applies it to any source in one click."
  ),
  "crop-borders-auto": seo(
    "Auto-Trim Image Borders – Remove White Edges",
    "Automatically detect and remove plain borders around screenshots and scans. Adjustable tolerance and padding — batch up to 10 images, free.",
    "trim image borders",
    "The tool scans inward from each edge, comparing rows and columns of pixels against the border color with a tolerance you control, and stops at the first row that differs — that boundary becomes the new crop. Padding keeps a margin of the original border if you want breathing room around the content.",
    "Drop up to 10 images, adjust tolerance if the border isn't perfectly uniform (scans often aren't), set padding pixels, and process. Each result shows the trimmed frame; download individually or zipped.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Heavily JPEG-compressed borders may need a higher tolerance to register as 'plain'. Content that legitimately touches the edges (full-bleed photos) will not trim — that's by design.",
    "Screenshot clean-up before pasting into docs, scanned photos with ragged scanner borders, slide exports with white margins, and print-ready files that need edge-to-edge content. Batch mode trims a whole folder of screen captures in seconds."
  ),
};
