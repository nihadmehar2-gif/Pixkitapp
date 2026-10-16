/** Tool definitions: Social Media Sizes (12) + Passport & ID Photos (7). */

import { ToolDef, optSelect, optColor, FORMAT_OPTS } from "../types";

const IMG_ACCEPT = ["image/jpeg", "image/png", "image/webp"];

/**
 * Visible accuracy disclaimer shown on every passport/visa/ID tool page.
 * Deliberately exact: requirements genuinely vary by issuing authority and
 * change over time, so pages must not present presets as guaranteed specs.
 */
export const DOCUMENT_PHOTO_NOTE =
  "Photo requirements vary by country and change over time. Always check the official requirements of the issuing authority before submitting.";

function socialTool(
  slug: string, name: string, h1: string, description: string, keywords: string[],
  w: number, h: number, label: string, popular = false
): ToolDef {
  // Physical-size equivalents at 300 DPI (print quality) for the FAQ.
  const cmW = ((w / 300) * 2.54).toFixed(1);
  const cmH = ((h / 300) * 2.54).toFixed(1);
  const inW = (w / 300).toFixed(2);
  const inH = (h / 300).toFixed(2);
  // Staggered variant picks keep the 12 social pages from sharing boilerplate
  // paragraphs (duplicate-content hygiene) while staying factual.
  const v = Math.abs(w * 31 + h * 17) % 3;
  const abouts = [
    `This tool outputs the exact ${label} dimensions of ${w}×${h} pixels. Cover mode center-crops to fill the frame edge-to-edge; contain mode fits the whole image with padding. Batch up to 10 images — every one comes out at the precise size the platform expects.`,
    `Export any picture at exactly ${w}×${h} px — the ${label} spec. Choose cover to crop the frame full-bleed or contain to letterbox your image with a padding color, then download results one by one or as a ZIP (up to 10 files per run).`,
    `Get pixel-perfect ${label} output every time: images are drawn onto a ${w}×${h} canvas, so what you upload is what the platform receives. The fit selector decides between center-cropping (cover) and padded fit (contain), with JPEG, PNG or WebP export.`,
  ];
  const fitFaq = [
    { q: "Cover or contain?", a: "Cover fills the frame completely (crops edges); contain shows the full image with padded bars. Use cover for photos, contain for logos or graphics you don't want cropped." },
    { q: "Should I pick cover or contain fit?", a: `Cover crops inward until the image fills ${w}×${h} — great for photos. Contain scales the whole picture down and pads the leftover space with your chosen color — better for screenshots, logos and artwork.` },
    { q: "What does the fit option change?", a: `It controls how your picture meets the ${w}×${h} frame: cover crops to fill every pixel, contain preserves the entire image and fills gaps with padding, stretch forces exact dimensions by distorting proportions.` },
  ];
  const batchFaq = [
    { q: `Can I resize several ${name.toLowerCase()} images at once?`, a: `Yes — drop up to 10 files and every one comes out at exactly ${w}×${h} px. Results can be downloaded individually or as a single ZIP.` },
    { q: `Does batch resizing work for ${name.toLowerCase()}?`, a: `Yes, up to 10 images per run all receive the same ${w}×${h} treatment. Grab the whole set as one ZIP or download files individually.` },
    { q: `How many images can I resize in one go?`, a: `10 per batch — each is output at exactly ${w}×${h} px with identical fit and quality settings, ready to download separately or zipped together.` },
  ];
  const unitsFaq = [
    { q: `What is ${w}×${h} in cm or inches?`, a: `Social platforms define sizes in pixels only, because physical size depends on the screen. For reference: printed at 300 DPI, ${w}×${h} px measures about ${cmW}×${cmH} cm (${inW}×${inH} in).` },
    { q: `How big is ${w}×${h} px in centimeters?`, a: `There's no fixed cm value — screens pack pixels differently. As a print reference, ${w}×${h} px equals roughly ${cmW}×${cmH} cm (${inW}×${inH} in) at the 300 DPI print standard.` },
    { q: `Is ${w}×${h} the same in inches?`, a: `Platform sizes are pixel-based, not physical. If you need a print comparison: at 300 DPI, ${w}×${h} px is about ${cmW}×${cmH} cm — or ${inW}×${inH} inches.` },
  ];
  const sizeFaq = [
    { q: `What size is ${name.toLowerCase()}?`, a: `${w}×${h} pixels — this tool outputs exactly that size. Cover mode center-crops your image to fill the frame; contain mode keeps the whole image visible and pads the difference.` },
    { q: `What dimensions does ${name.toLowerCase()} use?`, a: `Exactly ${w}×${h} px — the size the platform expects. Pick cover to crop the frame full-bleed, or contain to letterbox with padding instead of cropping.` },
    { q: `How large is the ${name.toLowerCase()} canvas?`, a: `${w}×${h} pixels. Your picture is drawn onto that exact canvas, so the upload meets the platform's spec without any manual trimming.` },
  ];
  return {
    slug, name, h1, description,
    keywords: [...keywords, `${w}x${h}`, "social media image size", "resize for social"],
    category: "social",
    icon: "Share2",
    popular,
    accept: IMG_ACCEPT,
    multiple: true,
    options: [
      optSelect("fit", "Fit mode", "cover", [
        { value: "cover", label: "Cover — fill & center-crop" },
        { value: "contain", label: "Contain — fit with padding" },
        { value: "stretch", label: "Stretch to fill" },
      ]),
      optColor("bgColor", "Padding color", "#ffffff"),
      FORMAT_OPTS("image/jpeg"),
      { key: "quality", label: "Quality", type: "slider", default: 88, min: 40, max: 100, step: 1, suffix: "%" },
    ],
    processor: "socialResize",
    params: { __w: w, __h: h },
    about: abouts[v],
    faq: [sizeFaq[v], unitsFaq[v], fitFaq[v], batchFaq[v]],
  };
}

