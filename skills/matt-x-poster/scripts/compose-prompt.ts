#!/usr/bin/env bun

import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type Args = {
  contextPath: string;
  style: string;
  styleFilePath?: string;
  outPath?: string;
};

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const referenceIndexPath = path.join(skillDir, "references", "visual-reference-index.md");

    const contextText = await readFile(args.contextPath, "utf8");
    const context = JSON.parse(contextText) as Record<string, unknown>;
    const styleSource = await loadStyleSource(args, skillDir);
    const referenceIndex = await readFile(referenceIndexPath, "utf8");
    const prompt = composePrompt({
      context,
      contextPath: path.resolve(args.contextPath),
      style: styleSource.label,
      styleText: styleSource.text,
      referenceIndex,
      skillDir,
    });

    const outPath = args.outPath ?? path.join(path.dirname(path.resolve(args.contextPath)), "final-prompt.md");
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, prompt, "utf8");
    console.log(JSON.stringify({ ok: true, prompt_path: outPath }, null, 2));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(JSON.stringify({ ok: false, error: message }, null, 2));
    process.exit(1);
  }
}

async function loadStyleSource(args: Args, skillDir: string): Promise<{ label: string; text: string }> {
  const stylePath = resolveStylePath(args, skillDir);
  try {
    return {
      label: args.style,
      text: await readFile(stylePath, "utf8"),
    };
  } catch (error) {
    const missingRuntimeStyle = isRuntimeStyle(args.style) && !args.styleFilePath;
    const runtimeGuide =
      args.style === "film-dynamic"
        ? "references/film-dynamic-style-guide.md"
        : "references/dynamic-style-guide.md";
    const runtimeFile =
      args.style === "film-dynamic"
        ? "film-dynamic-style.md"
        : "dynamic-style.md";
    if (missingRuntimeStyle) {
      throw new Error(
        `${args.style} style file not found: ${stylePath}. Create ${runtimeFile} from ${runtimeGuide} before composing with --style ${args.style}.`,
      );
    }
    throw error;
  }
}

function resolveStylePath(args: Args, skillDir: string): string {
  if (args.styleFilePath) return args.styleFilePath;
  if (args.style === "dynamic") {
    return path.join(path.dirname(args.contextPath), "dynamic-style.md");
  }
  if (args.style === "film-dynamic") {
    return path.join(path.dirname(args.contextPath), "film-dynamic-style.md");
  }
  return path.join(skillDir, "prompts", `${args.style}.md`);
}

function isRuntimeStyle(style: string): boolean {
  return style === "dynamic" || style === "film-dynamic";
}

function composePrompt(input: {
  context: Record<string, unknown>;
  contextPath: string;
  style: string;
  styleText: string;
  referenceIndex: string;
  skillDir: string;
}): string {
  const compactContext = JSON.stringify(input.context, null, 2);
  const guards = Array.isArray(input.context.prompt_guards)
    ? input.context.prompt_guards.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
  const guardText = guards.length > 0 ? guards.map((item) => `- ${item}`).join("\n") : "- No additional guards.";
  const avatarLockAddendum = buildAvatarLockAddendum(input.context);
  const requiredInputImages = buildRequiredInputImages(input.context);
  const articleSummaryGuidance = buildArticleSummaryGuidance(input.context);
  const styleSpecificFinalRequirements = buildStyleSpecificFinalRequirements(input.style);
  const criticalAvatarInstruction = buildCriticalAvatarInstruction(input.context);

  return `# Matt X Poster Image Prompt

Use this prompt with imagegen to create a cinematic poster from real X/FxEmbed data.

## Factual Content Source

Use only the following JSON as factual content. Preserve exact names, handles, post text, article title, visible media relationships, and source URL.

Context path: ${input.contextPath}

\`\`\`json
${compactContext}
\`\`\`

${requiredInputImages}

## Hard Factual Guards

${guardText}

${articleSummaryGuidance}

${avatarLockAddendum}

## Visual Reference Assets

Reference assets live under: ${input.skillDir}

Important: bundled reference images live only in assets/reference-screenshots/ and are true X app screenshots. FxBrief references under assets/fxbrief-reference/ are HTML-only. Use all bundled references only for X mobile UI spacing, hierarchy, card geometry, profile header proportions, list item rhythm, and article/detail layout. Do not quote or reuse screenshot text, screenshot images, metrics, or media as content in the generated poster.

${input.referenceIndex}

## Selected Prompt Structure: ${input.style}

${input.styleText}

## Final Generation Requirements

- Generate one polished, high-impact poster image.
- Do not lock the poster to one fixed aspect ratio unless the user explicitly requested one. For long source text, expand both width and height and use a broad readable layout; do not make a narrow extra-tall strip.
- The poster must be based on the real X data in the JSON above.
- Render the exact X profile name, handle, post text, article title, and source relationship from the JSON.
- If the JSON contains post media, article cover media, or local media paths, render that media as the visual content associated with the elevated hero composition.
- If local avatar or media paths are present, treat them as strict visual references. Use the current avatar asset id and file listed in Current Avatar Binding for the local avatar; preserve attached-media content as closely as possible.
- If a local avatar path is present and the selected prompt structure renders the avatar, the avatar must look like the same source bitmap from the current avatar asset placed into the selected structure. Do not redraw, restyle, reinterpret, or create a similar-looking person; avatar placement, scale, crop, and surface are defined only by the selected prompt structure.
- Render source text with crisp, readable, high-contrast typography. No blurry, warped, over-reflective, or unreadable text.
- Use profile count strings exactly from profile.display_counts.text, including K/M compact notation; do not add posts count to the profile count row.
- Do not invent usernames, metrics, badges, links, source quotes, article titles, or images.
${styleSpecificFinalRequirements}
- Keep the design cinematic and editorial, not a plain screenshot.
- Keep the X UI references recognizable through structure, spacing, hierarchy, and card proportions, while avoiding direct reuse of any bundled reference content.
${criticalAvatarInstruction}
`;
}

