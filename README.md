# Matt Skills

[English](README.en.md) | [简体中文](README.md)

`matt-skills` 是一个面向创作者工作流的多 skills + 多 CLI 统一仓库。这里集中放 Codex skill 指令、确定性辅助脚本、npm 包、示例和文档。

## 功能模块

| 模块 | 入口 | 类型 | 能做什么 | 文档 |
| --- | --- | --- | --- | --- |
| X / Poster | `matt-x-poster` | Codex skill + Bun 脚本 | 获取真实 FxEmbed 数据，并组装 imagegen 提示词，生成电影感 X 内容海报。 | [EN](docs/matt-x-poster/README.md) / [中文](docs/matt-x-poster/README.zh-CN.md) |
| X / FxBrief | `matt-fx-brief` | Codex skill | 把 X/Twitter 推文、个人主页和 X 长文变成本地新闻/创作素材。 | [EN](docs/fx-brief/README.md) / [中文](docs/fx-brief/README.zh-CN.md) |
| X / FxBrief | `fxbrief` | npm CLI | 基于 FxEmbed 数据生成推文截图、个人主页名片、媒体引用卡、长文 Markdown、长截图和 JSON 数据。 | [EN](docs/fx-brief/README.md) / [中文](docs/fx-brief/README.zh-CN.md) |
| Image Grab | `matt-pic-grab` | Codex skill + Bun 脚本 | 查找并缓存版权链路清楚的图片，保留来源、作者、授权和风险元数据。 | [EN](docs/pic-grab/README.md) / [中文](docs/pic-grab/README.zh-CN.md) |

## X / Poster

当你想把真实 X/Twitter 个人主页、推文或 X Article 变成电影感 AI 海报时，使用 `matt-x-poster`。它通过 FxEmbed 获取真实数据，按风格组装 imagegen prompt，并在本地作者头像存在时固定执行头像-only 收尾替换。

```text
$matt-x-poster --style sunlit-sail-signal https://x.com/user/status/123
```

### 示例

| 风格 | 案例 |
| --- | --- |
| `--style lunar-flag-signal` | <img src="docs/matt-x-poster/assets/lunar-flag-signal.png" alt="lunar flag signal 海报示例" width="520"> |
| `--style seaside-plein-air-wave` | <img src="docs/matt-x-poster/assets/seaside-plein-air-wave.png" alt="seaside plein air wave 海报示例" width="360"> |
| `--style museum-archive-case` | <img src="docs/matt-x-poster/assets/museum-archive-case.png" alt="museum archive case 海报示例" width="520"> |
| `--style takeout-receipt-counter` | <img src="docs/matt-x-poster/assets/takeout-receipt-counter.png" alt="takeout receipt counter 海报示例" width="420"> |
| `--style profile-portal-3d` | <img src="docs/matt-x-poster/assets/profile-portal-3d.png" alt="profile portal 3D 海报示例" width="520"> |

可用风格：

| 风格参数 | 视觉方向 |
| --- | --- |
| `--style profile-portal-3d` | 漂浮 3D X 主页/推文传送门、玻璃卡创作者视觉卡。 |
| `--style creator-signal-stage` | 发布会、工作室、咖啡馆、展示板等发布现场。 |
| `--style seaside-plein-air-wave` | 海边画架、写实沙滩、巨浪中的内容回声。 |
| `--style sunlit-sail-signal` | 阳光海面、帆船、把 X 内容印在帆布上。 |
| `--style editorial-citation-desk` | 编辑桌、打开的书、来源卡、引用/参考视觉。 |
| `--style street-poster-wheatpaste` | 城市墙面、wheatpaste 海报、纸张和胶水纹理。 |
| `--style museum-archive-case` | 博物馆玻璃柜、档案盒、被保存的数字来源卡。 |
| `--style creator-field-notes` | 研究桌、笔记本、便利贴、创作者档案。 |
| `--style cinematic-contact-sheet` | 胶片、暗房接触印相、导演选片和编辑审片。 |
| `--style designer-pinboard` | 软木板/布板、情绪板、身份系统、色板研究。 |
| `--style skin-script-body-art` | 克制的 editorial 身体文字和临时纹身构图。 |
| `--style bathroom-mirror-sticky-note` | 浴室镜子、便利贴、晨间提醒式幽默。 |
| `--style fridge-door-magnet` | 厨房冰箱、磁贴纸条、购物清单或家庭日历式幽默。 |
| `--style elevator-notice-board` | 电梯/大厅公告栏、正式感传单或公共建筑通知。 |
| `--style laundromat-machine-note` | 自助洗衣店、洗衣机门贴、烘干机剪报或折衣桌纸条。 |
| `--style takeout-receipt-counter` | 咖啡/外卖柜台、收据、小票、纸袋标签或取餐单。 |
| `--style grand-opera-chorus` | 歌剧院舞台、节目册、唱词卡、高文化喜剧。 |
| `--style lunar-flag-signal` | 月球 EVA，X 内容印在月面旗帜上。 |
| `--style dynamic` | 每次按内容临时写入 `dynamic-style.md` 的运行时风格。 |
| `--style film-dynamic` | 每次按内容临时设计的经典电影场景机制。 |