export const SOCIAL_TOOLS: ToolDef[] = [
  socialTool("instagram-post-resizer", "Instagram Post", "Instagram Post Resizer — 1080×1080", "Resize images to perfect Instagram post size 1080×1080 square. Cover-crop or pad — free, instant, batch-friendly.", ["instagram post size", "instagram square resize", "1080x1080"], 1080, 1080, "Instagram feed post (1:1)", true),
  socialTool("instagram-story-resizer", "Instagram Story", "Instagram Story Resizer — 1080×1920", "Resize images to Instagram Story size 1080×1920 vertical. Perfect full-screen stories and Reels covers.", ["instagram story size", "1080x1920", "story resizer"], 1080, 1920, "Instagram Story (9:16)", true),
  socialTool("instagram-portrait-resizer", "Instagram Portrait", "Instagram Portrait Resizer — 1080×1350", "Resize images to Instagram portrait post size 1080×1350 (4:5). Maximum feed real estate.", ["instagram portrait size", "1080x1350", "4:5 post"], 1080, 1350, "Instagram portrait post (4:5)"),
  socialTool("facebook-cover-resizer", "Facebook Cover", "Facebook Cover Photo Resizer — 851×315", "Resize images to Facebook cover size 851×315. Nail the desktop banner crop on the first try.", ["facebook cover size", "851x315", "facebook banner"], 851, 315, "Facebook cover photo"),
  socialTool("facebook-profile-resizer", "Facebook Profile", "Facebook Profile Picture Resizer — 720×720", "Resize images to Facebook profile picture size 720×720 square for a crisp profile photo.", ["facebook profile size", "720x720", "facebook pfp"], 720, 720, "Facebook profile picture"),
  socialTool("twitter-header-resizer", "X / Twitter Header", "X (Twitter) Header Resizer — 1500×500", "Resize images to X (Twitter) header size 1500×500. Get your banner crop right without trial and error.", ["twitter header size", "1500x500", "x banner size"], 1500, 500, "X/Twitter header banner", true),
  socialTool("x-post-resizer", "X / Twitter Post", "X (Twitter) Post Resizer — 1200×675", "Resize images to X (Twitter) post size 1200×675 (16:9) for maximum timeline impact.", ["twitter post size", "1200x675", "x post image"], 1200, 675, "X/Twitter timeline post (16:9)"),
  socialTool("linkedin-banner-resizer", "LinkedIn Banner", "LinkedIn Banner Resizer — 1584×396", "Resize images to LinkedIn profile banner size 1584×396. Look professional from the first impression.", ["linkedin banner size", "1584x396", "linkedin cover"], 1584, 396, "LinkedIn profile banner"),
  socialTool("linkedin-post-resizer", "LinkedIn Post", "LinkedIn Post Resizer — 1200×1200", "Resize images to LinkedIn post size 1200×1200 square for clean professional feeds.", ["linkedin post size", "1200x1200"], 1200, 1200, "LinkedIn feed post (1:1)"),
  socialTool("youtube-thumbnail-resizer", "YouTube Thumbnail", "YouTube Thumbnail Resizer — 1280×720", "Resize images to YouTube thumbnail size 1280×720 (16:9). Click-worthy thumbnails, exact spec.", ["youtube thumbnail size", "1280x720", "yt thumbnail"], 1280, 720, "YouTube thumbnail (16:9)", true),
  socialTool("youtube-banner-resizer", "YouTube Banner", "YouTube Channel Banner Resizer — 2048×1152", "Resize images to YouTube channel banner size 2048×1152. Channel art that fits every device.", ["youtube banner size", "2048x1152", "channel art"], 2048, 1152, "YouTube channel banner"),
  socialTool("pinterest-pin-resizer", "Pinterest Pin", "Pinterest Pin Resizer — 1000×1500", "Resize images to Pinterest pin size 1000×1500 (2:3). Optimal vertical pins that get saves.", ["pinterest pin size", "1000x1500", "pinterest 2:3"], 1000, 1500, "Pinterest pin (2:3)"),
];

