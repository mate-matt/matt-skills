# X / FxBrief 中文教程

[English](README.md) | [简体中文](README.zh-CN.md)

`matt-fx-brief` 是把 X/Twitter 推文和 X 长文转换为本地编辑素材的 Codex skill。真正可重复执行的工作由已发布的 `fxbrief` CLI 完成。

## 可以生成什么

| 工作流 | 命令 | 输出 |
| --- | --- | --- |
| 移动端推文截图 | `post-mobile` | 430px X 风格新闻引用卡。 |
| 干净媒体引用卡 | `post-clean` | 更像报道配图，降低“官方截图”观感，同时保留来源。 |
| 个人主页名片 | `profile-card` | 把 X 个人主页做成本地渲染的创作者名片。 |
| X 长文 Markdown 归档 | `article-md` | `article.md`、本地 `assets/`、`metadata.json`，以及可选 raw FxEmbed 数据。 |
| X 长文长截图 | `article-shot` | 完整长截图，也可以切成适合社交平台发布的编号图片。 |
| 原始数据导出 | `json` | FxEmbed 原始 JSON，或 fxbrief 规范化后的本地 JSON 模型。 |

## 安装要求

安装 CLI：

```bash
npm install -g @mate-matt/fxbrief@latest
fxbrief --version
```

请使用 `fxbrief` `0.2.4` 或更新版本。这个版本包含 skill 需要的核心工作流、个人主页名片、默认隐藏 post-mobile 的 Subscribe 按钮，并支持导出 FxEmbed 原始 JSON。

截图渲染使用 Playwright。如果本机还没有 Chromium，先安装一次：

```bash
npx playwright install chromium
```

安装 Codex skill：

```text
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/matt-fx-brief
```

安装 skill 后重启 Codex。

## 快速示例

生成移动端推文卡：

```bash
fxbrief post-mobile "https://x.com/user/status/123" --scale 2
```

只有在你已经确认账号提供订阅入口时，才显示移动端 Subscribe 按钮：

```bash
fxbrief post-mobile "https://x.com/user/status/123" --scale 2 --show-subscribe
```

只把推文正文翻译成中文，名称、数据、时间和 UI 保持原样：

```bash
fxbrief post-mobile "https://x.com/Google/status/2054285931260334181" \
  --lang zh-cn \
  --translated-text \
  --out output/google-android-chinese.png
```

生成更干净的媒体引用卡：

```bash
fxbrief post-clean "https://x.com/user/status/123" --media first --hide-stats
```

生成个人主页名片：

```bash
fxbrief profile-card "https://x.com/user" --width 430 --scale 2
```

生成个人主页名片，并只追加一条最新主页动态：

```bash
fxbrief profile-card "https://x.com/mate_mattt" \
  --latest-post \
  --width 600 \
  --scale 2 \
  --out output/mate-mattt-profile.png
```

生成个人主页名片，并在下方接更长的主页动态列表：

```bash
fxbrief profile-card "https://x.com/user" --count 3 --width 600 --scale 2
```

导出 X 长文 Markdown：

```bash
fxbrief article-md "https://x.com/user/status/123"
```

生成 X 长文长截图和切片：

```bash
fxbrief article-shot "https://x.com/user/status/123" \
  --style article-x \
  --width 540 \
  --scale 2 \
  --slice-height 1800 \
  --out output/my-article
```

只获取 FxEmbed 原始 JSON，不渲染截图：

```bash
fxbrief json "https://x.com/user/status/123"
```

导出规范化后的线程 JSON：

```bash
fxbrief json "https://x.com/user/status/123" --kind thread --normalized --out output/json
```

## 具体案例

| 案例 |
| --- |
| 使用 `$matt-fx-brief` 把 `https://x.com/Google/status/2054285931260334181` 生成截图，要求截图正文是中文的。 |
| <img src="assets/google-android-prompt.jpeg" alt="在 Codex 中请求 FxBrief skill 生成中文正文截图" width="560"> |
| <img src="assets/google-android-output.jpeg" alt="生成后的 Google Android 中文正文推文截图" width="430"> |

| 个人主页名片案例 |
| --- |
| 使用 `$matt-fx-brief` 把 `https://x.com/mate_mattt` 生成创作者主页名片，并只追加一条最新主页动态。 |
| <img src="assets/mate-mattt-profile-latest.png" alt="FxBrief 生成的 Matt X 个人主页名片" width="430"> |

其他常用请求：

```text
使用 $matt-fx-brief 将这篇 X 长文导出为 Markdown，并把图片资源保存到本地：https://x.com/user/status/123
使用 $matt-fx-brief 将这篇 X 长文生成完整长截图和至少 3 张切分图：https://x.com/user/status/123
使用 $matt-fx-brief 将这个 X 个人主页生成一张创作者名片，并带一条最新主页动态：https://x.com/mate_mattt
```

## 输出位置

如果没有传 `--out`，截图默认写入 `output/`，文件名带模板名、状态 id 和时间戳。

`article-md` 默认输出：

```text
output/articles/<status-id>/
  article.md
  metadata.json
  raw.fxembed.json
  assets/
    cover.jpg
    image-01.jpg
```

当 `article-shot --slice-height` 和输出目录一起使用时，目录里会包含完整长图和编号切片：

```text
output/my-article/
  article-long.png
  article-01.png
  article-02.png
  article-03.png
```

## 常用参数

- `--out <path>`：输出文件路径；没有扩展名时视为输出目录。
- `--format <png|webp>`：截图格式。
- `--width <px>`：CSS 像素宽度。
- `--scale <number>`：设备缩放倍数，默认 `2`。
- `--timezone <tz>`：渲染时间时区，默认 `Asia/Shanghai`。
- `--lang <code>`：请求 FxEmbed 翻译。
- `--translated-text`：用翻译正文替换原始正文。
- `--show-translation`：同时显示原文和译文。
- `--media <none|first|grid|mosaic|full>`：媒体展示模式。
- `--hide-source-footer`：隐藏来源 footer。
- `--debug-html`：保存中间 HTML，便于调试。

JSON 导出可使用 `--kind post|thread|quotes`、`--normalized`、`--compact` 和 `--out <path>`。`json` 命令不使用 Playwright，也不会下载媒体资源。

个人主页名片默认不接推文。需要时加 `--count <1-6>`，会在名片底部追加主页动态列表；`--latest-post` 等价于 `--count 1`。如果回复也可以被选中，再加 `--with-replies`。FxEmbed 当前能返回主页 statuses，但没有可靠的置顶推文字段。

## Skill 路由说明

X/FxEmbed 相关能力统一使用一个 skill：`matt-fx-brief`。如果输入是个人主页 URL 或 handle，走 `profile-card`。如果输入是 status URL，再按目标分流：普通截图走 `post-mobile` 或 `post-clean`；X 长文归档走 `article-md`；长截图或切片走 `article-shot`；调试、元数据或二次开发数据走 `json`。如果用户只给了 status URL，且普通推文和 X Article 的区别会影响结果，先用 `fxbrief json "<url>" --normalized` 看数据，再决定最终命令。

## 注意事项

除非你的文章版式里已经有等价来源标注，否则建议保留 source footer。这个项目不隶属于 X/Twitter 或 FxEmbed。第三方推文内容、图片和视频不由本仓库授权。
