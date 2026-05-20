# Pic Grab 中文教程

[English](README.md) | [简体中文](README.zh-CN.md)

`matt-pic-grab` 帮 Codex 查找并缓存来源链路清楚的图片。适合封面、文章配图、社交媒体、截图背景、设计参考等场景。

默认策略偏保守：优先选择 CC0 / Public Domain 来源，并保存来源、作者、授权、本地路径、元数据路径和风险标记。

## 安装要求

内置脚本使用 Bun 运行：

```bash
bun --version
```

安装 Codex skill：

```text
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/matt-pic-grab
```

安装 skill 后重启 Codex。

## 主要模式

| 模式 | 适用场景 |
| --- | --- |
| `strict_cc0` | 默认模式。适合商业发布、可复用封面、公开帖子、演示稿，以及明确要求 CC0 / Public Domain / 无需署名的场景。 |
| `stock_beauty` | 只有当用户明确接受平台图库授权、并且更看重现代图库审美时才使用。 |

这个 skill 不会把 Pexels、Pixabay、Unsplash 这类平台授权描述成 CC0。

## 具体案例

| 案例 |
| --- |
| 使用 `$matt-pic-grab` 给我一张“山水”主题图片，要求免费商用、无需署名、可二改。 |
| <img src="../assets/example-shanshui-landscape.jpg" alt="Public-domain 山水图片示例" width="420"> |

直接脚本命令：

```bash
bun run skills/matt-pic-grab/scripts/grab-image.ts \
  --query "山水" \
  --fallback-query "Chinese landscape painting" \
  --mode strict_cc0 \
  --orientation landscape \
  --count 1
```

| 案例 |
| --- |
| 使用 `$matt-pic-grab` 给文章封面找一张 CC0 历史绘画。 |
| <img src="../assets/example-history-socrates.webp" alt="Public-domain 历史绘画示例" width="420"> |

英文关键词命令：

```bash
bun run skills/matt-pic-grab/scripts/grab-image.ts \
  --query "history painting" \
  --mode strict_cc0 \
  --orientation landscape \
  --count 1
```

随机获取安全图片：

```bash
bun run skills/matt-pic-grab/scripts/grab-image.ts \
  --random \
  --mode strict_cc0 \
  --orientation landscape
```

## 输出结果

脚本会把 JSON 写入 stdout：

```json
{
  "ok": true,
  "mode": "strict_cc0",
  "results": [
    {
      "provider": "openverse",
      "image_url": "https://...",
      "source_url": "https://...",
      "license": "CC0",
      "creator": "Unknown",
      "local_path": "/Users/.../.cache/matt-pic-grab/images/openverse/...",
      "metadata_path": "/Users/.../.cache/matt-pic-grab/meta/openverse-id.json",
      "risk_flags": []
    }
  ]
}
```

向用户汇报时，应该给出本地文件路径、来源页、授权、作者和风险提示。

## 常用参数

- `--query "text"`：关键词搜索。
- `--fallback-query "text"`：备用关键词，中文输入时很有用。
- `--random`：从安全通用主题中随机选择。
- `--mode strict_cc0|stock_beauty`：默认 `strict_cc0`。
- `--provider openverse,met,smithsonian,pexels,pixabay`：覆盖 provider 顺序。
- `--orientation landscape|portrait|square|any`：默认 `landscape`。
- `--count 1..10`：默认 `1`。
- `--cache-dir PATH`：默认 `$MATT_PIC_GRAB_CACHE_DIR`、`$PIC_GRAB_CACHE_DIR` 或 `~/.cache/matt-pic-grab`。
- `--no-download`：只返回 URL 和元数据，不下载图片。
- `--seed VALUE`：让随机选择可复现。

## 可选 API Key

- `OPENVERSE_CLIENT_ID` 和 `OPENVERSE_CLIENT_SECRET`：提高 Openverse 限额。
- `SMITHSONIAN_API_KEY`：启用 Smithsonian Open Access。
- `PEXELS_API_KEY`：在 `stock_beauty` 模式启用 Pexels。
- `PIXABAY_API_KEY`：在 `stock_beauty` 模式启用 Pixabay。

## 来源策略

provider 细节和风险处理见 [`source-policy.md`](../../skills/matt-pic-grab/references/source-policy.md)。

如果是高风险商业使用，即使返回授权看起来宽松，也建议人工打开保存的来源页复核。