function passportTool(
  slug: string, name: string, h1: string, description: string, keywords: string[],
  w: number, h: number, label: string, popular = false, withNote = true
): ToolDef {
  return {
    slug, name, h1, description,
    keywords: [...keywords, `${label} photo size`, "passport photo maker", "id photo online"],
    category: "passport",
    icon: "IdCard",
    popular,
    interactive: "passport",
    accept: IMG_ACCEPT,
    options: [
      optSelect("bg", "Background", "white", [
        { value: "white", label: "White (commonly required)" },
        { value: "lightgray", label: "Light gray" },
        { value: "keep", label: "Keep original" },
      ]),
      FORMAT_OPTS("image/jpeg"),
      { key: "quality", label: "Quality", type: "slider", default: 95, min: 70, max: 100, step: 1, suffix: "%" },
    ],
    processor: "cropManual",
    params: { __pw: w, __ph: h },
    requirementNote: withNote ? DOCUMENT_PHOTO_NOTE : undefined,
    about: `Produce a ${label} photo at the official size: ${w}×${h} pixels (300 DPI print standard). The interactive editor shows a head-position oval and eye-line guide modeled on the common standards — align the face, adjust the crop, and export at exactly the required dimensions. Everything stays on your device.`,
    faq: [
      { q: `What size is a ${label.toLowerCase()}?`, a: `${w}×${h} pixels, matching the common print standard at 300 DPI.` },
      { q: "Can I print it?", a: `Yes — output at 300 DPI prints at the selected size. Use the Print Sheet tool to arrange copies on 4×6" paper.` },
      { q: "Will this photo be accepted for my application?", a: "The tool guarantees the exact pixel dimensions and print size, but every authority sets its own rules for lighting, expression, head position and recency — and they change over time. Always verify the current requirements with the issuing authority (embassy, consulate or agency) before submitting." },
    ],
  };
}

