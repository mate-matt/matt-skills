# Matt Skills

[English](README.md) | [简体中文](README.zh-CN.md)

面向创作者发布工作流的 Codex skills 和配套 CLI。

当前仓库分成两个清晰模块：

| 模块 | 入口 | 类型 | 用途 |
| --- | --- | --- | --- |
| X / FxBrief | `fxbrief` | npm CLI | 基于 FxEmbed 数据，把 X/Twitter 推文和 X 长文渲染成本地新闻素材。 |
| X / FxBrief | `matt-fx-brief-material-renderer` | Codex skill | 在 Codex 里调用 `fxbrief`，生成推文卡片、媒体引用卡、X 长文 Markdown 和 X 长文长截图。 |
| Image Grab | `matt-pic-grab-image` | Codex skill + Bun 脚本 | 查找并缓存版权链路清楚的图片，保留来源、授权和风险元数据。 |

## X / FxBrief 模块

`fxbrief` 是 X/Twitter 素材渲染 CLI。它通过 FxEmbed 获取数据，用 React 模板生成本地 HTML，再通过 Playwright 截图；X 长文也可以导出 Markdown、本地图片资源和元数据。

当前推荐公开使用的四个工作流：

| 命令 | 输出 |
| --- | --- |
| `post-mobile` | 430px 移动端 X 风格截图，适合新闻引用源。 |
| `post-clean` | 媒体报道引用卡，保留来源信息，同时降低“官方截图”的观感。 |
| `article-md` | X 长文导出：`article.md`、`assets/`、`metadata.json`，以及可选 raw FxEmbed 数据。 |
| `article-shot` | X 长文长截图，可输出适合社交平台的编号切片。 |

安装 CLI。X/FxBrief skill 需要 `fxbrief` `0.2.1` 或更新版本，因为这个版本包含 `post-mobile`、`post-clean`、`article-md`、`article-shot` 四个核心命令：

```bash
npm install -g @mate-matt/fxbrief@latest
fxbrief --version
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
fxbrief article-md "https://x.com/user/status/123"
fxbrief article-shot "https://x.com/user/status/123" --style article-x --width 540 --scale 2
fxbrief article-shot "https://x.com/user/status/123" --style article-x --slice-height 1800 --out output/my-article
```

只翻译推文正文，保留其它 UI：

```bash
fxbrief post-mobile "https://x.com/user/status/123" --lang zh-cn --translated-text
```

安装 Codex skill：

```text
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/matt-fx-brief-material-renderer
```

示例请求：

```text
使用 $matt-fx-brief-material-renderer 将这篇 X 长文生成完整长截图和 3 张切片：https://x.com/user/status/123
```

源码位置：

```text
packages/fxbrief
```

生成示例：

```text
examples/fxbrief
```

## Image Grab 模块

这个模块和 X/FxBrief 是两条独立能力线。`matt-pic-grab-image` 按关键词或随机获取可商用、可二改、无需署名的图片，并自动保存本地文件、来源页、授权信息和风险提示。

安装 Codex skill：

```text
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/matt-pic-grab-image
```

示例请求：

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

## 手动安装 Skill

安装后重启 Codex，让它发现新 skill。

如果已经 clone 到本地，也可以手动安装：

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
ln -s "$PWD/skills/matt-fx-brief-material-renderer" "${CODEX_HOME:-$HOME/.codex}/skills/matt-fx-brief-material-renderer"
ln -s "$PWD/skills/matt-pic-grab-image" "${CODEX_HOME:-$HOME/.codex}/skills/matt-pic-grab-image"
```

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

如果要发布 `@mate-matt/fxbrief`，你需要拥有能控制 `@mate-matt` organization scope 的 npm 账号。公开 scoped package 发布命令是：

```bash
cd packages/fxbrief
npm publish --access public
```

npm 官方文档：<https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/>

## License

本仓库代码使用 MIT License。第三方图片、X/Twitter 内容和 FxEmbed 返回数据不由本仓库授权；发布时请保留来源链接，并根据具体使用场景复核权利风险。