function buildStyleSpecificFinalRequirements(style: string): string {
  if (style !== "film-dynamic") return "";
  return [
    "- For film-dynamic, stage a classic on-screen movie scene mechanism that embeds the X content into the key object, reveal, screen, paper, wall, doorway, table, or prop. Do not turn it into a generic film-production set, director board, camera crew, rehearsal, or backstage shoot.",
    "- If the film-dynamic runtime module explicitly includes one optional fictional scene line, render it only as non-factual cinematic dialogue/subtitle and never as X content, source dialogue, or a quote from the source author.",
  ].join("\n");
}

function buildRequiredInputImages(context: Record<string, unknown>): string {
  const avatar = currentAvatarReference(context);
  if (!avatar) return "";

  return `## Required Input Images

Before calling imagegen, load the local avatar file with the \`view_image\` tool so the image pixels are present in the conversation context. Do not rely on the file path text alone.

- Input image: current X avatar reference
- Local file to load with \`view_image\`: ${avatar.path}
- Owner: ${avatar.ownerText}
- Asset id: ${avatar.assetId}
- Role: exact visual source for the visible X author/profile avatar only.
- Use this loaded input image as the avatar bitmap reference. Do not use it as a style reference, scene reference, character concept, face prompt, lighting guide, or media panel.
- If the selected prompt structure renders an avatar, reproduce the loaded input image inside the circular X avatar area as a protected flat bitmap sticker. Keep attached post/article media separate from this avatar reference.
`;
}

function buildAvatarLockAddendum(context: Record<string, unknown>): string {
  const avatar = currentAvatarReference(context);
  if (!avatar) return "";

  return `## Current Avatar Binding

Because a local profile avatar exists, this generation has one current avatar asset. Bind the visible X avatar only to this asset.

- Current avatar asset id: ${avatar.assetId}
- Current avatar owner: ${avatar.ownerText}
- Current avatar file: ${avatar.path}
- Input image label: current X avatar reference
- Treat the loaded input image named "current X avatar reference" as an image asset to visually reproduce, not as a textual portrait idea to reconstruct.
- Whenever the selected prompt structure renders an avatar for ${avatar.ownerText}, it must look like the same source bitmap from the current X avatar reference placed into that structure.
- Treat the avatar circle as a protected flat bitmap island / small circular printed bitmap sticker. Scene style, lighting, material effects, and painterly texture may surround the avatar, but they must not enter the avatar circle or alter its interior.
- Keep the avatar interior visually unchanged from the current avatar asset: same subject, same internal crop except for the selected circular mask, same expression, same face angle, same background, and same colors.
- Ignore any avatar reference, generated poster, profile image, or avatar asset from earlier generations in this chat or workspace. Do not substitute an earlier user's avatar.
- Do not create a similar-looking avatar. Do not infer, redraw, beautify, relight, repaint, upscale into a new drawing, simplify, age-shift, change expression, change face angle, change hand gesture, replace the subject, or change the background inside the avatar.
- Do not rely on verbal appearance traits for the avatar. If any task-specific notes describe the avatar's face, pose, hair, clothing, lighting, or mood, ignore those notes and match the current avatar asset instead.
- If post media, article media, screenshots, or other local media contain faces or portraits, those faces are attached media only. Never use any face from media references as the circular author/profile avatar.
- If high fidelity is difficult, keep the avatar smaller, flatter, cleaner-edged, and more obviously pasted as a bitmap UI sticker instead of stylizing it into a new portrait.
- Avatar placement, scale, crop, and physical surface are defined only by the selected prompt structure; this addendum controls identity fidelity only.
`;
}

