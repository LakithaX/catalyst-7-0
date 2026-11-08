import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE_PATH = 'C:/Users/TUF/.gemini/antigravity/brain/b2045b03-5c6e-4601-9579-3f206efcbb25/.user_uploaded/media_1794118267571_89368701.png';
const WORDMARK_PATH = path.resolve('public/assets/catalyst_7_logo.png');
const BRAND_DIR = path.resolve('public/assets/brand');
const PUBLIC_DIR = path.resolve('public');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function createIco(images) {
  // images: Array<{ width, height, buffer }> where buffer is PNG buffer
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(count, 4); // count

  let offset = 6 + count * 16;
  const entries = [];
  const dataBuffers = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(img.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    dataBuffers.push(img.buffer);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...dataBuffers]);
}

async function run() {
  console.log('Generating brand assets...');
  await ensureDir(BRAND_DIR);

  // 1. Load source and trim transparent pixels
  const rawSource = sharp(SOURCE_PATH);
  const trimmed = await rawSource.trim().toBuffer({ resolveWithObject: true });
  const trimmedWidth = trimmed.info.width;
  const trimmedHeight = trimmed.info.height;
  console.log(`Trimmed size: ${trimmedWidth}x${trimmedHeight}`);

  // Add 2% transparent padding
  const padX = Math.round(trimmedWidth * 0.02);
  const padY = Math.round(trimmedHeight * 0.02);

  const masterMark = sharp(trimmed.data).extend({
    top: padY,
    bottom: padY,
    left: padX,
    right: padX,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });
  const masterBuffer = await masterMark.toBuffer();
  const masterMeta = await sharp(masterBuffer).metadata();
  console.log(`Master mark with padding: ${masterMeta.width}x${masterMeta.height}`);

  // 2. Generate responsive WebP & PNG fallback
  await sharp(masterBuffer)
    .resize({ width: 128 })
    .webp({ quality: 80, effort: 6 })
    .toFile(path.join(BRAND_DIR, 'catalyst-mark-128.webp'));

  await sharp(masterBuffer)
    .resize({ width: 256 })
    .webp({ quality: 78, effort: 6 })
    .toFile(path.join(BRAND_DIR, 'catalyst-mark-256.webp'));

  // 512 PNG with palette
  const png512 = await sharp(masterBuffer)
    .resize({ width: 512 })
    .png({ palette: true, quality: 70, compressionLevel: 9, effort: 10 })
    .toBuffer();
  await fs.writeFile(path.join(BRAND_DIR, 'catalyst-mark-512.png'), png512);

  // 512 WebP (<40KB)
  await sharp(png512)
    .webp({ quality: 55, alphaQuality: 85, effort: 6 })
    .toFile(path.join(BRAND_DIR, 'catalyst-mark-512.webp'));

  // 3. Favicons
  const fav16 = await sharp(masterBuffer)
    .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await fs.writeFile(path.join(BRAND_DIR, 'favicon-16.png'), fav16);

  const fav32 = await sharp(masterBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await fs.writeFile(path.join(BRAND_DIR, 'favicon-32.png'), fav32);

  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: fav16 },
    { width: 32, height: 32, buffer: fav32 },
  ]);
  await fs.writeFile(path.join(BRAND_DIR, 'favicon.ico'), icoBuffer);
  await fs.writeFile(path.join(PUBLIC_DIR, 'favicon.ico'), icoBuffer);

  // 4. Apple Touch Icon (180x180, cream background #F8F3E9, 14% padding)
  const appleInnerSize = Math.round(180 * (1 - 0.14 * 2)); // ~130px
  const appleInner = await sharp(masterBuffer)
    .resize(appleInnerSize, appleInnerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 248, g: 243, b: 233, alpha: 1 }, // #F8F3E9
    },
  })
    .composite([{ input: appleInner, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(BRAND_DIR, 'apple-touch-icon-180.png'));

  // 5. App Icons (192x192 & 512x512 with safe padding on cream)
  for (const dim of [192, 512]) {
    const inner = Math.round(dim * 0.72);
    const markResized = await sharp(masterBuffer)
      .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: {
        width: dim,
        height: dim,
        channels: 4,
        background: { r: 248, g: 243, b: 233, alpha: 1 },
      },
    })
      .composite([{ input: markResized, gravity: 'centre' }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(BRAND_DIR, `icon-${dim}.png`));
  }

  // 6. Social OG Image (1200x630, #F8F3E9 cream, Mark + Wordmark + subtitle)
  // Let's create an elegant composition:
  // Height 630, Width 1200.
  // Left: Mark (380x380)
  // Right: Wordmark (height ~140px)
  // And a nice subtle Japanese wave / framing
  const ogMarkSize = 360;
  const ogMark = await sharp(masterBuffer)
    .resize(ogMarkSize, ogMarkSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const ogWordmark = await sharp(WORDMARK_PATH)
    .resize({ height: 130 })
    .toBuffer();

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 248, g: 243, b: 233, alpha: 1 }, // #F8F3E9
    },
  })
    .composite([
      // Mark on the left
      { input: ogMark, left: 160, top: 135 },
      // Wordmark on the right
      { input: ogWordmark, left: 580, top: 250 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(BRAND_DIR, 'og-image-1200x630.png'));

  // 7. Write site.webmanifest
  const manifest = {
    name: 'Catalyst 7.0 - AIESEC in SLIIT',
    short_name: 'Catalyst 7.0',
    description: 'Catalyst 7.0 - The premier youth leadership conference by AIESEC in SLIIT.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F3E9',
    theme_color: '#C9362B',
    icons: [
      {
        src: '/assets/brand/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/assets/brand/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/assets/brand/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
  await fs.writeFile(
    path.join(PUBLIC_DIR, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );

  // 8. Log sizes
  const files = await fs.readdir(BRAND_DIR);
  console.log('\nGenerated Brand Assets in public/assets/brand/:');
  for (const f of files) {
    const stat = await fs.stat(path.join(BRAND_DIR, f));
    console.log(` - ${f}: ${(stat.size / 1024).toFixed(1)} KB`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
