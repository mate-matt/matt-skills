import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import type { Page } from 'playwright';
import sharp from 'sharp';
import type { LongScreenshotOptions, LongScreenshotResult, OutputFormat, ScreenshotOptions } from '../types.js';
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

export async function captureHtmlLong(html: string, options: LongScreenshotOptions): Promise<LongScreenshotResult> {
  if (options.writeLong) await ensureParentDir(options.outPath);
  if (options.debugHtmlPath) {
    await ensureParentDir(options.debugHtmlPath);
    await writeFile(options.debugHtmlPath, html, 'utf8');
  }
  const browser = await chromium.launch({ headless: true });
  try {
    const initialHeight = Math.min(Math.max(options.sliceHeight ?? 1400, 1200), 8000);
    const page = await browser.newPage({
      viewport: {
        width: options.width,
        height: initialHeight,
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
    if (!box) throw new Error('Could not measure capture element.');

    const cssHeight = Math.ceil(box.height);
    const singleCaptureLimit = 16_000;
    const requestedSliceHeight = options.sliceHeight ? Math.max(1, Math.round(options.sliceHeight)) : undefined;

    if (!requestedSliceHeight && cssHeight <= singleCaptureLimit) {
      await page.setViewportSize({ width: options.width, height: Math.min(Math.max(cssHeight + 80, 1200), singleCaptureLimit) });
      const pngBuffer = await capture.screenshot({
        type: 'png',
        animations: 'disabled',
        caret: 'hide',
        omitBackground: options.transparent,
        scale: 'device',
      });

      if (options.writeLong) {
        await writeImage(pngBuffer, options.outPath, options.format, options.quality);
      }

      return {
        outPath: options.writeLong ? options.outPath : undefined,
        slicePaths: [],
        cssHeight,
      };
    }

    const sliceCssHeight = Math.min(requestedSliceHeight ?? 8000, 8000);
    const pngSlices: Buffer[] = [];
    const slicePaths: string[] = [];

    for (let offset = 0, index = 0; offset < cssHeight; offset += sliceCssHeight, index += 1) {
      const height = Math.min(sliceCssHeight, cssHeight - offset);
      const pngBuffer = await captureSlice(page, {
        offset,
        height,
        width: Math.ceil(box.width),
        transparent: options.transparent,
      });

      pngSlices.push(pngBuffer);
      const slicePath = options.slicePathForIndex?.(index);
      if (slicePath) {
        await ensureParentDir(slicePath);
        await writeImage(pngBuffer, slicePath, options.format, options.quality);
        slicePaths.push(slicePath);
      }
    }

    if (options.writeLong) {
      const joined = pngSlices.length === 1 ? pngSlices[0] : await joinPngSlices(pngSlices, options.transparent);
      if (!joined) throw new Error('Could not assemble long screenshot.');
      await writeImage(joined, options.outPath, options.format, options.quality);
    }

    return {
      outPath: options.writeLong ? options.outPath : undefined,
      slicePaths,
      cssHeight,
    };
  } finally {
    await browser.close();
  }
}

async function captureSlice(
  page: Page,
  options: {
    offset: number;
    height: number;
    width: number;
    transparent: boolean;
  },
): Promise<Buffer> {
  await page.setViewportSize({ width: options.width, height: options.height });
  await page.evaluate(({ offset, height, width }) => {
    const capture = document.querySelector<HTMLElement>('[data-capture]');
    if (!capture) throw new Error('Missing capture element.');

    let slice = document.querySelector<HTMLElement>('[data-capture-slice]');
    if (!slice) {
      slice = document.createElement('div');
      slice.setAttribute('data-capture-slice', '');
      document.body.innerHTML = '';
      document.body.appendChild(slice);
      slice.appendChild(capture);
    }

    Object.assign(document.documentElement.style, {
      margin: '0',
      padding: '0',
    });
    Object.assign(document.body.style, {
      margin: '0',
      padding: '0',
      overflow: 'hidden',
      background: 'transparent',
      width: `${width}px`,
      height: `${height}px`,
    });
    Object.assign(slice.style, {
      position: 'relative',
      width: `${width}px`,
      height: `${height}px`,
      overflow: 'hidden',
      background: 'transparent',
    });
    Object.assign(capture.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: `${width}px`,
      transform: `translateY(-${offset}px)`,
      transformOrigin: 'top left',
    });
  }, options);

  const slice = page.locator('[data-capture-slice]').first();
  return slice.screenshot({
    type: 'png',
    animations: 'disabled',
    caret: 'hide',
    omitBackground: options.transparent,
    scale: 'device',
  });
}

async function joinPngSlices(slices: Buffer[], transparent: boolean): Promise<Buffer | undefined> {
  if (slices.length === 0) return undefined;

  const metadata = await Promise.all(slices.map((slice) => sharp(slice).metadata()));
  const width = metadata.reduce((max, item) => Math.max(max, item.width ?? 0), 0);
  const height = metadata.reduce((sum, item) => sum + (item.height ?? 0), 0);
  if (width <= 0 || height <= 0) return undefined;

  let top = 0;
  const composite = slices.map((input, index) => {
    const item = metadata[index];
    const currentTop = top;
    top += item?.height ?? 0;
    return { input, left: 0, top: currentTop };
  });

  return sharp({
    create: {
      width,
      height,
      channels: transparent ? 4 : 3,
      background: transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 255, g: 255, b: 255 },
    },
  })
    .composite(composite)
    .png()
    .toBuffer();
}

async function writeImage(buffer: Buffer, outPath: string, format: OutputFormat, quality: number): Promise<void> {
  if (format === 'webp') {
    await sharp(buffer).webp({ quality }).toFile(outPath);
    return;
  }

  await writeFile(outPath, buffer);
}