export const PASSPORT_TOOLS: ToolDef[] = [
  {
    slug: "passport-photo-maker",
    name: "Passport Photo Maker",
    h1: "Passport Photo Maker — All Standards",
    description: "Make passport photos online free with common size presets. US, UK, EU, India & more — 35×45mm or 2×2in at 300 DPI.",
    keywords: ["passport photo maker", "passport photo online", "passport size photo", "biometric photo"],
    category: "passport",
    icon: "IdCard",
    popular: true,
    interactive: "passport",
    accept: IMG_ACCEPT,
    options: [
      optSelect("preset", "Country standard", "35x45mm", [
        { value: "35x45mm", label: "35×45mm — UK, EU, India, most countries" },
        { value: "2x2in", label: "2×2 in — USA passport/visa" },
        { value: "33x48mm", label: "33×48mm — China visa" },
        { value: "35x35mm", label: "35×35mm — square ID photos" },
        { value: "3.5x4.5cm", label: "3.5×4.5cm — Schengen visa" },
      ]),
      optSelect("bg", "Background", "white", [
        { value: "white", label: "White (commonly required)" },
        { value: "lightgray", label: "Light gray" },
        { value: "keep", label: "Keep original" },
      ]),
      FORMAT_OPTS("image/jpeg"),
      { key: "quality", label: "Quality", type: "slider", default: 95, min: 70, max: 100, step: 1, suffix: "%" },
    ],
    processor: "cropManual",
    requirementNote: DOCUMENT_PHOTO_NOTE,
    about: "The universal passport photo maker: pick your country's standard, align the face to the head-position oval and eye-line guides (modeled on the common standards), and export at exactly 300 DPI print dimensions. Most authorities require plain white/light backgrounds and specific head proportions — the on-screen guides mirror them visually. Your photo never touches a server.",
    faq: [
      { q: "Is this accepted for real applications?", a: "It outputs the correct official dimensions at 300 DPI, which is what most checks are about — but acceptance is always the issuing authority's call. Requirements vary by country and change over time, so verify the current rules with the authority you're applying to before submitting." },
      { q: "How do I get a 4×6 print sheet?", a: "Process your photo here, then open the Photo Print Sheet tool and drop the result in." },
    ],
  },
  passportTool("us-passport-photo", "US Passport Photo", "US Passport Photo Maker — 2×2 inch", "Create US passport photos at the official 2×2 inch size (600×600px) at 300 DPI with head-position guides.", ["us passport photo", "2x2 passport photo", "600x600 photo"], 600, 600, "US passport (2×2 in)"),
  passportTool("schengen-visa-photo", "Schengen Visa Photo", "Schengen Visa Photo Maker — 35×45mm", "Create Schengen visa photos at 35×45mm (413×531px @300DPI) with ICAO-style head-position guides.", ["schengen visa photo", "35x45mm photo", "europe visa photo"], 413, 531, "Schengen visa (35×45mm)"),
  passportTool("china-visa-photo", "China Visa Photo", "China Visa Photo Maker — 33×48mm", "Create China visa photos at 33×48mm (390×567px @300DPI) with head-position guide overlay.", ["china visa photo", "33x48mm photo"], 390, 567, "China visa (33×48mm)"),
  passportTool("id-photo-1-inch", "1-Inch ID Photo", "1-Inch ID Photo Maker — 295×413", "Make standard 1-inch (25×35mm) ID photos at 295×413px — the universal badge and student-card size.", ["1 inch id photo", "295x413 photo", "one inch photo"], 295, 413, "1-inch ID (25×35mm)"),
  passportTool("linkedin-profile-photo", "LinkedIn Headshot", "LinkedIn Profile Photo Maker — 400×400", "Crop professional LinkedIn headshots to 400×400 square with the ideal 60% face framing guide.", ["linkedin photo size", "linkedin headshot crop", "400x400 profile"], 400, 400, "LinkedIn profile (1:1)", false, false),
  {
    slug: "photo-print-sheet",
    name: "Photo Print Sheet",
    h1: "Passport Photo Print Sheet (4×6)",
    description: "Arrange passport photos on a 4×6 inch print sheet at 300 DPI with cut lines. Take it to any photo kiosk.",
    keywords: ["passport photo print sheet", "4x6 photo sheet", "print passport photos"],
    category: "passport",
    icon: "Printer",
    accept: IMG_ACCEPT,
    multiple: true,
    options: [
      optSelect("photoWidthPx", "Photo width (px @300DPI)", "413", [
        { value: "413", label: "413px — 35mm wide (UK/EU/India)" },
        { value: "600", label: "600px — 2 inch (US)" },
        { value: "390", label: "390px — 33mm (China)" },
        { value: "295", label: "295px — 25mm (1-inch ID)" },
      ]),
      { key: "photoHeightPx", label: "Photo height (px)", type: "number", default: 531, min: 200, max: 800, step: 1, suffix: " px" },
      { key: "cutLines", label: "Show cut lines", type: "toggle", default: true },
    ],
    processor: "printSheet",
    requirementNote: DOCUMENT_PHOTO_NOTE,
    about: "Turn one correctly sized photo into a full print sheet: your image tiles edge-to-edge on a 4×6 inch canvas at 300 DPI — as many copies as fit your selected photo size (six for 35×45mm or US 2×2, nine for China visa, sixteen for 1-inch ID) — with optional cutting guides. Save the JPEG, send it to any 1-hour photo kiosk or home printer, and cut along the lines.",
    faq: [
      { q: "How many photos fit on a sheet?", a: "It depends on the photo size — the sheet is 1200×1800px (4×6\" at 300 DPI): a 35×45mm photo (413×531px) tiles 2×3 = 6 copies; a US 2×2 photo (600×600px) also tiles 2×3 = 6; China visa 33×48mm tiles 3×3 = 9; 1-inch ID tiles 4×4 = 16. The result card shows the exact count for your settings." },
      { q: "What resolution is the sheet?", a: "1200×1800 pixels — exactly 4×6 inches at 300 DPI, the retail print standard." },
    ],
  },
];