详细安装、执行流程和风格说明：

- [Matt X Poster guide in English](docs/matt-x-poster/README.md)
- [Matt X Poster 中文教程](docs/matt-x-poster/README.zh-CN.md)

## X / FxBrief

当你需要从 X/Twitter 生成可发布素材，同时不想依赖第三方截图页面时，使用 `matt-fx-brief`。它会调用已发布的 `fxbrief` CLI，通过 FxEmbed 获取数据，用本地 React/HTML 模板和 Playwright 完成渲染截图。

核心工作流：

| 命令 | 输出 |
| --- | --- |
| `post-mobile` | 430px 移动端 X 风格截图，适合新闻引用源。 |
| `post-clean` | 媒体报道引用卡，保留来源信息，同时降低“官方截图”的观感。 |
| `profile-card` | X 个人主页名片，可选追加最新主页动态。 |
| `article-md` | X 长文导出：`article.md`、`assets/`、`metadata.json`，以及可选 raw FxEmbed 数据。 |
| `article-shot` | X 长文长截图，可输出适合社交平台的编号切片。 |
| `json` | 导出原始或规范化后的 FxEmbed 数据，适合调试和二次开发。 |

| 案例 |
| --- |
| 使用 `$matt-fx-brief` 把 `https://x.com/Google/status/2054285931260334181` 生成截图，要求截图正文是中文的。 |
| <img src="docs/fx-brief/assets/google-android-prompt.jpeg" alt="在 Codex 中请求 FxBrief 生成中文正文截图" width="520"> |
| <img src="docs/fx-brief/assets/google-android-output.jpeg" alt="FxBrief 生成后的中文正文推文截图" width="420"> |

| 个人主页名片案例 |
| --- |
| 使用 `$matt-fx-brief` 把 `https://x.com/mate_mattt` 生成个人主页名片，并只追加一条最新主页动态。 |
| <img src="docs/fx-brief/assets/mate-mattt-profile-latest.png" alt="FxBrief 生成的 Matt X 个人主页名片" width="420"> |

详细安装、案例、命令参数、输出结构和截图展示：

- [FxBrief guide in English](docs/fx-brief/README.md)
- [FxBrief 中文教程](docs/fx-brief/README.zh-CN.md)

## Image Grab

当你需要给封面、文章配图、演示稿、社交媒体或背景图找素材，并希望保留清晰的来源链路时，使用 `matt-pic-grab`。默认模式优先选择 CC0 / Public Domain 来源，不会把 Pexels、Pixabay、Unsplash 这类平台授权误写成 CC0。

| 案例 |
| --- |
| 使用 `$matt-pic-grab` 给我一张“山水”主题图片，要求免费商用、无需署名、可二改。 |
| <img src="docs/assets/example-shanshui-landscape.jpg" alt="Public-domain 山水图片示例" width="420"> |

直接脚本示例：

```bash
bun run skills/matt-pic-grab/scripts/grab-image.ts \
  --query "山水" \
  --fallback-query "Chinese landscape painting" \
  --mode strict_cc0 \
  --orientation landscape \
  --count 1
```

详细安装、案例、来源策略、脚本参数和输出字段：

- [Pic Grab guide in English](docs/pic-grab/README.md)
- [Pic Grab 中文教程](docs/pic-grab/README.zh-CN.md)

## 手动安装 Skill

安装后重启 Codex，让它发现新 skill。

从 GitHub 安装：

```text
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/matt-fx-brief
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/matt-pic-grab
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/matt-x-poster
```

如果已经 clone 到本地，也可以手动安装：

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
ln -s "$PWD/skills/matt-fx-brief" "${CODEX_HOME:-$HOME/.codex}/skills/matt-fx-brief"
ln -s "$PWD/skills/matt-pic-grab" "${CODEX_HOME:-$HOME/.codex}/skills/matt-pic-grab"
ln -s "$PWD/skills/matt-x-poster" "${CODEX_HOME:-$HOME/.codex}/skills/matt-x-poster"
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
