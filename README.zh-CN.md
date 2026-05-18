# Matt Skills

[English](README.md) | [简体中文](README.zh-CN.md)

面向创作者发布工作流的 Codex skills 和配套 CLI。

目前包含：

| 名称 | 类型 | 用途 |
| --- | --- | --- |
| `fxbrief` | npm CLI | 基于 FxEmbed 数据，把 X/Twitter 推文、线程、引用墙和 X 长文渲染成本地新闻素材。 |
| `fx-brief-material-renderer` | Codex skill | 在 Codex 里调用 `fxbrief`，生成推文卡片、线程长图、引用墙、X 长文 Markdown 和 X 长文长截图。 |
| `matt-pic-grab-image` | Codex skill + Bun 脚本 | 查找并缓存版权链路清楚的图片，保留来源、授权和风险元数据。 |

## fxbrief CLI

npm 包发布后安装：

```bash
npm install -g @mate-matt/fxbrief
```

也可以不全局安装，直接使用：

```bash
npx -y @mate-matt/fxbrief post-mobile "https://x.com/user/status/123" -o out.png
```

`fxbrief` 使用 Playwright 做本地截图渲染。如果环境里缺 Chromium：

```bash
npx playwright install chromium
```

常用命令：

```bash
fxbrief post-mobile "https://x.com/user/status/123" --scale 2
fxbrief post-clean "https://x.com/user/status/123" --media first --hide-stats
fxbrief thread-vertical "https://x.com/user/status/123" --max-posts 6
fxbrief quote-wall "https://x.com/user/status/123" --count 12 --width 920 --columns 2
fxbrief article-md "https://x.com/user/status/123"
fxbrief article-shot "https://x.com/user/status/123" --style article-x --slice-height 1800
```

只翻译推文正文，保留其它 UI：

```bash
fxbrief post-mobile "https://x.com/user/status/123" --lang zh-cn --translated-text
```

源码位置：

```text
packages/fxbrief
```

生成示例：

```text
examples/fxbrief
```

示例目录把 X 长文 Markdown、长文本地图片资源，以及对应的 `article-shot` 长截图输出放在 CLI 源码旁边，方便统一查看。

## Codex Skills

安装 X/FxEmbed 渲染 skill：

```text
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/fx-brief-material-renderer
```

安装图片查找 skill：

```text
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/matt-pic-grab-image
```

安装后重启 Codex，让它发现新 skill。

如果已经 clone 到本地，也可以手动安装：

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
ln -s "$PWD/skills/fx-brief-material-renderer" "${CODEX_HOME:-$HOME/.codex}/skills/fx-brief-material-renderer"
ln -s "$PWD/skills/matt-pic-grab-image" "${CODEX_HOME:-$HOME/.codex}/skills/matt-pic-grab-image"
```

## matt-pic-grab-image

按关键词或随机获取一张可商用、可二改、无需署名的图片，并自动保存本地文件、来源页、授权信息和风险提示。

示例：

```text
使用 $matt-pic-grab-image 给我一张“山水”主题图片，要求免费商用、无需署名、可二改
```

直接命令行使用：

```bash
bun run skills/matt-pic-grab-image/scripts/grab-image.ts \
  --query "history painting" \
  --mode strict_cc0 \
  --orientation landscape \
  --count 1
```

默认 `strict_cc0` 模式会优先从 CC0 / Public Domain 来源拿图，不把 Pexels、Pixabay、Unsplash 这类平台授权误写成 CC0。

## 开发

```bash
npm --prefix packages/fxbrief install
bun run fxbrief:typecheck
bun run fxbrief:test
bun run fxbrief:build
bun run validate:skills
```

渲染 fixture：

```bash
bun run fxbrief:render:fixture
```

预览 npm 包内容：

```bash
bun run fxbrief:pack
```

## 发布说明

如果要发布 `@mate-matt/fxbrief`，你需要拥有能控制 `@mate-matt` 这个 user scope 或 organization scope 的 npm 账号。公开 scoped package 发布命令是：

```bash
cd packages/fxbrief
npm publish --access public
```

npm 官方文档：<https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/>

## License

本仓库代码使用 MIT License。第三方图片、X/Twitter 内容和 FxEmbed 返回数据不由本仓库授权；发布时请保留来源链接，并根据具体使用场景复核权利风险。
