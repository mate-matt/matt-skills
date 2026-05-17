# Matt Pic Grab Image

按关键词或随机获取一张**可商用、可二改、无需署名**的图片，并自动保存本地文件、来源页、授权信息和风险提示。

默认使用 `strict_cc0` 模式：优先从 CC0 / Public Domain 来源拿图，不把 Pexels、Pixabay、Unsplash 这类平台授权误写成 CC0。

![山水主题示例](docs/assets/example-shanshui-landscape.jpg)

## 适合谁用

- 写文章、做封面、发社交平台，需要一张能放心使用的配图。
- 做推文截图、公众号头图、Notion/Slides 背景，需要本地缓存图片。
- 用 Codex 写内容，希望一句话拿到图片、来源、授权和本地路径。
- 想区分「免费商用」和「CC0 / Public Domain」，不想在版权链路上糊弄自己。

## 你会得到什么

一次调用会返回：

- 高清图片 URL
- 本地缓存路径
- 来源页 URL
- 授权类型和授权链接
- 作者、馆藏或来源信息
- 风险提示，例如人物、商标、Openverse 聚合来源提醒
- 完整 JSON 元数据，方便之后引用和复查

示例输出重点字段：

```json
{
  "provider": "met",
  "title": "Landscape",
  "creator": "Unidentified artist",
  "image_url": "https://images.metmuseum.org/CRDImages/as/original/DP156857.jpg",
  "source_url": "https://www.metmuseum.org/art/collection/search/51378",
  "license": "CC0 / Public Domain",
  "local_path": "~/.cache/matt-pic-grab-image/images/met/51378-Landscape.jpg",
  "metadata_path": "~/.cache/matt-pic-grab-image/meta/met-51378.json",
  "risk_flags": []
}
```

## 安装

下载或克隆本仓库后，在仓库根目录执行：

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
ln -s "$PWD/skills/matt-pic-grab-image" "${CODEX_HOME:-$HOME/.codex}/skills/matt-pic-grab-image"
```

需要本机安装 Bun：

```bash
bun --version
```

## 用 Codex 调用

直接用自然语言：

```text
使用 $matt-pic-grab-image 给我一张“山水”主题图片，要求免费商用、无需署名、可二改
```

```text
Use $matt-pic-grab-image to find a CC0 history painting for an article cover.
```

```text
使用 $matt-pic-grab-image 随机找一张可商用的自然风景背景图，并保存本地
```

Codex 会自动决定关键词 fallback、数据源顺序和返回说明。中文关键词会保留原文，同时补一个英文 fallback，提高命中率。

## 直接命令行使用

山水主题：

```bash
bun run skills/matt-pic-grab-image/scripts/grab-image.ts \
  --query "山水" \
  --fallback-query "Chinese landscape painting" \
  --mode strict_cc0 \
  --provider met,openverse \
  --orientation landscape \
  --count 1 \
  --seed shanshui-commercial-safe
```

历史题材：

```bash
bun run skills/matt-pic-grab-image/scripts/grab-image.ts \
  --query "history painting" \
  --mode strict_cc0 \
  --orientation landscape \
  --count 1
```

随机背景：

```bash
bun run skills/matt-pic-grab-image/scripts/grab-image.ts \
  --random \
  --mode strict_cc0 \
  --orientation landscape
```

只返回 URL 和元数据，不下载图片：

```bash
bun run skills/matt-pic-grab-image/scripts/grab-image.ts \
  --query "botanical illustration" \
  --mode strict_cc0 \
  --no-download
```

也可以用 package scripts：

```bash
bun run pic:shanshui
bun run pic:history
bun run pic:random
```

## 案例

### 1. 中文关键词：山水

Prompt:

```text
使用 $matt-pic-grab-image 给我一张“山水”主题图片，要求免费商用、无需署名、可二改
```

Result:

![山水主题示例](docs/assets/example-shanshui-landscape.jpg)

- 标题：Landscape
- 来源：The Metropolitan Museum of Art Open Access
- 授权：CC0 / Public Domain
- 图片 URL：`https://images.metmuseum.org/CRDImages/as/original/DP156857.jpg`
- 来源页：`https://www.metmuseum.org/art/collection/search/51378`
- 风险提示：`risk_flags` 为空

