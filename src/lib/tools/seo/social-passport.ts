/** SEO content: Social (12) + Passport (7) tools. */

import { seo, ToolSeo } from "../types";

export const SOCIAL_SEO: Record<string, ToolSeo> = {
  "instagram-post-resizer": seo(
    "Instagram Post Resizer – 1080×1080 Square",
    "Resize images to perfect Instagram post size 1080×1080 square. Cover-crop, pad or stretch — free, instant, batch-friendly, nothing uploaded anywhere, ever.",
    "instagram post size",
    "The tool renders your image onto a 1080×1080 canvas using your fit mode: cover center-crops to fill every pixel, contain fits the whole image and pads with your background color, stretch forces the frame regardless of distortion. Output stays JPEG-class compatible with the platform's requirements.",
    "Drop up to 10 images, pick a fit mode (cover for photos, contain for graphics that must not crop), set a pad color if needed, and process. Preview each square, then download the batch.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. Feed it the largest source you have — Instagram downscales anything above 1080px anyway, so starting big only softens the result.",
    "Square feed posts, profile-grid planning, marketplace-style product squares, and campaign sets where every tile must match exactly. Batch mode squares a whole content calendar in one pass."
  ),
  "instagram-story-resizer": seo(
    "Instagram Story Resizer – 1080×1920 Vertical",
    "Resize images to Instagram Story size 1080×1920 vertical. Full-screen stories and Reels covers that fit perfectly — free, private, batch of 10, no account.",
    "instagram story size",
    "Your image lands on a 1080×1920 canvas (the exact 9:16 story frame) via cover, contain or stretch fitting. Cover fills the screen edge-to-edge with a center crop; contain letterboxes the full image over your chosen background — the safe choice when cropping would decapitate the subject.",
    "Drop up to 10 images, choose how each fits the vertical frame, set a pad color for contain mode, and process. Preview every result, then download individually or as a ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Remember the platform's UI overlays roughly 250px at top and bottom — keep critical content in the middle band or accept it may sit under the reply box.",
    "Story backgrounds, Reels cover frames, WhatsApp status images, and any 9:16 placement. Content teams batch-convert campaign photography to story dimensions before scheduling."
  ),
  "instagram-portrait-resizer": seo(
    "Instagram Portrait Resizer – 1080×1350 (4:5)",
    "Resize images to Instagram portrait post size 1080×1350 — the 4:5 ratio that takes maximum feed real estate. Free, instant, batch-friendly and fully private.",
    "instagram portrait size",
    "The tool outputs exactly 1080×1350 pixels — Instagram's largest allowed post footprint, which occupies noticeably more screen than a square in the feed. Fit modes reconcile your source shape: cover crops in, contain pads out, stretch distorts (rarely what you want).",
    "Add up to 10 images, pick cover or contain fitting, choose a pad color if containing, and process. Review each preview at feed scale in your head — then download the batch.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. Square sources crop only their edges at 4:5; wide landscapes lose sides — portrait-oriented sources fit this frame most naturally.",
    "Feed posts that demand attention (4:5 outperforms square for scroll-stopping), lookbook and editorial layouts, and campaign grids mixing squares and portraits where each format needs its own master file."
  ),
  "facebook-cover-resizer": seo(
    "Facebook Cover Resizer – 851×315 Banner",
    "Resize images to Facebook cover size 851×315. Nail the desktop banner crop on the first try — free, private, no upload, batch-friendly, mobile-safe design.",
    "facebook cover size",
    "The tool produces exactly 851×315 pixels — Facebook's desktop cover ratio (roughly 2.7:1). Cover mode center-crops your image into that wide strip; contain pads it over a background color you choose. Either way, what you preview is what the banner shows on desktop.",
    "Drop up to 10 images, pick a fit mode, set a pad color if containing, and process. Check that key content sits within the wide center band before downloading.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. Mobile crops the sides of cover photos — keep logos and faces near the horizontal center so both viewports behave.",
    "Business page covers, event banners, community group headers, and personal profile art. Pairs naturally with the Facebook Profile tool when branding a whole page in one sitting."
  ),
  "facebook-profile-resizer": seo(
    "Facebook Profile Picture Resizer – 720×720",
    "Resize images to Facebook profile picture size 720×720 square for a crisp, correctly framed profile photo. Free, instant, private — batch up to 10 photos.",
    "facebook profile size",
    "The tool fits your photo into exactly 720×720 pixels — comfortably above Facebook's display size, so compression never makes your avatar look soft. Cover fitting center-crops to the square; contain pads; stretch forces it. The circle mask on the platform is applied afterward, so keep subjects centered.",
    "Drop your photo (batch up to 10 for team pages), pick a fit mode and pad color if needed, process, and download the square master.",
    "Accepts .jpg, .png and .webp up to 30MB each. Faces belong near the center — the platform's circular crop trims corners. Feed it the highest-resolution source you have for the crispest small-size rendering.",
    "Personal profiles, business page avatars, team pages where every member's photo gets identical treatment, and event page icons. The 720px master also serves Messenger and comment avatars."
  ),
  "twitter-header-resizer": seo(
    "X (Twitter) Header Resizer – Exact 1500×500",
    "Resize images to X (Twitter) header size 1500×500. Get your banner crop right without trial and error — free, private, instant, cover or contain fitting.",
    "twitter header size",
    "The tool renders your image at exactly 1500×500 — the platform's official header ratio (3:1). That strip is unforgiving: cover mode center-crops, contain letterboxes over your chosen background. Previewing here beats iterating on the platform's own crop screen.",
    "Drop up to 10 images, choose cover or contain, set a pad color for contain, and process. Confirm the safe center band holds your key content, then download.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. The bottom-left overlaps the avatar circle on the profile view — design with the lower-left quadrant as expendable space.",
    "Personal brand headers, company profile art, podcast and newsletter banners, and campaign takeovers. Batch mode prepares headers for multiple accounts or A/B variants in one pass."
  ),
  "x-post-resizer": seo(
    "X (Twitter) Post Resizer – 1200×675 (16:9)",
    "Resize images to X (Twitter) post size 1200×675 — the 16:9 ratio that fills the timeline card perfectly. Free, private, batch of 10, timeline-ready output.",
    "twitter post size",
    "The tool outputs exactly 1200×675 pixels (16:9), the ratio X renders fully expanded in the timeline — anything else gets cropped in the card view. Cover fitting guarantees edge-to-edge fill; contain preserves the whole image over a pad color when cropping isn't acceptable.",
    "Add up to 10 images, pick a fit mode and pad color, process, and download the timeline-ready masters individually or as a ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Wide sources fit natively; square and portrait sources either crop (cover) or show side bars (contain) — choose per image if the batch mixes shapes.",
    "Announcement images, blog share cards, product launches and thread visuals — anywhere the preview crop in the timeline determines whether people tap through."
  ),
  "linkedin-banner-resizer": seo(
    "LinkedIn Banner Resizer – 1584×396 Cover",
    "Resize images to LinkedIn profile banner size 1584×396. Look professional from the first impression — free, private, no upload, cover and contain fitting.",
    "linkedin banner size",
    "The tool renders exactly 1584×396 pixels — LinkedIn's personal profile banner spec (4:1, unusually wide). Cover mode center-crops into the strip; contain letterboxes over your background color. The width means horizontal compositions with breathing room work best.",
    "Drop up to 10 images, pick cover or contain with a pad color, and process. Preview the full strip, then download the master for upload.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. Text near the edges risks the platform's own overlays — keep words toward the middle third and this banner reads cleanly on every device.",
    "Personal profile banners with role and value proposition, consultant and coach branding, speaker backgrounds, and job-search refreshes where a sharp banner quietly upgrades every profile view."
  ),
  "linkedin-post-resizer": seo(
    "LinkedIn Post Resizer – 1200×1200 Square",
    "Resize images to LinkedIn post size 1200×1200 square for clean, professional feeds. Free, instant, batch-friendly — nothing uploaded, everything stays local.",
    "linkedin post size",
    "Your image fits exactly 1200×1200 pixels — the square that renders consistently across LinkedIn's desktop and mobile feeds. Cover center-crops to fill; contain pads; stretch distorts. The generous resolution keeps text overlays and charts crisp after the platform's compression.",
    "Drop up to 10 images, choose a fit mode and pad color, process, then download the batch of square masters.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. Infographics and documents read best as squares with large type — this tool guarantees the geometry while you handle the typography upstream.",
    "Thought-leadership graphics, event announcements, carousel-ready masters, hiring posts and company updates — the everyday image format for professional feeds."
  ),
  "youtube-thumbnail-resizer": seo(
    "YouTube Thumbnail Resizer – 1280×720 Exact",
    "Resize images to YouTube thumbnail size 1280×720 (16:9). Click-worthy thumbnails at exact spec — free, private, batch of 10, with a composition-check preview.",
    "youtube thumbnail size",
    "The tool produces exactly 1280×720 pixels — YouTube's recommended thumbnail resolution at the correct 16:9 ratio. Cover fitting center-crops to fill; contain letterboxes. Thumbnails render tiny in search and suggested feeds, so the preview here doubles as a composition check.",
    "Drop up to 10 images, pick cover or contain plus a pad color, and process. Squint at the preview: if the subject reads at small size, download; if not, try a tighter crop.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Under the 2MB limit YouTube enforces, and well above the 640px minimum. Faces close-up outperform wide shots at thumbnail scale — crop accordingly.",
    "Video thumbnails, Shorts covers, playlist art, and channel-section headers. Batch mode preps a whole series' thumbnails with identical framing rules in one pass."
  ),
  "youtube-banner-resizer": seo(
    "YouTube Banner Resizer – 2048×1152 Channel Art",
    "Resize images to YouTube channel banner size 2048×1152. Channel art that fits TV, desktop and mobile — free, private, instant, with a mobile-safe preview.",
    "youtube banner size",
    "The tool renders exactly 2048×1152 pixels (16:9), the safe upload size whose center band survives cropping across TV, desktop and mobile. Cover mode fills the full canvas with a center crop; contain pads around your image over the background color you pick.",
    "Drop up to 10 images, choose fit mode and pad color, process, and download the master. Keep channel name and tagline inside the central safe area before committing.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. The platform crops aggressively on phones — the middle ~1235×338 region is the only guaranteed-visible zone, so design inward from there.",
    "Channel art refreshes, rebrand launches, series-themed banners, and creator collab pages. Batch mode generates banner variants for multiple channels or seasonal rotations."
  ),
  "pinterest-pin-resizer": seo(
    "Pinterest Pin Resizer – 1000×1500 (2:3)",
    "Resize images to Pinterest pin size 1000×1500 — the 2:3 vertical ratio optimized for saves and clicks. Free, private, batch-friendly and entirely in-browser.",
    "pinterest pin size",
    "The tool fits your image into exactly 1000×1500 pixels — Pinterest's recommended 2:3 pin ratio that dominates smart-feed tiles. Cover center-crops vertical-friendly; contain pads wide sources over your background color. Both keep you inside the platform's ratio guidelines.",
    "Add up to 10 images, pick cover or contain with a pad color, and process. Preview each pin, then download the batch ready for scheduling.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. Square sources crop top and bottom at 2:3; landscape sources pad heavily — portrait photography and tall graphics are the natural fit.",
    "Blog post pins, recipe and DIY cards, product pins for shops, and infographic promos. Batch mode converts a whole seasonal content set to pin geometry before scheduling."
  ),

  // Passport
  "passport-photo-maker": seo(
    "Passport Photo Maker – All Standards Online",
    "Make passport photos online free with official size guides. US, UK, EU, India presets — 35×45mm or 2×2in at 300 DPI. Private, in-browser, ready to print.",
    "passport photo maker",
    "Your photo loads into an interactive editor with an official head-position overlay — chin, crown and eye-line guides — for the size standard you select: 35×45mm (most countries), 2×2in (US), 33×48mm (China) and more. Output renders at 300 DPI so the printed millimeters are exact, and an optional background replacement cleans non-white backdrops.",
    "Drop one photo taken against a plain wall, pick your country's size preset, drag the crop until the guides sit right on the face, choose a background treatment, then download the print-ready image.",
    "Accepts .jpg, .png and .webp up to 30MB; single-photo editing; output at 300 DPI in your chosen format. The tool guides geometry — it cannot verify compliance, so follow the official rules of the document you're applying for.",
    "Passport renewals, visa applications, ID cards, driving licences and student passes — anywhere a specific millimeter photo size with head-position rules applies, without visiting a photo booth."
  ),
  "us-passport-photo": seo(
    "US Passport Photo Maker – 2×2 Inch at 300 DPI",
    "Create US passport photos at the official 2×2 inch size: 600×600px at 300 DPI with head guides. Free, private, in your browser — no photo studio required.",
    "us passport photo",
    "The editor targets the US State Department spec: a 2×2 inch print (600×600 pixels at 300 DPI) with head between 50–69% of frame height. The overlay shows exactly where crown and chin must sit, and the optional background replacement cleans up imperfect home backdrops to plain white.",
    "Drop one photo shot against a plain light wall, drag the crop until the head guides align, pick a white background treatment, and download the 600×600 master for printing or online submission.",
    "Accepts .jpg, .png and .webp up to 30MB; single-photo sessions; output 600×600px at 300 DPI. Glasses, shadows and expressions follow official rules — the tool handles geometry, you handle everything else.",
    "US passport applications and renewals, visa photo requirements that reference the US standard, and Global Entry or other TSA-adjacent submissions that ask for the same 2×2 inch format."
  ),
  "schengen-visa-photo": seo(
    "Schengen Visa Photo Maker – 35×45mm ICAO",
    "Create Schengen visa photos at 35×45mm (413×531px @ 300 DPI) with ICAO head-position guides. Free, private and entirely in-browser — no studio needed.",
    "schengen visa photo",
    "The editor implements the ICAO-aligned 35×45mm European standard — 413×531 pixels at 300 DPI — with guides for the required head height (roughly 70–80% of the frame) and eye line. Background replacement to plain light gray or white covers the common submission requirement.",
    "Drop one photo taken against a plain background, align the face with the ICAO guides, pick the background treatment, and download the 413×531 print-ready result.",
    "Accepts .jpg, .png and .webp up to 30MB; single-photo editing; output 413×531px at 300 DPI. Individual consulates occasionally add requirements (recency, expression) — geometry is handled here; the rest is on the checklist.",
    "Schengen tourist and business visas, national European residence permits, and any application citing the 35×45mm standard — the most common photo format in the world after the US 2×2."
  ),
  "china-visa-photo": seo(
    "China Visa Photo Maker – 33×48mm Online",
    "Create China visa photos at 33×48mm (390×567px @ 300 DPI) with the official head-position guide overlay. Free and private — no photo booth, no studio.",
    "china visa photo",
    "The editor targets China's 33×48mm visa photo specification — 390×567 pixels at 300 DPI — with a head-position overlay tuned to that standard. The background option replaces imperfect home backdrops with the plain white the application expects.",
    "Drop one photo, align the face within the guides, choose the white background treatment, and download the 390×567 result ready for the COVA online form or a print submission.",
    "Accepts .jpg, .png and .webp up to 30MB; single-photo sessions; output 390×567px at 300 DPI. Online COVA uploads have their own file-size ceiling — run the result through the KB compressor if the portal complains.",
    "Chinese tourist (L) and business (M) visa applications, work permit photo requirements, and the identical-format photos some Chinese institutions request for enrollment and ID files."
  ),
  "id-photo-1-inch": seo(
    "1-Inch ID Photo Maker – 295×413 at 300 DPI",
    "Make standard 1-inch (25×35mm) ID photos at 295×413px — the universal badge, student-card and employee-file size. Free, private, print-ready at 300 DPI.",
    "1 inch id photo",
    "The editor renders the ubiquitous 1-inch standard: 25×35mm, or 295×413 pixels at 300 DPI. Its guide overlay positions head and shoulders the way institutional applications expect, and the background control produces the plain white or light tone most forms require.",
    "Drop one photo, align the subject with the guides, pick a background treatment, and download the 295×413 master — ready for both online upload and 300 DPI printing.",
    "Accepts .jpg, .png and .webp up to 30MB; single-photo editing; output 295×413px at 300 DPI. Pair with the Photo Print Sheet tool to lay out a 4×6 sheet of identical copies for physical submissions.",
    "Student and employee ID cards, gym and library memberships, exam registrations, resume photo boxes, and the countless forms — especially across Asia — that specify 'one-inch photo' literally."
  ),
  "linkedin-profile-photo": seo(
    "LinkedIn Profile Photo Maker – 400×400 Crop",
    "Crop professional LinkedIn headshots to 400×400 square with the ideal 60% face framing guide. Free, private, in-browser with background replacement included.",
    "linkedin photo size",
    "The editor frames your headshot in a 400×400 square with a guide marking where the face should occupy roughly 60% of the frame — the proportion recruiters' eyes expect. Background replacement to white or light gray gives the clean, professional backdrop most headshots lack.",
    "Drop one photo, drag the crop until the face sits on the guide, optionally clean the background, and download the 400×400 master for upload.",
    "Accepts .jpg, .png and .webp up to 30MB; single-photo sessions; output 400×400px. LinkedIn re-crops circularly at display time — the square master with centered framing survives that gracefully.",
    "LinkedIn profile photos, company 'about us' team grids, speaker bios for conferences and webinars, guest post bylines, and anywhere a professional square headshot is the first impression."
  ),
  "photo-print-sheet": seo(
    "Passport Photo Print Sheet – 4×6 at 300 DPI",
    "Arrange passport photos on a 4×6 inch print sheet at 300 DPI with optional cut lines. Print at any photo kiosk or minilab — free, private, in-browser.",
    "passport photo print sheet",
    "The tool tiles your finished ID photos onto a single 4×6 inch sheet at 300 DPI (1200×1800 pixels) — the size every drugstore kiosk prints — and draws optional cut lines between copies. You choose the photo dimensions from the standard set, and the sheet packs as many copies as fit.",
    "Drop your master photo, pick the photo size (413×531 for 35×45mm, 600×600 for US 2×2, and others), toggle cut lines, and generate the sheet. Print it at any kiosk and cut along the lines.",
    "Accepts .jpg, .png and .webp up to 30MB; batch-friendly if your photos share dimensions; output is one 1200×1800px sheet. A 35×45mm photo tiles 2×3 = 6 copies; US 2×2 also tiles 2×3 = 6 — the tool arranges as many as fit automatically.",
    "Turning one correctly sized photo into a wallet of spares for forms, applications and institutions that want physical copies — at kiosk prices instead of photographer prices."
  ),
};
