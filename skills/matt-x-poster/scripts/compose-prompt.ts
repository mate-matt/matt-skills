#!/usr/bin/env bun

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type Args = {
  contextPath: string;
  style: string;
  outPath?: string;
};

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const stylePath = path.join(skillDir, "prompts", `${args.style}.md`);
    const referenceIndexPath = path.join(skillDir, "references", "visual-reference-index.md");

    const contextText = await readFile(args.contextPath, "utf8");
    const context = JSON.parse(contextText) as Record<string, unknown>;
    const styleText = await readFile(stylePath, "utf8");
    const referenceIndex = await readFile(referenceIndexPath, "utf8");
    const prompt = composePrompt({
      context,
      contextPath: path.resolve(args.contextPath),
      style: args.style,
      styleText,
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

  return `# Matt X Poster Image Prompt

Use this prompt with imagegen to create a promotional poster from real X/FxEmbed data.

## Factual Content Source

Use only the following JSON as factual content. Preserve exact names, handles, post text, article title, visible media relationships, and source URL.

Context path: ${input.contextPath}

\`\`\`json
${compactContext}
\`\`\`

## Hard Factual Guards

${guardText}

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
- If local avatar or media paths are present, treat them as strict visual references. The avatar should look like a direct circular crop of the local avatar image, not a reimagined portrait; preserve attached-media content as closely as possible.
- Render source text with crisp, readable, high-contrast typography. No blurry, warped, over-reflective, or unreadable text.
- Use profile count strings exactly from profile.display_counts.text, including K/M compact notation; do not add posts count to the profile count row.
- Do not invent usernames, metrics, badges, links, quotes, article titles, or images.
- Keep the design promotional and cinematic, not a plain screenshot.
- Keep the X UI references recognizable through structure, spacing, hierarchy, and card proportions, while avoiding direct reuse of any bundled reference content.
`;
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
    else if (token === "--out" || token === "-o") args.outPath = path.resolve(next());
    else throw new Error(`Unknown argument: ${token}`);
  }

  if (!args.contextPath) throw new Error("Missing --context path.");
  if (!args.style) args.style = "profile-portal-3d";
  return args as Args;
}

main();
