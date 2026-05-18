import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import sharp from 'sharp';
import type { ScreenshotOptions } from '../types.js';
import { ensureParentDir } from '../utils/fs.js';

export async function captureHtml(html: string, options: ScreenshotOptions): Promise<void> {
  await ensureParentDir(options.outPath);
  if (options.debugHtmlPath) {
    await ensureParentDir(options.debugHtmlPath);
    await writeFile(options.debugHtmlPath, html, 'utf8');
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: {
        width: options.width,
        height: 1200,
      },
      deviceScaleFactor: options.scale,
    });

    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images).map((img) => {
          if (img.complete) return null;
          return img.decode().catch(() => null);
        }),
      );
    });

    const capture = page.locator('[data-capture]').first();
    await capture.waitFor({ state: 'visible', timeout: 10_000 });

    const box = await capture.boundingBox();
    if (box) {
      const desiredHeight = Math.ceil(Math.min(Math.max(box.height + 80, 1200), 16000));
      await page.setViewportSize({ width: options.width, height: desiredHeight });
    }

    const pngBuffer = await capture.screenshot({
      type: 'png',
      animations: 'disabled',
      caret: 'hide',
      omitBackground: options.transparent,
      scale: 'device',
    });

    if (options.format === 'webp') {
      await sharp(pngBuffer).webp({ quality: options.quality }).toFile(options.outPath);
    } else {
      await writeFile(options.outPath, pngBuffer);
    }
  } finally {
    await browser.close();
  }
}
