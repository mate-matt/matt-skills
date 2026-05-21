#!/usr/bin/env node
import { Command } from 'commander';
import { exportArticleCommand } from './commands/article.js';
import { renderArticleShotCommand } from './commands/articleShot.js';
import { fetchJsonCommand } from './commands/json.js';
import { renderPostCommand } from './commands/post.js';
import { renderProfileCommand } from './commands/profile.js';
import { renderQuoteWallCommand } from './commands/quotes.js';
import { renderThreadCommand } from './commands/thread.js';

const program = new Command();

program
  .name('fxbrief')
  .description('Render clean local news materials from FxEmbed-powered X/Twitter data.')
  .version('0.2.4');

addPostCommand(program);
addShortcutPostCommand(program, 'post-mobile', 'Render a 430px mobile-style X post card.', 'post-mobile');
addShortcutPostCommand(program, 'post-clean', 'Render an editorial source quotation card.', 'post-clean');
addThreadCommand(program);
addQuoteWallCommand(program);
addArticleCommand(program);
addArticleShotCommand(program);
addJsonCommand(program);
addProfileCommand(program);

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});

function addCommonOptions(command: Command): Command {
  return command
    .option('-o, --out <path>', 'Output file path, or output directory when no extension is provided.')
    .option('--format <png|webp>', 'Output image format.', 'png')
    .option('--width <px>', 'Capture width in CSS pixels.')
    .option('--scale <number>', 'Device scale factor for high-DPI output.', '2')
    .option('--quality <number>', 'WebP quality, 1-100.', '92')
    .option('--theme <light|dark>', 'Visual theme.', 'light')
    .option('--timezone <tz>', 'Timezone used for rendered timestamps.', 'Asia/Shanghai')
    .option('--lang <code>', 'Request FxEmbed translation for the target language, e.g. zh-cn or en.')
    .option('--translated-text', 'Render translated post body text instead of the original when --lang returns a translation.')
    .option('--media <none|first|grid|mosaic|full>', 'Media rendering mode.')
    .option('--stats', 'Show engagement metrics.')
    .option('--hide-stats', 'Hide engagement metrics.')
    .option('--show-subscribe', 'Show the post-mobile Subscribe button when you know the account offers subscriptions.')
    .option('--hide-source-footer', 'Hide provenance footer.')
    .option('--show-translation', 'Show translation block when FxEmbed returns one.')
    .option('--transparent', 'Capture with transparent background.')
    .option('--cache-dir <path>', 'Directory for downloaded image cache.', 'cache/assets')
    .option('--debug-html', 'Write the intermediate HTML next to the image.');
}

function addPostCommand(parent: Command): void {
  const command = addCommonOptions(
    new Command('post')
      .description('Render a single post with a selected template.')
      .argument('<url-or-id>', 'X/Twitter status URL or numeric status id.')
      .option('--template <post-mobile|post-clean>', 'Post template to render.', 'post-mobile')
      .option('--fixture <path>', 'Read a saved FxEmbed JSON response instead of calling the API.'),
  );

  command.action(async (input: string, options: Record<string, unknown>) => {
    const template = options.template === 'post-clean' ? 'post-clean' : 'post-mobile';
    const out = await renderPostCommand(input, template, options);
    console.log(out);
  });

  parent.addCommand(command);
}

function addShortcutPostCommand(parent: Command, name: 'post-mobile' | 'post-clean', description: string, template: 'post-mobile' | 'post-clean'): void {
  const command = addCommonOptions(
    new Command(name)
      .description(description)
      .argument('<url-or-id>', 'X/Twitter status URL or numeric status id.')
      .option('--fixture <path>', 'Read a saved FxEmbed JSON response instead of calling the API.'),
  );

  command.action(async (input: string, options: Record<string, unknown>) => {
    const out = await renderPostCommand(input, template, options);
    console.log(out);
  });

  parent.addCommand(command);
}

function addThreadCommand(parent: Command): void {
  const command = addCommonOptions(
    new Command('thread-vertical')
      .description('Render an unrolled X/Twitter thread as a vertical long image.')
      .argument('<url-or-id>', 'X/Twitter status URL or numeric status id.')
      .option('--max-posts <number>', 'Maximum posts to render from the thread.', '6')
      .option('--fixture <path>', 'Read a saved FxEmbed thread JSON response instead of calling the API.'),
  );

  command.action(async (input: string, options: Record<string, unknown>) => {
    const out = await renderThreadCommand(input, options);
    console.log(out);
  });

  parent.addCommand(command);
}

function addQuoteWallCommand(parent: Command): void {
  const command = addCommonOptions(
    new Command('quote-wall')
      .description('Render quote posts as a reaction wall.')
      .argument('<url-or-id>', 'X/Twitter status URL or numeric status id.')
      .option('--count <number>', 'Number of quote posts to request.', '12')
      .option('--columns <number>', 'Number of wall columns.', '2'),
  );

  command.action(async (input: string, options: Record<string, unknown>) => {
    const out = await renderQuoteWallCommand(input, options);
    console.log(out);
  });

  parent.addCommand(command);
}

