import { mkdir } from 'node:fs/promises';
import path from 'node:path';

export async function ensureParentDir(filePath: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
}

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export function toAbsolutePath(filePath: string, cwd = process.cwd()): string {
  if (path.isAbsolute(filePath)) return filePath;
  return path.join(cwd, filePath);
}