function buildCriticalAvatarInstruction(context: Record<string, unknown>): string {
  const avatar = currentAvatarReference(context);
  if (!avatar) return "";

  return `
## Critical Avatar Instruction

This final avatar instruction has the highest priority for any visible avatar.

- The local file has already been loaded with \`view_image\` as: Input image: current X avatar reference
- Source file: ${avatar.path}
- This input image is the real source avatar for ${avatar.ownerText}. Current avatar asset id: ${avatar.assetId}
- When an avatar is needed, reproduce the loaded input image as faithfully as possible inside the circular avatar area. Treat it as the visual source image, not as metadata, not as a filename hint, and not as a prompt idea.
- Avatar fidelity has higher priority than lunar lighting, 3D depth, cloth weave, paper texture, glass reflection, painterly style, or any other scene material effect.
- Do not invent a similar-looking person, generic portrait, profile-photo substitute, icon, silhouette, mission patch, helmet reflection, or face from attached media.
- Do not redraw, beautify, relight, recolor, restyle, change the subject, change the face angle, change the expression, change the internal crop, change the background, or reinterpret the avatar to match the scene.
- If exact reproduction is difficult, make the avatar smaller, flatter, cleaner-edged, and more obviously pasted as the original bitmap sticker. A small faithful avatar is better than a large stylized wrong face.
- If the source avatar image cannot be used, do not generate an alternate human face as a substitute; leave the avatar area as a neutral placeholder rather than creating the wrong person.
`;
}

function currentAvatarReference(context: Record<string, unknown>): { path: string; assetId: string; ownerText: string } | undefined {
  const profile = asRecord(context.profile);
  const assets = asRecord(context.assets);
  const avatarPath =
    asString(profile.avatar_local_path) ??
    asString(assets.profile_avatar_path);

  if (!avatarPath) return undefined;

  const avatarAssetId =
    asString(profile.avatar_asset_id) ??
    asString(assets.profile_avatar_id) ??
    buildFallbackAvatarAssetId(context, avatarPath);
  const ownerHandle = avatarOwnerHandle(context);
  const ownerText = ownerHandle ? `@${ownerHandle}` : "the current X profile";

  return {
    path: avatarPath,
    assetId: avatarAssetId,
    ownerText,
  };
}

function buildArticleSummaryGuidance(context: Record<string, unknown>): string {
  if (asString(context.source_type) !== "article") return "";

  const article = asRecord(context.article);
  const bodyPath = asString(article.body_text_path);
  if (!bodyPath) return "";

  return `## Article Summary Guidance

This source is an X Article with body text saved outside card-context.json.

- Article body text file: ${bodyPath}
- Before calling imagegen, read that file and append a \`## Summary\` section with 3-5 short bullets.
- Default Summary language: match the article body's primary language.
- If the user explicitly requests a language while invoking the skill, write the Summary bullets in that requested language.
- Do not paste the full article body into the imagegen prompt and do not ask imagegen to render the full body.
- When a \`## Summary\` section is present, use those bullets as compact secondary article points only when the selected prompt structure has room. Keep the exact article title, preview, author, cover/media, and source relationship as the factual anchors.
`;
}

function buildFallbackAvatarAssetId(context: Record<string, unknown>, avatarPath: string): string {
  const handle = sanitizeAssetToken(avatarOwnerHandle(context) ?? "unknown");
  const source = sanitizeAssetToken(avatarSourceToken(context));
  const profile = asRecord(context.profile);
  const assets = asRecord(context.assets);
  const avatarUrl = asString(profile.avatar_url) ?? asString(assets.profile_avatar_url) ?? "";
  const hash = shortHash([avatarUrl, avatarPath, asString(context.source_url) ?? "", asString(context.source_input) ?? ""].join("\n"));
  return `x-avatar-${handle}-${source}-${hash}`;
}

function avatarOwnerHandle(context: Record<string, unknown>): string | undefined {
  const profile = asRecord(context.profile);
  const post = asRecord(context.post);
  const article = asRecord(context.article);
  const postAuthor = asRecord(post.author);
  const articleAuthor = asRecord(article.author);
  return asString(profile.handle) ?? asString(postAuthor.handle) ?? asString(articleAuthor.handle);
}

function avatarSourceToken(context: Record<string, unknown>): string {
  const post = asRecord(context.post);
  const article = asRecord(context.article);
  return (
    asString(post.id) ??
    asString(article.source_post_id) ??
    asString(article.article_id) ??
    asString(context.source_type) ??
    asString(context.source_url) ??
    asString(context.source_input) ??
    "profile"
  );
}

function sanitizeAssetToken(value: string | undefined): string {
  const token = (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return token || "unknown";
}

function shortHash(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function parseArgs(argv: string[]): Args {
  const args: Partial<Args> = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = () => {
      const value = argv[++i];
      if (!value) throw new Error(`Missing value for ${token}`);
      return value;
    };

    if (token === "--context" || token === "-c") args.contextPath = path.resolve(next());
    else if (token === "--style" || token === "-s") args.style = next();
    else if (token === "--style-file") args.styleFilePath = path.resolve(next());
    else if (token === "--out" || token === "-o") args.outPath = path.resolve(next());
    else throw new Error(`Unknown argument: ${token}`);
  }

  if (!args.contextPath) throw new Error("Missing --context path.");
  if (!args.style) args.style = args.styleFilePath ? "dynamic" : "profile-portal-3d";
  return args as Args;
}

main();