### 2. 历史题材封面

Prompt:

```text
Use $matt-pic-grab-image to find a CC0 historical painting for a cover.
```

Result:

![历史题材示例](docs/assets/example-history-socrates.webp)

适合历史文章、读书笔记、思想史主题封面。若结果来自 Openverse，输出会保留聚合来源提醒，方便高强度商业使用前复核原始来源页。

### 3. 随机自然背景

Command:

```bash
bun run pic:random
```

Result:

![自然背景示例](docs/assets/example-mountain-landscape.jpg)

适合做文章分隔图、推文长截图背景、Slides 章节页。

## 两种授权模式

### `strict_cc0`

默认模式。适合「版权安全优先」的内容生产。

数据源：

- Openverse：只筛 `license=cc0`
- The Met Open Access：只取 `isPublicDomain=true`
- Smithsonian Open Access：可选，需要 `SMITHSONIAN_API_KEY`

### `stock_beauty`

仅在你明确接受平台图库授权时使用。它更偏现代 stock-photo 审美，但不是 CC0。

```bash
bun run skills/matt-pic-grab-image/scripts/grab-image.ts \
  --query "workspace" \
  --mode stock_beauty \
  --provider pexels,pixabay \
  --orientation landscape
```

需要：

```bash
PEXELS_API_KEY=
PIXABAY_API_KEY=
```

输出会标注为 `Pexels License` 或 `Pixabay Content License`，不会写成 CC0。

## 参数

| 参数 | 说明 |
| --- | --- |
| `--query "text"` | 关键词搜索 |
| `--fallback-query "text"` | 备用关键词，可重复使用 |
| `--random` | 随机拿图 |
| `--mode strict_cc0\|stock_beauty` | 授权模式，默认 `strict_cc0` |
| `--provider openverse,met` | 指定数据源顺序 |
| `--orientation landscape` | 横图 |
| `--orientation portrait` | 竖图 |
| `--orientation square` | 方图 |
| `--orientation any` | 不限制方向 |
| `--count 1` | 返回数量，1 到 10 |
| `--cache-dir PATH` | 指定缓存目录 |
| `--no-download` | 不下载，只返回 URL 和元数据 |
| `--seed VALUE` | 固定随机结果，方便复现 |

## 缓存

默认缓存目录：

```text
~/.cache/matt-pic-grab-image
```

图片文件：

```text
~/.cache/matt-pic-grab-image/images/{provider}/...
```

元数据文件：

```text
~/.cache/matt-pic-grab-image/meta/{provider}-{id}.json
```

可以通过环境变量覆盖：

```bash
export MATT_PIC_GRAB_CACHE_DIR="/your/cache/path"
```

## 可选 API Key

默认不需要 key 也能用 Openverse 和 The Met。

如果你需要更稳定或更多来源：

```bash
cp .env.example .env
```

支持：

- `OPENVERSE_CLIENT_ID`
- `OPENVERSE_CLIENT_SECRET`
- `SMITHSONIAN_API_KEY`
- `PEXELS_API_KEY`
- `PIXABAY_API_KEY`
- `MATT_PIC_GRAB_CACHE_DIR`

## 版权说明

这个项目的代码使用 MIT License。

图片不由本项目授权。Skill 会尽量筛选 CC0 / Public Domain 元数据，并保存来源页与授权链接。但 CC0 / Public Domain 主要解决版权问题，不自动清除商标权、肖像权、隐私权、私人财产权或现代艺术品等额外风险。

如果用于广告、商品包装、大规模商业分发等高强度用途，请打开 `source_url` 再做一次人工复核。

## 验证

```bash
bun run validate:pic-skill
bun run pic:help
bun run pic:shanshui
```
