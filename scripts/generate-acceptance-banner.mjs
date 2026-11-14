import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Requires FFmpeg and ImageMagick. Only the small vector petals move;
// the official logo remains unchanged throughout the loop.
const root = fileURLToPath(new URL('../', import.meta.url));
const work = mkdtempSync(join(tmpdir(), 'catalyst-email-'));
const output = resolve(root, 'public/assets/brand/catalyst-interest-logo-sakura.gif');
try {
  const petal = join(work, 'petal.svg');
  writeFileSync(petal, `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="-9 -10 18 20"><defs><linearGradient id="pink" x2="0.3" y2="1"><stop stop-color="#ffe2df"/><stop offset="1" stop-color="#d36b78"/></linearGradient></defs><path d="M0 8C-8 3-8-4-3-7L0-4 3-7C8-4 8 3 0 8Z" fill="url(#pink)" fill-opacity=".85"/><path d="M0 5Q1 0 0-3" stroke="#ffe8df" stroke-width=".6" fill="none"/></svg>`);
  const sprite = join(work, 'petal.png');
  execFileSync('magick', ['-background', 'none', petal, sprite]);
  const petals = 9;
  const filters = [
    'color=c=0xfffaf1:s=600x315:r=12:d=6[paper]',
    '[0:v]trim=duration=6,scale=500:250:flags=lanczos,setsar=1,format=rgba[logo]',
    '[paper][logo]overlay=x=50:y=28:shortest=1[base]',
    `[1:v]trim=duration=6,split=${petals}${Array.from({ length: petals }, (_, i) => `[petal${i}]`).join('')}`,
  ];
  for (let i = 0; i < petals; i++) {
    const size = 8 + (i % 4) * 2;
    const x = [24, 52, 80, 520, 548, 576, 35, 560, 535][i];
    const phase = (i * 0.71).toFixed(2);
    filters.push(`[petal${i}]scale=${size}:-1,rotate='${phase}+.45*sin(2*PI*t/6+${phase})':ow=24:oh=24:c=none[s${i}]`);
    // Wrapping takes place above/below the crop; positions repeat every 6s.
    filters.push(`[${i ? `layer${i - 1}` : 'base'}][s${i}]overlay=x='${x}+14*sin(2*PI*t/6+${phase})':y='mod(t*59+${i * 43},354)-28':shortest=1[layer${i}]`);
  }
  filters.push(`[layer${petals - 1}]split[a][b]`, '[a]palettegen=stats_mode=diff:max_colors=256[p]', '[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle[out]');
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-loop', '1', '-framerate', '12',
    '-i', resolve(root, 'public/assets/catalyst_7_logo.png'),
    '-loop', '1', '-framerate', '12', '-i', sprite,
    '-filter_complex', filters.join(';'), '-map', '[out]', '-t', '6', '-loop', '0', output,
  ], { timeout: 120000 });
  console.log(`${output} (${Math.round(statSync(output).size / 1024)} KiB)`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
