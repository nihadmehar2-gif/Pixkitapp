/** SEO content: Filters (15) + Color (9) + Metadata (3) tools. */

import { seo, ToolSeo } from "../types";

export const FILTERS_SEO: Record<string, ToolSeo> = {
  "grayscale-image": seo(
    "Grayscale Image Converter – Black & White",
    "Turn photos black & white online with luminance-accurate grayscale. Adjustable mix from tinted color to full monochrome — free, private, instant.",
    "convert image to grayscale",
    "The converter weights each pixel's red, green and blue by how the human eye actually perceives brightness — green counts most, blue least — rather than a flat average, which is what makes the result look like real monochrome photography instead of a washed-out desaturation.",
    "Drop up to 10 images, set the grayscale intensity if you want a partial effect (100% is full black & white), and process. Preview each result, then download individually or as a ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch; output keeps your chosen format, including transparency in PNG. Partial intensities create tasteful desaturated looks between color and monochrome.",
    "Timeless portraits, print-friendly documents, moody blog headers, and accessibility checks (grayscale reveals if an image still reads without color). Developers also use it to test dark-theme imagery before committing to a palette."
  ),
  "sepia-image": seo(
    "Sepia Photo Filter Online – Vintage Tone",
    "Give photos a warm vintage sepia tone in one click. Adjustable intensity from subtle warmth to full antique brown — free, private, in-browser.",
    "sepia filter online",
    "The filter transforms each pixel through the classic sepia matrix — trading saturation for warm browns weighted toward red and yellow channels. The intensity slider blends between your original colors and full sepia, so you can dial in everything from a faint golden warmth to a deep antique look.",
    "Add up to 10 images, set the sepia strength (60–80% is the nostalgic sweet spot), and process. Preview the tone on each result, then download files or the whole batch as a ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. Sepia flattens color variety by design; applying it to already-muted photos deepens the vintage feel while vivid scenes produce more dramatic before/after deltas.",
    "Restyling modern photos as heirlooms, theming event invitations, giving blog and social graphics a cohesive retro palette, and making new family photos match century-old album prints for side-by-side displays."
  ),
  "invert-image-colors": seo(
    "Invert Image Colors Online – Photo Negative",
    "Create photo negatives by inverting colors online. Instant RGB inversion for art, OCR preparation and design effects — free, private, instant.",
    "invert image colors",
    "Every pixel's red, green and blue values are replaced by their complements (255 minus the original), producing a photographic negative. The intensity slider blends the inversion, allowing partial effects — and running the tool at 100% twice returns the exact original, which is handy for verification.",
    "Drop up to 10 images, set inversion strength (100% for a true negative), and process. Preview each result and download individually or zipped.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch; PNG transparency survives inversion (alpha is untouched, colors flip). Dark-mode designers often invert light screenshots rather than re-shooting them.",
    "Developing film-scan negatives into positives, preparing scanned documents for OCR (inverting white-on-black text), creating inverted art assets, and producing light-on-dark variants of UI screenshots for dark-mode documentation."
  ),
  "blur-image": seo(
    "Blur Image Online – Gaussian Blur Control",
    "Blur photos with adjustable Gaussian blur from 1px soft focus to heavy censoring. Free, instant, no signup — everything stays on your device.",
    "blur image online",
    "The tool applies a true Gaussian convolution through the canvas filter pipeline, spreading each pixel's influence over a neighborhood scaled by your radius setting. Low values create portrait-style soft focus; high values dissolve detail entirely for censoring or background use.",
    "Add up to 10 images, drag the blur slider while judging the effect level you need, and process. Each result previews instantly; download files individually or as one ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Blur is applied to the whole image — for blurring only a region, crop that region first, blur it, and reassemble. Heavy blur plus JPEG output can look mushy; prefer PNG for crisp-edged designs.",
    "Softening backgrounds behind text overlays, censoring license plates and faces before posting, creating dreamy soft-focus portraits, and generating placeholder art for design mockups where real content isn't ready."
  ),
  "sharpen-image": seo(
    "Sharpen Image Online – Unsharp Mask",
    "Make photos crisper with an unsharp-mask convolution kernel. Adjustable strength brings back micro-detail — free, private, in-browser.",
    "sharpen image online",
    "The tool convolves your image with an unsharp-mask kernel: it detects edges by comparing each pixel against its neighbors and boosts local contrast along them. The result reads as sharper micro-detail — text gains definition, foliage separates, and slightly soft resizes recover snap.",
    "Add up to 10 images, set the sharpening amount (modest values look natural; high ones add halos), and process. Zoom into a preview to check for halos before downloading.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. Sharpening amplifies existing JPEG artifacts and sensor noise — very compressed sources may need a gentler setting. It cannot truly rescue heavily blurred images; think 'enhance', not 'restore'.",
    "Final polish after downsizing (resizing always softens slightly), making scanned documents' text pop, sharpening product photos for marketplace listings, and adding bite to landscape shots straight out of camera."
  ),
  "brightness-adjuster": seo(
    "Adjust Image Brightness Online – Precise Slider",
    "Brighten dark photos or dim overexposed ones with a precise slider and instant preview. Fix exposure in seconds — free, private, no upload.",
    "adjust image brightness",
    "Brightness shifts every pixel's RGB values up or down uniformly through the canvas filter pipeline — a global exposure nudge rather than contrast's steepening of differences. The live preview updates as you drag, so finding the point where shadows lift without washing out is quick and visual.",
    "Drop up to 10 images, move the brightness slider (positive brightens, negative darkens), and process. Compare each result against the original in the results panel, then download.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Large positive values clip highlights to flat white and large negatives crush shadows to black — moderate moves preserve the most tonal detail.",
    "Rescuing underexposed indoor shots, toning down blown-out scans, matching brightness across a photo series for a cohesive grid, and prepping images for print where screens tend to flatter dark photos."
  ),
  "contrast-adjuster": seo(
    "Adjust Image Contrast Online – Instant Preview",
    "Boost washed-out photos or soften harsh contrast with one slider. Make images pop with richer blacks and brighter whites — free, in-browser.",
    "adjust image contrast",
    "The filter steepens (or flattens) the tonal curve: values above the midpoint stretch toward white, values below sink toward black. That's what makes images 'pop' — bigger separation between light and dark — while the slider lets you stop well before shadows lose their detail.",
    "Add up to 10 images, drag the contrast slider while watching the live preview, and process. Each result can be compared with its original; download individually or as a ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. Extreme contrast clips detail at both ends — for scanned documents and text, moderate settings keep letters legible; for photos, a small boost often reads as 'better camera'.",
    "Waking up flat, hazy photos; adding punch to product shots; making presentation screenshots easier to read on projectors; and normalizing mixed lighting conditions across a batch of event photos."
  ),
  "saturation-adjuster": seo(
    "Adjust Color Saturation Online – Vivid or Muted",
    "Boost vivid colors or mute them with a precise saturation slider. From pastel softness to hyper-vivid pop — free, private, instant results.",
    "adjust color saturation",
    "The tool scales each pixel's chroma — the distance between its color and neutral gray — while leaving brightness untouched. Positive values push colors toward candy vividness; negative values drain them toward monochrome without ever crossing into full grayscale unless you take the slider all the way down.",
    "Drop up to 10 images, set the saturation level while previewing live, and process. Results render beside their originals; download individually or as a batch ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Oversaturation clips fine color gradations in skies and skin — subtle boosts (10–30%) usually photograph best; food and product shots tolerate more.",
    "Making social graphics and product photos pop in feeds, muting busy backgrounds behind text overlays, unifying color strength across a mixed batch, and softening clashing colors in user-supplied artwork before print."
  ),
  "hue-rotate-image": seo(
    "Hue Rotate Image Online – Shift All Colors",
    "Shift all colors around the wheel — turn blue skies purple, greens teal, or find creative color grades in seconds. Free, private, in-browser.",
    "hue rotate image",
    "The filter rotates every pixel's hue angle by the same amount around the color wheel while preserving saturation and lightness — which is why the image keeps its tonal structure while colors relocate. A full 360° returns you to the start; everything between is a legitimate grade.",
    "Add up to 10 images, drag the hue slider through the wheel while previewing, and process when a look lands. Download results individually or zipped together.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Skin tones shift with everything else — portraits at extreme angles look alien (sometimes the goal). PNG transparency is preserved through rotation.",
    "Creating color variants of logos and illustrations without re-exporting from a design tool, fixing white-balance casts by rotating toward neutral, generating rainbow sets for A/B social testing, and stylizing game or UI assets."
  ),
  "vintage-filter": seo(
    "Vintage Photo Filter – Retro Film Look",
    "One-click retro look: faded sepia warmth, softened contrast, film grain and a gentle vignette — each layer tunable. Free, private, in-browser.",
    "vintage photo filter",
    "The filter stacks four classic analog cues: a warm sepia-leaning tint, compressed contrast for that faded-print feel, procedural film grain, and an edge vignette. Each layer has its own control, so the look ranges from a light Instagram warmth to a full 1970s snapshot.",
    "Drop up to 10 images, set the overall strength, toggle grain and vignette to taste, and process. Preview the composite effect, adjust, and download individually or as a ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Grain adds real pixels (noise), so extremely low quality output can exaggerate it — WebP or PNG at decent quality keeps the texture looking intentional.",
    "Theming wedding and event galleries, giving product and lifestyle shots a warm nostalgic pull, designing album covers and posters with film character, and unifying a mixed photo set into one cohesive retro mood."
  ),
  "posterize-image": seo(
    "Posterize Image Online – Bold Flat Tones",
    "Reduce images to bold flat tones for poster art and screen prints. 2–16 levels per channel with instant preview — free and private.",
    "posterize image",
    "The tool quantizes each RGB channel to a fixed number of levels: smooth gradients become visible steps, and photographs flatten into graphic, screen-print style art. Fewer levels means bolder simplification — at 3–4 levels a photo starts reading like an actual poster.",
    "Add up to 10 images, choose the level count (start at 6 and adjust), and process. Preview how gradients stepped, then download individually or as one ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. The flattening makes subsequent color work (duotone, palette extraction) cleaner, and PNG output avoids JPEG artifacts smearing the hard tonal edges posterization creates.",
    "Designing gig posters and album art, creating stencil references for screen printing and spray paint, simplifying photos into painting references, and making bold, low-color graphics that compress beautifully."
  ),
  "pixelate-image": seo(
    "Pixelate Image Online – Mosaic Censor Effect",
    "Censor photos with retro pixel blocks from subtle 4px mosaic to chunky 64px squares. Free, instant, private — nothing leaves your device.",
    "pixelate image",
    "The tool averages each block of pixels into a single color, producing the classic mosaic: block size controls how coarse the effect reads. Because averaging happens on your device, sensitive content is censored without any upload — the whole point when the photo itself is the secret.",
    "Drop up to 10 images, set the block size (8–16px obscures faces in typical photos; larger for smaller images), and process. Verify nothing is recognizable in the preview, then download.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Pixelation applies to the whole image — for selective censoring, crop the sensitive region, pixelate, and reassemble. Note that very small block sizes may not fully obscure text.",
    "Censoring faces, plates and documents before sharing screenshots; making retro game-style art from modern photos; creating privacy-safe teaching materials; and generating stylized backgrounds that don't distract from foreground UI."
  ),
  "duotone-image": seo(
    "Duotone Image Effect – Two-Color Branding",
    "Map photos to two brand colors for striking graphics. Pick shadow and highlight tones for an instant gradient-map look — free, in-browser.",
    "duotone effect",
    "The tool converts your image to luminance, then maps that brightness ramp between two colors you choose: dark tones take the shadow color, bright tones take the highlight color, and midtones blend along the way. It's the gradient-map technique behind modern brand graphics and Spotify-style covers.",
    "Drop up to 10 images, pick a shadow color and a highlight color (default dark navy and white work with everything), and process. Preview the mapping, tweak colors, and download.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Output is a full-color image even though it contains two hues; for strict two-color printing workflows, posterize afterward to reduce the midtone ramp.",
    "Branded social posts and event graphics where photos must match corporate colors, album and podcast cover art, hero images that sit behind colored overlays, and cohesive team or campaign imagery from mixed source photos."
  ),
  "film-grain-effect": seo(
    "Add Film Grain to Photos – Analog Texture",
    "Overlay analog film grain for texture and mood. Adjustable intensity adds authentic photographic character to digital images — free, private.",
    "film grain effect",
    "The tool synthesizes a per-pixel noise field seeded per image — so it never repeats in visible patterns — and blends it over your photo at the intensity you choose. Monochromatic grain preserves color while adding the tactile texture that clean digital images lack.",
    "Add up to 10 images, set the grain amount (subtle is usually better), and process. Zoom into a preview to judge the texture, then download individually or zipped.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Heavy grain fights JPEG compression — output as PNG or high-quality WebP so the noise doesn't smudge into artifacts. Grain also slightly reduces compressibility; that's physics.",
    "Giving digital photos a film-era mood, matching new product shots to vintage campaign imagery, adding texture to flat illustration backgrounds, and making clean AI-generated or stock images feel authentically photographic."
  ),
  "vignette-effect": seo(
    "Add Vignette to Photos – Edge Darkening",
    "Darken photo edges with a natural lens-style vignette. Control strength and reach to focus attention on your subject — free, private, instant.",
    "vignette effect",
    "A radial darkening gradient is composited over your image, strongest at the corners and fading toward the center — the same optical effect expensive lenses produce naturally. The size control sets how far the darkening reaches inward; strength sets how deep it goes.",
    "Drop up to 10 images, adjust strength and reach while previewing, and process. Judge whether attention lands on your subject, then download files or a ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Gentle vignettes (low strength) read as photographic; heavy ones read as graphic design — both legitimate, but know which you're making. Square and portrait crops suit stronger vignettes than wide panoramas.",
    "Focusing attention on faces and products, adding depth to flat center-lit shots, unifying busy edges around text overlays, and giving social graphics a subtle spotlight treatment without a heavyweight editor."
  ),

  // Color
  "image-color-picker": seo(
    "Image Color Picker – Grab Any Pixel's HEX",
    "Pick exact colors from any image. Click anywhere to get HEX, RGB and HSL values with a live zoom magnifier — free, private, in-browser.",
    "image color picker",
    "Your image loads onto a zoomable canvas; every click samples the exact pixel under the cursor through the canvas API and reports it as HEX, RGB and HSL simultaneously. A magnifier loupe shows the neighborhood so you can hit the precise pixel between anti-aliased edges.",
    "Drop one image, move the cursor (or finger) until the loupe centers the pixel you want, and click to lock the color. Copy any of the three formats with one tap and grab a swatch if you need it saved.",
    "Accepts .jpg, .png and .webp up to 30MB; single-image sessions. Zoom-dependent sampling means JPEG blur around edges can mislead — zoom in fully to sample the true pixel, or use PNG sources for precision work.",
    "Pulling brand colors from a client's screenshot, matching a color from a photo for CSS, sampling design references, and identifying 'what color is that exactly?' in any image — the everyday eyedropper for people without Photoshop."
  ),
  "image-color-palette": seo(
    "Color Palette Extractor from Image – HEX Codes",
    "Pull the dominant color palette from any image with median-cut quantization. Copy HEX codes or download a swatch sheet — free and instant.",
    "color palette from image",
    "A median-cut quantizer analyzes your image's pixels and derives the N most representative colors — the same algorithm used in PNG palette reduction, pointed at design instead of compression. You choose how many swatches to extract, and each arrives with copyable HEX values.",
    "Drop one image, set the palette size (5–10 is typical), and extract. Click any swatch to copy its HEX, or download the generated swatch sheet PNG for your design docs.",
    "Accepts .jpg, .png and .webp up to 30MB; single-image sessions. Very colorful photos yield livelier palettes than muted ones; logos and illustrations produce their exact brand colors almost deterministically.",
    "Building website color schemes from a hero photo, extracting brand palettes from logos, choosing paint or outfit colors from inspiration shots, and giving design teams a shared, objective starting palette from any reference."
  ),
  "image-dominant-color": seo(
    "Find the Dominant Color of an Image – HEX",
    "Get the single dominant color of any photo as a HEX swatch. Great for dynamic theming and auto-accent colors — free, private, batch-friendly.",
    "dominant color of image",
    "The tool quantizes your image's colors and selects the single most representative one — weighted so that a big sky or background asserts itself over scattered accents. It answers one question precisely: 'if this image could be one color, which?'",
    "Drop up to 10 images and process — no settings needed. Each result presents its dominant color as a swatch with HEX, RGB and HSL values ready to copy.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. Results shift with composition — the same photo cropped differently can legitimately have a different dominant color, so feed it the version you're actually designing with.",
    "Auto-generating accent colors for cards and galleries from their thumbnails, building music-player style ambient theming, tagging images by color in DAM systems, and picking page background tints that harmonize with hero imagery."
  ),
  "image-average-color": seo(
    "Average Color of Image – Mean Color Calculator",
    "Compute the exact average color of any photo — useful for ambient lighting effects, blur placeholders and quick color analysis. Free and private.",
    "average color of image",
    "Every pixel's red, green and blue values are summed and divided by the pixel count — a true arithmetic mean, not a perceptual estimate. The result is the color your eye perceives when the image is blurred into nothing, which is exactly how ambient-light effects work.",
    "Drop up to 10 images and process — the average appears instantly as a swatch with HEX, RGB and HSL values to copy. Batch results list each image's mean color.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Transparent areas are typically composited during decode, so PNG alpha influences the average. High-contrast images average to gray — that's math, not a bug.",
    "Generating blur-up lazy-load placeholders, setting ambient background colors behind images in players and apps, checking a photo series' overall color temperature consistency, and answering 'is this image warm or cool?' with numbers."
  ),
  "replace-color-in-image": seo(
    "Replace Color in Image Online – Tolerance Control",
    "Swap one color for another with adjustable tolerance. Perfect for mockups, logo variants and product colorways — free, private, in-browser.",
    "replace color in image",
    "Every pixel within your tolerance of the 'from' color is rewritten to the 'to' color — the slider decides how similar a pixel must be to qualify. Low tolerance catches only the exact shade; higher values sweep in anti-aliased edges and natural shading variations.",
    "Drop up to 10 images, pick the source color (or sample it with the color picker first), choose the replacement, set tolerance, and process. Preview and download individually or as a ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Flat-color graphics replace cleanly; photos with gradual shading show a visible boundary at high tolerance — feathered workflows (chroma key then recolor) handle those better.",
    "Generating logo color variants without design-tool round trips, previewing product colorways from a single photo, recoloring UI mockups and game sprites, and fixing one off-brand color in otherwise final artwork."
  ),
  "remove-color-from-image": seo(
    "Remove Color – Chroma Key Tool Online",
    "Key out any color to transparency with feathered edges. Green-screen style background removal for any color — free, private, in-browser.",
    "chroma key online",
    "The tool measures each pixel's distance from your key color; pixels within tolerance become transparent, and the feather slider softens the boundary so edges don't look cut with scissors. It's a color-distance key — the same idea as a green screen, applicable to any color.",
    "Drop one image, set the key color (sample the exact shade for best results), adjust tolerance until the target area clears in the preview, add feathering to taste, then download the transparent PNG.",
    "Accepts .jpg, .png and .webp up to 30MB; single-image sessions; output is PNG with real alpha. Uniform backgrounds key cleanly; busy backgrounds catch collateral pixels — raise tolerance carefully and preview often.",
    "Knocking out green-screen and blue-screen backdrops, removing colored studio backgrounds from product shots, extracting subjects from solid-color design comps, and building transparent sticker assets from flat art."
  ),
  "image-color-temperature": seo(
    "Adjust Image Color Temperature – Warm or Cool",
    "Make photos warmer (golden) or cooler (blue) with a Kelvin-style slider. Fix white balance creatively — free, private, instant results.",
    "adjust image color temperature",
    "The filter shifts the balance between red and blue channels across the image: positive values push toward golden warmth, negative toward icy blue, while green stays anchored so skin and foliage keep their character. It's the white-balance control from camera software, running in your tab.",
    "Drop up to 10 images, drag the temperature slider while previewing (small moves fix casts; large moves create moods), and process. Download results individually or as a batch ZIP.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per run. This is global — it can't warm only the background — and extreme shifts clip channel peaks. For surgical correction, full photo software still has its place.",
    "Fixing photos shot under tungsten or fluorescent light, warming product shots for cozy marketplaces, cooling tech imagery for a crisp modern feel, and harmonizing a mixed batch of photos shot in different lighting."
  ),
  "threshold-image": seo(
    "Black & White Threshold Converter – 1-bit Style",
    "Convert images to pure black & white with an adjustable threshold. Crisp 1-bit style output for stamps and stencils — free, private, instant.",
    "black and white threshold",
    "Every pixel is judged against your threshold: brighter becomes pure white, darker becomes pure black — no grays survive. It's the binarization step that laser engravers, vinyl cutters and stencil workflows actually need, and the slider lets you bias the cutoff until the subject reads correctly.",
    "Drop up to 10 images, set the threshold while previewing (raise it to keep more as black), optionally invert, and process. Download the stark result in your chosen format.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Anti-aliased edges become hard jaggies — that's inherent to 1-bit output. For smoother monochrome that keeps grays, use the grayscale tool instead.",
    "Preparing artwork for laser engraving, vinyl cutting and screen-print stencils; creating high-contrast stamps and signatures; generating binary masks for further processing; and makingQR-code-friendly, scan-safe graphics."
  ),
  "swap-color-channels": seo(
    "Swap RGB Color Channels – Channel Mixer Effect",
    "Remix red, green and blue channels for psychedelic color shifts and infrared-style looks. Nerdy, fun and free — runs entirely in your browser.",
    "swap color channels",
    "The tool reassigns which byte drives each output channel: swapping red and blue turns skies amber and foliage magenta; other permutations produce their own signature casts. It's a per-pixel remap with no resampling — wild in effect. The swap is mathematically reversible, but since photos are usually saved back as JPEG, keep your original if you want a pristine undo path.",
    "Add up to 10 images, pick a channel permutation from the dropdown, and process. Preview the remap, try another permutation, then download the winners individually or zipped.",
    "Accepts .jpg, .png and .webp up to 30MB each, 10 per batch. Grayscale images barely change (channels are equal); saturated images change dramatically. The swap itself is inverse-identical — PNG output can be undone pixel-perfectly — though saved JPEGs add normal re-encode noise, so keep your original file.",
    "Creating false-color and infrared-style art, debugging image pipelines by making channel errors obvious, generating psychedelic variants for creative projects, and teaching how digital color actually stores its three components."
  ),

  // Metadata
  "image-metadata-viewer": seo(
    "Image Metadata & EXIF Viewer Online – Private",
    "Inspect EXIF, GPS and PNG metadata of any image — camera model, settings, date, location. private: the file never leaves your browser.",
    "exif viewer online",
    "The viewer parses your file's byte structure locally: EXIF IFD blocks for JPEG (camera, exposure, ISO, aperture, focal length, timestamps, orientation and GPS coordinates when present), PNG chunk inspection for tEXt/iTXt data, and baseline info for WebP and GIF. Nothing uploads — the parser runs in your tab.",
    "Drop one image and the report renders immediately — no buttons, no waiting. Browse the sections, expand GPS details if present, and simply close the tab when done; the image was never sent anywhere.",
    "Accepts .jpg, .jpeg, .png, .webp and .gif up to 30MB. Files stripped of metadata (by social platforms or the Remove Metadata tool) show minimal tables — absence of data is itself the finding.",
    "Checking what private data a photo exposes before posting it, recovering camera settings from a shot you want to reproduce, verifying image provenance and edit history, and teaching photography students what EXIF reveals."
  ),
  "remove-image-metadata": seo(
    "Remove Image Metadata – EXIF Stripper Online",
    "Strip EXIF, GPS and hidden metadata from images before sharing. Re-encoded clean output in one click — free, private, batch of 10.",
    "remove exif data",
    "The tool decodes your image and re-encodes it from raw pixels — metadata lives in file headers, and a fresh encode simply doesn't carry them. The result keeps every visible pixel while leaving behind camera serials, timestamps, editing software fingerprints and GPS coordinates.",
    "Drop up to 10 images, choose whether output stays in the original format or converts, set quality if converting, and process. Download the clean files — optionally verify with the Metadata Viewer first.",
    "Accepts .jpg and .png up to 30MB each, 10 per batch. Re-encoding JPEGs at default quality is visually safe; PNG output stays lossless but larger. Some platforms strip metadata anyway — doing it yourself guarantees it.",
    "Scrubbing photos before posting homes, cars or kids online; cleaning up documents and scans shared with third parties; preparing press or portfolio submissions; and any workflow where 'what else is in this file?' matters."
  ),
  "remove-gps-data": seo(
    "Remove GPS Location from Photos Online",
    "Delete GPS coordinates from photos before posting online. See if your image has location data and scrub it clean — free, private, batch-friendly.",
    "remove gps from photo",
    "The tool re-encodes your image from raw pixels, which drops the GPS IFD block along with all other metadata — a focused version of the full metadata stripper, same privacy guarantee: the photo is parsed and rebuilt inside your browser, never uploaded.",
    "Drop up to 10 images, choose format and quality settings, and process. Want proof it worked? Load the result into the Metadata Viewer — the GPS section will be empty.",
    "Accepts .jpg and .png up to 30MB each, 10 per batch. Output keeps every visible pixel — only the hidden location record disappears. WebP sources should be converted to JPG or PNG first via the universal converter.",
    "The pre-upload ritual for marketplace listings, dating profiles, rental ads, school events and travel photos — anywhere 'this is where I live' is information you didn't consent to sharing with every viewer."
  ),
};