function addArticleCommand(parent: Command): void {
  const command = new Command('article-md')
    .description('Export an X Article to Markdown with cover and inline media assets.')
    .argument('<url-or-id>', 'X/Twitter status URL or numeric status id containing an X Article.')
    .option('-o, --out <dir>', 'Output directory. Defaults to output/articles/<status-id>.')
    .option('--assets <local|remote|none>', 'How image assets should be referenced.', 'local')
    .option('--lang <code>', 'Request FxEmbed with a target language when available.')
    .option('--fixture <path>', 'Read a saved FxEmbed article JSON response instead of calling the API.')
    .option('--no-raw', 'Do not write raw.fxembed.json.')
    .option('--no-metadata', 'Do not write metadata.json.')
    .option('--no-title', 'Do not prepend the article title as a Markdown H1.')
    .option('--no-cover', 'Do not include the cover image in article.md.');

  command.action(async (input: string, options: Record<string, unknown>) => {
    const out = await exportArticleCommand(input, options);
    console.log(out);
  });

  parent.addCommand(command);
}

function addArticleShotCommand(parent: Command): void {
  const command = new Command('article-shot')
    .description('Render an X Article as a local long screenshot.')
    .argument('<url-or-id>', 'X/Twitter status URL or numeric status id containing an X Article.')
    .option('-o, --out <path>', 'Output image path, or output directory when no extension is provided.')
    .option('--style <article-x|article-clean>', 'Article screenshot style.', 'article-x')
    .option('--format <png|webp>', 'Output image format.', 'png')
    .option('--width <px>', 'Capture width in CSS pixels.', '540')
    .option('--scale <number>', 'Device scale factor for high-DPI output.', '2')
    .option('--quality <number>', 'WebP quality, 1-100.', '92')
    .option('--theme <light|dark>', 'Visual theme.', 'light')
    .option('--timezone <tz>', 'Timezone used for rendered timestamps.', 'Asia/Shanghai')
    .option('--lang <code>', 'Request FxEmbed with a target language when available.')
    .option('--slice-height <px>', 'Also export platform-friendly image slices at this CSS-pixel height.')
    .option('--fixture <path>', 'Read a saved FxEmbed article JSON response instead of calling the API.')
    .option('--hide-source-footer', 'Hide provenance footer.')
    .option('--hide-actions', 'Hide the X-style action row and header actions.')
    .option('--no-cover', 'Do not render the article cover image.')
    .option('--transparent', 'Capture with transparent background.')
    .option('--cache-dir <path>', 'Directory for downloaded image cache.', 'cache/assets')
    .option('--debug-html', 'Write the intermediate HTML next to the image.');

  command.action(async (input: string, options: Record<string, unknown>) => {
    const out = await renderArticleShotCommand(input, options);
    console.log(out);
  });

  parent.addCommand(command);
}

function addJsonCommand(parent: Command): void {
  const command = new Command('json')
    .alias('raw-json')
    .description('Fetch FxEmbed JSON for an X/Twitter post, thread, or quote list.')
    .argument('<url-or-id>', 'X/Twitter status URL or numeric status id.')
    .option('-o, --out <path>', 'Write JSON to a file path, or to fxembed-<kind>-<id>.json inside a directory.')
    .option('--kind <post|thread|quotes>', 'FxEmbed data to fetch.', 'post')
    .option('--lang <code>', 'Request FxEmbed translation for the target language, e.g. zh-cn or en.')
    .option('--count <number>', 'Quote count when --kind quotes is used.', '20')
    .option('--cursor <value>', 'Quote pagination cursor when --kind quotes is used.')
    .option('--no-about-account', 'Do not request expanded account metadata for post/thread responses.')
    .option('--fixture <path>', 'Read a saved FxEmbed JSON response instead of calling the API.')
    .option('--normalized', 'Output fxbrief normalized JSON instead of the raw FxEmbed response.')
    .option('--compact', 'Print or write compact JSON without indentation.');

  command.action(async (input: string, options: Record<string, unknown>) => {
    const result = await fetchJsonCommand(input, options);
    process.stdout.write(result.value);
    if (result.type === 'file') process.stdout.write('\n');
  });

  parent.addCommand(command);
}

function addProfileCommand(parent: Command): void {
  const command = addCommonOptions(
    new Command('profile-card')
      .description('Render an X/Twitter profile card for a handle or profile URL.')
      .argument('<profile-url-or-handle>', 'X/Twitter profile URL, @handle, or handle.')
      .option('--fixture <path>', 'Read a saved FxEmbed profile JSON response instead of calling the API.')
      .option('--count <number>', 'Append this many profile posts below the card, 1-6. Defaults to 0.', '0')
      .option('--latest-post', 'Shortcut for --count 1.')
      .option('--with-replies', 'Include replies when fetching profile posts.'),
  );

  command.action(async (input: string, options: Record<string, unknown>) => {
    const out = await renderProfileCommand(input, options);
    console.log(out);
  });

  parent.addCommand(command);
}
